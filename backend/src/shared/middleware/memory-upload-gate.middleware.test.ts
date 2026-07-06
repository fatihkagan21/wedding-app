import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { Request, Response } from "express";
import { requireMemoryUploadOpen } from "./memory-upload-gate.middleware.js";

const originalMode = process.env.MEMORY_UPLOAD_MODE;
const originalOpenAt = process.env.MEMORY_UPLOAD_OPEN_AT;

afterEach(() => {
  process.env.MEMORY_UPLOAD_MODE = originalMode;
  process.env.MEMORY_UPLOAD_OPEN_AT = originalOpenAt;
});

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response & { statusCode: number; body: unknown };
};

describe("memory upload gate", () => {
  it("allows uploads when the mode is open", () => {
    process.env.MEMORY_UPLOAD_MODE = "open";

    let nextCalled = false;
    const response = createResponse();

    requireMemoryUploadOpen({} as Request, response, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(response.statusCode, 200);
  });

  it("rejects uploads before the configured scheduled date", () => {
    process.env.MEMORY_UPLOAD_MODE = "scheduled";
    process.env.MEMORY_UPLOAD_OPEN_AT = "2999-09-05T20:00:00+03:00";

    let nextCalled = false;
    const response = createResponse();

    requireMemoryUploadOpen({} as Request, response, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(response.statusCode, 403);
  });
});
