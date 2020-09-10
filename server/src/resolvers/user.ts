import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import {
  MyApolloContext,
  UserResponse,
  MyCredintialsValidationErrors,
  LoginInput,
  RegisterInput,
} from "../types";
import { User } from "../enteties/User";
import argon2 from "argon2";
import {
  AuthenticationError,
  ApolloError,
  UserInputError,
} from "apollo-server-express";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { v4 } from "uuid";
import validator from "validator";
import { sendEmail } from "../utils/sendEmail";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyApolloContext) {
    if (!req.session.userId) {
      // You are not logged in
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegisterInput,
    @Ctx() { req }: MyApolloContext
  ): Promise<UserResponse> {
    validateRegister(options);

    const { username, email, password } = options;

    if (await User.findOne({ where: { username } })) {
      throw new ApolloError("Username already taken", "400");
    }

    if (await User.findOne({ where: { email } })) {
      throw new ApolloError("E-mail address already taken", "400");
    }

    const hashedPassword = await argon2.hash(password);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    }).save();

    // Store userId session
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") { username, password }: LoginInput,
    @Ctx() { req }: MyApolloContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new AuthenticationError("Invalid username or password");
    }

    // Store userId session
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyApolloContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.debug(err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyApolloContext
  ) {
    const validationErrors: MyCredintialsValidationErrors = {};
    if (!validator.isEmail(email)) {
      validationErrors.email = "Must be a valid e-mail address";
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new UserInputError("Failed to register due to validation errors", {
        validationErrors,
      });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = v4();

    redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3 // 3 days
    );

    console.log(`<${FORGET_PASSWORD_PREFIX}${token}>`);

    await sendEmail(
      email,
      "Reset password",
      `Reset password <a href="http://localhost:3000/change-password/${token}">here</a>.`
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("password") password: string,
    @Ctx() { redis, req }: MyApolloContext
  ): Promise<UserResponse> {
    const validationErrors: MyCredintialsValidationErrors = {};
    if (password.length <= 2) {
      validationErrors.password = "Password length must be greater than 2";
    }
    if (Object.keys(validationErrors).length > 0) {
      throw new UserInputError(
        "Failed to change password due to validation errors",
        {
          validationErrors,
        }
      );
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      throw new ApolloError("Token invalid or expired");
    }

    const userIdNum = parseInt(userId);

    const user = await User.findOne(userIdNum);

    if (!user) {
      throw new ApolloError("User no longer exists", "500");
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(password) }
    );

    redis.del(key);

    // Log in user after change password
    req.session.userId = user.id;

    return { user };
  }
}
