// import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

@ObjectType() //to be able to use it as return type
@Entity() //corresponds to db table
export class Post extends BaseEntity {
  // extends BaseEntity so we can use easy commands such as Post.find()
  @Field() //to expose the field
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: "text" }) //removing this means it is just a field in the class and not a column
  title!: string;

  @Field()
  @Column({ type: "text" }) //removing this means it is just a field in the class and not a column
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 }) //removing this means it is just a field in the class and not a column
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts, {
    // eager: true,
  })
  // @JoinColumn({ name: "creatorId" })
  creator: User;

  @Field(() => [Updoot])
  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn({
    /*type: "date"*/
    // adding it will convert it to a date rather than a number
  })
  createdAt?: Date; /*= new Date();*/

  @Field(() => String)
  @UpdateDateColumn({
    /*type: "date"*/
    /*, onUpdate: () => new Date() */
  })
  updatedAt?: Date; /*= new Date();*/
}
