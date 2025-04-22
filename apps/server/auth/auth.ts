    
import { APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import crypto from "crypto";

import { prisma } from "../database";
import { Prisma, User } from "@prisma/client";

interface AuthParams {
  authorization: Header<"Authorization">;
}

export type AuthData = {
  userID: string;
} & {
  id: number;
  username: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  token: string | null;
  system_admin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const tokenAuthHandler = authHandler(async (params: AuthParams): Promise<AuthData> => {
  const user = await prisma.user.findUnique({
    where: {
        token: params.authorization,
    }
  }).then((user) => user && ({
    userID: user.id.toString(),
    ...user
  }))

  if (!user) {
    throw APIError.permissionDenied("User not found");
  }

  return user;
});

export function createToken(username: string, passwordHash: string) {
  let monthIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 30));
  
  let token = crypto
    .createHash("sha256")
    .update(`${username}${passwordHash}${monthIndex}`)
    .digest("hex");

  return token;
}

export const mygw = new Gateway({ authHandler: tokenAuthHandler });