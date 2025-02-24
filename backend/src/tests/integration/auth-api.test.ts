import { describe, test, expect } from "vitest";
import { testAgent } from "../setup";
import { MESSAGES } from "../../controllers/constants";
import { parseCookie } from "../helpers";

/**
 * @description This test suite is for testing the v1 API auth routes
 * @dev To run this test suite, you need to have a running SIEM system user and password
 * @dev Command to run this test suite:
 *  - npm run back:test
 */
describe("API-INTEGRATION > auth-router", () => {
  // /**
  //  * @route /auth/register
  //  * @method POST
  //  * @description Register a new user and return access token
  //  */
  // test("should register a new user", async () => {
  //   const res = await testAgent
  //     .post("/api/v1/auth/register")
  //     .send({ user: "John Doe", pass: "password" });

  //   expect(res.body.data[0].userId).toBeDefined();
  //   expect(res.body.message).toBe(MESSAGES.USER_REGISTERED);
  //   expect(res.status).toBe(201);
  // });

  /**
   * @route /auth/login
   * @method POST
   * @description Login a user
   */
  test("should login a new user (register if not exists)", async () => {
    // await testAgent
    //   .post("/api/v1/auth/register")
    //   .send({ user: "John Doe", pass: "password" });

    const loginResponse = await testAgent
      .post("/api/v1/auth/login")
      .send({ user: "John Doe", pass: "password" });

    expect(loginResponse.headers["set-cookie"]).toBeDefined();
    expect("cookie", "accessToken");

    const cookie = loginResponse.headers["set-cookie"][0]
      .split(";")[0]
      .split("=")[1];
    expect(cookie).toBeDefined();

    expect(loginResponse.body.message).toBe(MESSAGES.USER_LOGGED_IN);
    expect(loginResponse.status).toBe(201);
  });

  /**
   * @route /auth/logout
   * @method POST
   * @description Logout a user
   */
  test("should register if not exists, login and logout a user", async () => {
    // await testAgent
    //   .post("/api/v1/auth/register")
    //   .send({ user: "John Doe", pass: "password" });

    const loginResponse = await testAgent
      .post("/api/v1/auth/login")
      .send({ user: "John Doe", pass: "password" });

    const loginCookies = loginResponse.headers[
      "set-cookie"
    ] as unknown as string[];

    const accessToken = loginCookies
      .find((cookie) => cookie.startsWith("accessToken="))
      ?.split(";")[0]
      .split("=")[1];

    const logoutResponse = await testAgent
      .post("/api/v1/auth/logout")
      .set("Cookie", `accessToken=${accessToken}`);

    const logoutCookies = logoutResponse.headers[
      "set-cookie"
    ] as unknown as string[];

    const logoutAccessToken = logoutCookies
      .find((cookie) => cookie.startsWith("accessToken="))
      ?.split(";")[0]
      .split("=")[1];

    expect(logoutAccessToken).toBeFalsy();
    expect(logoutResponse.body.message).toBe(MESSAGES.USER_LOGGED_OUT);
    expect(logoutResponse.status).toBe(200);
  });

  /**
   * @route /auth/user/:id
   * @method PATCH
   * @description Update user credentials
   */
  test("should update user credentials", async () => {
    const registerResponse = await testAgent
      .post("/api/v1/auth/login")
      .send({ user: "John Doe", pass: "password" });

    const registerCookies = registerResponse.headers[
      "set-cookie"
    ] as unknown as string[];

    const registerAccessToken = registerCookies
      .find((cookie) => cookie.startsWith("accessToken="))
      ?.split(";")[0]
      .split("=")[1];

    const [{ userId: registeredUserId }] = registerResponse.body.data;

    const updateUserResponse = await testAgent
      .patch(`/api/v1/auth/user/${registeredUserId}`)
      .set("Cookie", `accessToken=${registerAccessToken}`)
      .send({ user: "Jane Doe", pass: "password-jane" });

    expect(updateUserResponse.status).toBe(200);
    expect(updateUserResponse.body.message).toBe(
      MESSAGES.USER_CREDENTIALS_UPDATED
    );

    const updateUserResponseCookies = updateUserResponse.headers[
      "set-cookie"
    ] as unknown as string[];

    const updateUserCookieValue = updateUserResponseCookies.find((cookie) =>
      cookie.startsWith("accessToken=")
    );

    const {
      value: { userId, user, pass },
    } = parseCookie(updateUserCookieValue || "");

    expect(userId).toBe(registeredUserId);
    expect(user).toBe("Jane Doe");
    expect(pass).toBe("password-jane");

    const updateUserAccessToken = updateUserCookieValue
      ?.split(";")[0]
      .split("=")[1];

    const loginResponse = await testAgent
      .post("/api/v1/auth/login")
      .set("Cookie", `accessToken=${updateUserAccessToken}`)
      .send({ user: "Jane Doe", pass: "password-jane" });

    expect(loginResponse.body.message).toBe(MESSAGES.USER_LOGGED_IN);
    expect(loginResponse.status).toBe(201);
  });
});
