import { distance } from "./struct/Point";

test("distance", () => {
  expect(distance([2, 3], [3, 40])).toBe(37.013511046643494);
});
