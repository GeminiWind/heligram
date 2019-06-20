import { isMatchingWithHashedPassword } from '../../helper';

describe('isMatchingWithHashedPassword helper', () => {
  it('return false if they are not matched with each other', () => {
    const isMatching = isMatchingWithHashedPassword('123qweasd', 'abcxyz');

    expect(isMatching).toBeFalsy();
  });

  it('return true if they are matched with each other', () => {
    const isMatching = isMatchingWithHashedPassword('temando@123', '$2b$10$lmtfpvxcPqC/tjJdqe7T6e3s.xWA2KxUQLZsA794xZTk.cJSQeIxi');

    expect(isMatching).toBeTruthy();
  });
});
