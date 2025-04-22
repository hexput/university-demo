import crypto from "crypto";
import { prisma } from "./database";

prisma.user.upsert({
    where: {
        username: "admin",
    },
    update: {},
    create: {
        username: "admin",
        password: crypto
        .createHash("sha256")
        .update("password7452")
        .digest("hex"),
        token: "",
    },
}).then(() => {});