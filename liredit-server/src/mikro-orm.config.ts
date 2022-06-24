import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
  },
  allowGlobalContext: true,
  entities: [Post], // no need for `entitiesTs` this way
  dbName: "lireddit1",
  type: "postgresql", // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  debug: !__prod__, //to debug what sequel is being executed
  user: "myuser",
  password: "admin",
} as Parameters<typeof MikroORM.init>[0];
