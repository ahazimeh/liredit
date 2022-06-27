// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType() //to be able to use it as return type
@Entity() //corresponds to db table
export class User {
  @Field() //to expose the field
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt?: Date; // = new Date();

  @Field(() => String)
  @UpdateDateColumn(/*{ type: "date", onUpdate: () => new Date() }*/)
  updatedAt? = new Date();

  @Field()
  @Column({ type: "text", unique: true }) //removing this means it is just a field in the class and not a column
  username!: string;

  @Field()
  @Column({ type: "text", unique: true }) //removing this means it is just a field in the class and not a column
  email!: string;

  @Column({ type: "text" }) //removing this means it is just a field in the class and not a column
  password!: string;
}
