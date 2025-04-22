import { api, APIError } from "encore.dev/api";
import { prisma } from "../database";
import crypto from "crypto";
import { createToken } from "./auth";

interface LoginRequest {
  username: string;
  password: string;
}

export const login = api(
  { expose: true, method: "POST", path: "/api/login", auth: false },
  async ({ username, password }: LoginRequest): Promise<Response> => {
    let passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    let user = await prisma.user.findUnique({
      where: {
        username: username,
      }
    });

    console.log(
      user,
      username,
      await prisma.user.findMany()
    )

    if (!user) {
      throw APIError.notFound("User not found");
    }

    if (user.password !== passwordHash) {
      throw APIError.notFound("Invalid password");
    }

    let token = createToken(username, passwordHash);

    if (user.token !== token) 
      await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          token: token,
        }
      });

    return {
      ok: true,
      token: token,
    }
  }
);

interface Response {
  token: string;
  ok: boolean;
}

// ==================================================================

// Encore comes with a built-in development dashboard for
// exploring your API, viewing documentation, debugging with
// distributed tracing, and more. Visit your API URL in the browser:
//
//     http://localhost:9400
//

// ==================================================================

// Next steps
//
// 1. Deploy your application to the cloud
//
//     git add -A .
//     git commit -m 'Commit message'
//     git push encore
//
// 2. To continue exploring Encore, check out these topics in docs:
//
//    Building a REST API:   https://encore.dev/docs/ts/tutorials/rest-api
//    Creating Services:      https://encore.dev/docs/ts/primitives/services
//    Creating APIs:         https://encore.dev/docs/ts/primitives/defining-apis
//    Using SQL Databases:        https://encore.dev/docs/ts/primitives/databases
//    Using Pub/Sub:         https://encore.dev/docs/ts/primitives/pubsub
//    Authenticating users:  https://encore.dev/docs/ts/develop/auth
//    Using Cron Jobs: https://encore.dev/docs/ts/primitives/cron-jobs
//    Using Secrets: https://encore.dev/docs/ts/primitives/secrets
