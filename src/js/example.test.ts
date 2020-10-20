import { Animal } from './example';

test('Animal travelling', () => {

  const anim = new Animal()

  expect(anim.move(10)).toBe(10);
});
