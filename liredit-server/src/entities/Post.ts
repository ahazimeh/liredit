import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity() //corresponds to db table
export class Post {
  @PrimaryKey()
  id: number;

  @Property()
  createdAt? = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt? = new Date();

  @Property() //removing this means it is just a field in the class and not a column
  title!: string;
}
