import { describe, expect, test } from "vitest";
import { login } from "./login";

describe("post", () => {
  test("test should test if the admin user can be logged in", async () => {
    const resp = await login({
      username: "admin",
      password: "password7452",
    });
    expect(resp.token).exist("string");
  });
});
