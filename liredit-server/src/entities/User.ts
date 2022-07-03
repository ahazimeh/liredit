// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType() //to be able to use it as return type
@Entity() //corresponds to db table
export class User extends BaseEntity {
  @Field() //to expose the field
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: "text", unique: true }) //removing this means it is just a field in the class and not a column
  username!: string;

  @Field()
  @Column({ type: "text", unique: true }) //removing this means it is just a field in the class and not a column
  email!: string;

  @Column({ type: "text" }) //removing this means it is just a field in the class and not a column
  password!: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.creator, { lazy: true })
  posts: Post[];

  @Field(() => [Updoot])
  @OneToMany(() => Updoot, (updoot) => updoot.user)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn({
    /*type: "date"*/
  })
  createdAt?: Date; // = new Date();

  @Field(() => String)
  @UpdateDateColumn(/*{ type: "date", onUpdate: () => new Date() }*/)
  updatedAt?: Date;
}
