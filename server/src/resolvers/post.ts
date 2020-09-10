import {
  Resolver,
  Query,
  Int,
  Arg,
  Mutation,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../enteties/Post";
import { MyApolloContext, PostInput } from "../types";
import { isAuth } from "../middleware/isAuth";
import { pickBy, identity } from "lodash";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyApolloContext
  ): Promise<Post | undefined> {
    return await Post.create({
      ...options,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("options", () => PostInput, { nullable: true }) options: PostInput
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id);
    if (!post) {
      return post;
    }

    const updates = pickBy(options, identity);
    await Post.update({ id }, updates);

    Object.assign(post, updates);

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
