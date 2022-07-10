import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";

// [1, 7, 8, 9]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as number[]) });
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    return sortedUsers;
  });
