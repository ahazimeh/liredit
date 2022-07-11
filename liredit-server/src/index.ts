import "reflect-metadata";
import "dotenv-safe/config";
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
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from "graphql-query-complexity";
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
    // url: process.env.DATABASE_URL, // rather than setting port, username, and password
    database: "lirredit2", //
    entities: [Post, User, Updoot],
    synchronize: true, // turn this off for prod
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
  const redis = new Redis(process.env.REDIS_URL);
  // cookies work on a proxy environment
  app.set("trust proxy", 1); // 1 proxy

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
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
        domain: __prod__ ? ".codeponder.com" : undefined, // if you run a problem of not forwarding cookie
        //added . before codeponder.com so it works for all domains under codeponder.com domain
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );
  let schema = await buildSchema({
    resolvers: [HelloResolver, PostResolver, UserResolver],
    validate: false,
  });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }): MyContext => ({
      DataSource: AppDataSource,
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        // options
      }),
      {
        requestDidStart: () => ({
          didResolveOperation({ request, document }: any) {
            /**
             * This provides GraphQL query analysis to be able to react on complex queries to your GraphQL server.
             * This can be used to protect your GraphQL servers against resource exhaustion and DoS attacks.
             * More documentation can be found at https://github.com/ivome/graphql-query-complexity.
             */
            const complexity = getComplexity({
              // Our built schema
              schema,
              // To calculate query complexity properly,
              // we have to check only the requested operation
              // not the whole document that may contains multiple operations
              operationName: request.operationName,
              // The GraphQL query document
              query: document,
              // The variables for our GraphQL query
              variables: request.variables,
              // Add any number of estimators. The estimators are invoked in order, the first
              // numeric value that is being returned by an estimator is used as the field complexity.
              // If no estimator returns a value, an exception is raised.
              estimators: [
                // Using fieldExtensionsEstimator is mandatory to make it work with type-graphql.
                fieldExtensionsEstimator(),
                // Add more estimators here...
                // This will assign each field a complexity of 1
                // if no other estimator returned a value.
                simpleEstimator({ defaultComplexity: 1 }),
              ],
            });
            // Here we can react to the calculated complexity,
            // like compare it with max and throw error when the threshold is reached.
            if (complexity > 20) {
              throw new Error(
                `Sorry, too complicated query! ${complexity} is over 20 that is the max allowed complexity.`
              );
            }
            // And here we can e.g. subtract the complexity point from hourly API calls limit.
            console.log("Used query complexity points:", complexity);
          },
        }),
      },
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
  app.listen(process.env.PORT, () => {
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
