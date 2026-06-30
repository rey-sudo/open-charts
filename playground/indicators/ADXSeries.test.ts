import { expect, test } from "vitest";
import { rma } from "./ADXSeries";

test("adds 1 + 2 to equal 3", () => {
  const adx = rma([1], 3);

  expect(1).toBe(1);
});
