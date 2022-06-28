// import { Connection, IDatabaseDriver, EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";
export type MyContext = {
  // em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
  redis: Redis;
  DataSource: DataSource;
  // redis: Redis;
};
