import { isMatchingWithHashedPassword } from '../../helper';

describe('isMatchingWithHashedPassword helper', () => {
  it('return false if they are not matched with each other', () => {
    const isMatching = isMatchingWithHashedPassword('123qweasd', 'abcxyz');

    expect(isMatching).toBeFalsy();
  });
});
