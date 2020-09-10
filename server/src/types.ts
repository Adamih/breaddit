import { Request } from "express";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { InputType, Field, ObjectType } from "type-graphql";
import { Redis } from "ioredis";
import { User } from "./enteties/User";

export type MyExpressContext = ExpressContext & {
  req: Request & { session: Express.Session };
};

export type MyApolloContext = ExpressContext & {
  req: Request & { session: Express.Session };
  redis: Redis;
};

export type MyCredintialsValidationErrors = {
  username?: String;
  email?: String;
  password?: String;
};

// GraphQL types

@InputType()
class LoginInput {
  @Field()
  username: string;
  @Field()
  password: string;
}
export { LoginInput };

@InputType()
class RegisterInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
export { RegisterInput };

@ObjectType()
class UserResponse {
  @Field(() => User)
  user: User;
}
export { UserResponse };

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}
export { PostInput };
