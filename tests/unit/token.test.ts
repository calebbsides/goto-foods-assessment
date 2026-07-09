import { describe, expect, it } from "vitest";
import { createInviteToken, hashInviteToken } from "@/lib/token";

describe("invite tokens", () => {
  it("generates unique unguessable tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => createInviteToken()));
    expect(tokens.size).toBe(100);
    for (const token of tokens) {
      expect(token.length).toBeGreaterThanOrEqual(24);
    }
  });

  it("hashes deterministically and hides the raw token", () => {
    const token = createInviteToken();
    expect(hashInviteToken(token)).toBe(hashInviteToken(token));
    expect(hashInviteToken(token)).not.toBe(token);
    expect(hashInviteToken(token)).toHaveLength(64);
  });
});
