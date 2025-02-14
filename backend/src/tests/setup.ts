import { initializeApp } from "../app";
import { FilesScrapperV1 } from "../models/filesScrapper.model";
import supertest, { Test } from "supertest";
import { Server } from "node:http";
import TestAgent from "supertest/lib/agent";
import { afterAll, afterEach, beforeEach } from "vitest";
import { useMiddlewares } from "../middlewares";
import fs from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";

let server: Server;
let testAgent: TestAgent<Test>;

beforeEach(async () => {
  try {
    await fs.mkdir(path.resolve(cwd(), "db-test"));
  } catch (error) {}

  let app = await initializeApp({ model: new FilesScrapperV1() });
  app = useMiddlewares(app);

  server = app.listen(0, () => {
    /** Clean console logs in testing enviroment */
    // const address = server.address();
    // if (typeof address === "object" && address !== null) {
    //   console.log(`TESTING server running on port ${address.port}`);
    // }
  });

  testAgent = supertest(server);
});

afterEach(async () => {
  await server.close();
});

afterAll(async () => {
  try {
    await fs.rm(path.resolve(cwd(), "db-test"), { recursive: true });
  } catch (error) {}
});

export { testAgent };
