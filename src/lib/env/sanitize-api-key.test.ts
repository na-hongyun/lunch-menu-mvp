import { describe, expect, it } from "vitest";
import { sanitizeAsciiApiKey } from "./sanitize-api-key";

describe("sanitizeAsciiApiKey", () => {
  it("strips BOM and keeps ASCII key", () => {
    expect(sanitizeAsciiApiKey("\uFEFFAIzaSyD-test-key_01")).toBe("AIzaSyD-test-key_01");
  });

  it("removes Korean and keeps embedded ASCII", () => {
    expect(sanitizeAsciiApiKey("초AIzaX")).toBe("AIzaX");
  });

  it("returns empty when only non-ASCII", () => {
    expect(sanitizeAsciiApiKey("한글만")).toBe("");
  });
});
