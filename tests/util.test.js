import { deepPartialUpdate } from '../src/util';

test('Deep partial update', () => {
  // Undefined values are not updated
  const result = deepPartialUpdate({ a: 1, b: 2 }, { a: 3, c: 4 });
  expect(result).toEqual({ a: 3, b: 2, c: 4 });

  // Keys that are explicitly set to undefined are not updated
  const result1 = deepPartialUpdate({ a: 1, b: 2 }, { a: undefined, c: 4 });
  expect(result1).toEqual({ a: 1, b: 2, c: 4 });

  // Arrays are replaced, not merged
  const result2 = deepPartialUpdate({ a: [1, 2] }, { a: [3, 4] });
  expect(result2).toEqual({ a: [3, 4] });
});
