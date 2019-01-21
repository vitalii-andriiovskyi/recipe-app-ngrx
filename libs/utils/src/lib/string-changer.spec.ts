import * as stringChanger from './string-changer';

describe('StringChanger', () => {

  
  describe(`slugify`, () => {
    let res: string, text: string, sluggedText: string;
    it(`should slug the text with one whitespace`, () => {
      res = 'pasta-by-alain-ducasse';
      text = 'Pasta by Alain Ducasse';
      sluggedText = stringChanger.slugify(text)
      expect(sluggedText).toBe(res);
    });
  
    it(`should slug the text with double whitespaces`, () => {
      res = 'pasta-by-alain-ducasse';
      text = 'Pasta  by Alain Ducasse';
      sluggedText = stringChanger.slugify(text)
      expect(sluggedText).toBe(res);
    });
  });
});
