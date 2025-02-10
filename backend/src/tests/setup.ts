import { initializeApp } from "../app";
import { FilesScrapper } from "../models/filesScrapper.model";
import supertest, { Test } from "supertest";
import { Server } from "node:http";
import TestAgent from "supertest/lib/agent";
import { afterAll, beforeAll } from "vitest";
import { useMiddlewares } from "../middlewares";
import fs from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";

let server: Server;
let testAgent: TestAgent<Test>;

beforeAll(async () => {
  await fs.mkdir(path.resolve(cwd(), "./db-test"), { recursive: true });

  let app = await initializeApp({ model: new FilesScrapper() });
  app = useMiddlewares(app);

  server = app.listen(0, () => {
    const address = server.address();
    if (typeof address === "object" && address !== null) {
      console.log(`TESTING server running on port ${address.port}`);
    }
  });

  testAgent = supertest(server);
});

afterAll(async () => {
  await server.close();
  await fs.rm(path.resolve(cwd(), "./db-test"), { recursive: true });
});

export { testAgent };
