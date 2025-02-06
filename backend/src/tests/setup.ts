import { initializeApp } from "../app";
import { FilesScrapper } from "../models/filesScrapper.model";
import supertest, { Test } from "supertest";
import { Server } from "node:http";
import TestAgent from "supertest/lib/agent";
import { afterAll, beforeAll } from "vitest";

let server: Server;
let request: TestAgent<Test>;

beforeAll(async () => {
  const app = await initializeApp({ model: new FilesScrapper() });
  server = app.listen(0, () => {
    const address = server.address();
    if (typeof address === "object" && address !== null) {
      console.log(`TESTING server running on port ${address.port}`);
    }
  });

  request = supertest(server);
});

afterAll(async () => {
  await server.close();
});

export { request };
