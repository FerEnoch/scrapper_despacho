import { describe, test, expect } from "vitest";
import { request } from "../setup";
import { MESSAGES } from "../../controllers/constants";

describe("API-INTEGRATION > auth-router", () => {
  /**
   * @route /auth/register
   * @method POST
   * @description Register a new user
   */
  test.skip("should register a new user", async () => {
    const res = await request
      .post("/auth/register")
      .send({ name: "John Doe", pass: "password" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(MESSAGES.USER_REGISTERED);
  });

  /**
   * @route /auth/login
   * @method POST
   * @description Login a user
   */
  // test("should login a user", async () => {
  //   const res = await request
  //     .post("/auth/login")
  //     .send({ email: "john@example.com", password: "password" });

  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toBe(MESSAGES.USER_LOGGED_IN);
  // });

  /**
   * @route /auth/logout
   * @method POST
   * @description Logout a user
   */
  // test("should logout a user", async () => {
  //   const res = await request.post("/auth/logout");

  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toBe(MESSAGES.USER_LOGGED_OUT);
  // });
});
