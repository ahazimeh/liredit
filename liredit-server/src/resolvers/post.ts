import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
// import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  // ...
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    // await sleep(3000);
    return Post.find();
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOneBy({
      id,
    });
  }

  @Mutation(() => Post)
  async createPosts(@Arg("title", () => String) title: string): Promise<Post> {
    // 2 sql queries
    return Post.create({ title }).save();
  }
  @Mutation(() => Post, { nullable: true })
  async updatePosts(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePosts(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
