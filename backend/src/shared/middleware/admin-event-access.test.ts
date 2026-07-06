import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import type { Express } from "express";

process.env.ADMIN_API_KEY = "test-admin-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

let app: Express;
let server: ReturnType<Express["listen"]>;
let baseUrl: string;

before(async () => {
  app = (await import("../../app.js")).default;
  server = app.listen(0);
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => {
  server.close();
});

describe("admin event access control", () => {
  it("rejects event creation without an admin key", async () => {
    const response = await fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 401);
  });

  it("rejects event deletion without an admin key", async () => {
    const response = await fetch(`${baseUrl}/events/00000000-0000-4000-8000-000000000000`, {
      method: "DELETE",
    });

    assert.equal(response.status, 401);
  });
});
