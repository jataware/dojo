/* eslint-disable no-undef */
import { formatDatetime } from './utils';

describe('formatDatetime', () => {
  test('Given Date Object, correctly formats UTC datetime to display in application', () => {
    const input = new Date(1651783817550);

    expect(formatDatetime(input)).toBe('2022/05/05 20:50:17 UTC');
  });
});
