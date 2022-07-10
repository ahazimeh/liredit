// import { Connection, IDatabaseDriver, EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";
import DataLoader from "dataloader";
import { User } from "./entities/User";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
export type MyContext = {
  // em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
  redis: Redis;
  DataSource: DataSource;
  // redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>; //DataLoader<number, User, number>;
  updootLoader: ReturnType<typeof createUpdootLoader>; //DataLoader<number, User, number>;
};
