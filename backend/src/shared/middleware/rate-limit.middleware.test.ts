import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { createRateLimit } from "./rate-limit.middleware.js";

const createRequest = (ip: string): Request => {
  return {
    ip,
    socket: { remoteAddress: ip },
    get: () => undefined,
  } as unknown as Request;
};

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    headers: new Map<string, string>(),
    setHeader(name: string, value: string) {
      this.headers.set(name, value);
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response & {
    statusCode: number;
    body: unknown;
    headers: Map<string, string>;
  };
};

describe("rate limit middleware", () => {
  it("rejects requests after the configured limit", () => {
    const middleware = createRateLimit({
      windowMs: 60_000,
      maxRequests: 2,
      message: "Too many requests",
    });

    let nextCalls = 0;
    middleware(createRequest("127.0.0.1"), createResponse(), () => nextCalls += 1);
    middleware(createRequest("127.0.0.1"), createResponse(), () => nextCalls += 1);

    const blockedResponse = createResponse();
    middleware(createRequest("127.0.0.1"), blockedResponse, () => nextCalls += 1);

    assert.equal(nextCalls, 2);
    assert.equal(blockedResponse.statusCode, 429);
    assert.equal(blockedResponse.headers.has("Retry-After"), true);
  });
});
