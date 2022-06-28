// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType() //to be able to use it as return type
@Entity() //corresponds to db table
export class Post extends BaseEntity {
  // extends BaseEntity so we can use easy commands such as Post.find()
  @Field() //to expose the field
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt?: Date; /*= new Date();*/

  @Field(() => String)
  @UpdateDateColumn({ type: "date" /*, onUpdate: () => new Date() */ })
  updatedAt?: Date; /*= new Date();*/

  @Field()
  @Column({ type: "text" }) //removing this means it is just a field in the class and not a column
  title!: string;
}
