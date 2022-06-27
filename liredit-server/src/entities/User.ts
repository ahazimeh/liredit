import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() //to be able to use it as return type
@Entity() //corresponds to db table
export class User {
  @Field() //to expose the field
  @PrimaryKey()
  id: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt? = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt? = new Date();

  @Field()
  @Property({ type: "text", unique: true }) //removing this means it is just a field in the class and not a column
  username!: string;

  @Field()
  @Property({ type: "text", unique: true }) //removing this means it is just a field in the class and not a column
  email!: string;

  @Property({ type: "text" }) //removing this means it is just a field in the class and not a column
  password!: string;
}
