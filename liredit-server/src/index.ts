import "reflect-metadata";
// import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
// redis@v4
// import { createClient } from "redis";
import Redis from "ioredis";
import { MyContext } from "./types";
// import { sendEmail } from "./utils/sendMail";
// import { User } from "./entities/User";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
declare module "express-session" {
  export interface SessionData {
    userId: number;
    // user: { [key: string]: any };
  }
}
const main = async () => {
  // sendEmail("hazimeh95@gmail.com", "hello there");
  const AppDataSource = new DataSource({
    type: "postgres", //
    host: "localhost",
    port: 5432,
    username: "lireddit2", ///
    password: "admin", ///
    database: "lirredit2", //
    entities: [Post, User, Updoot],
    synchronize: true,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap
  AppDataSource.initialize()
    .then(async () => {
      // await Post.delete({});
      AppDataSource.runMigrations();
      // here you can start to work with your database
    })
    .catch((error) => console.log(error));
  // const orm = await MikroORM.init(microConfig);
  // await orm.em.nativeDelete(User, {});
  // await orm.getMigrator().up();
  const app = express();

  const RedisStore = connectRedis(session);

  // const redis = createClient({ legacyMode: true }); //
  // redis.connect().catch(console.error); //
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // to google (csrf)
        secure: __prod__, // https
      },
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      DataSource: AppDataSource,
      req,
      res,
      redis,
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        // options
      }),
    ],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    // cors: {
    //   origin: "http://localhost:3000",
    //   credentials: true,
    // },
    cors: false,
  });
  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
  // const post = (await orm).em.create(Post, { title: "zz" });
  // (await orm).em.persistAndFlush(post);
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main().catch((err) => {
  console.log(err);
});
