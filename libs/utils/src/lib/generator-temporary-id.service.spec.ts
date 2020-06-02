import { TestBed } from '@angular/core/testing';

import { TemporaryIdGenerator } from './generator-temporary-id.service';

describe('GeneratorTemporaryIdService', () => {
  let temporaryIdGenerator: TemporaryIdGenerator;

  beforeEach(() => { 
    TestBed.configureTestingModule({
      providers: [
        TemporaryIdGenerator
      ]
    });
    temporaryIdGenerator = TestBed.inject(TemporaryIdGenerator);
  });

  it('should be created', () => {
    expect(temporaryIdGenerator).toBeTruthy();
  });

  it(`should set the temporary Id when 'baseForId' is 1`, () => {
    const res: number = temporaryIdGenerator.createId(1);
    expect(res).toBe(1000, '1000');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(1, '1');
  });

  it(`should set the temporary Id to 1000 when 'baseForId' is 0 for the first call 'createId()'`, () => {
    let res: number = temporaryIdGenerator.createId(0);
    expect(res).toBe(1000, '1000');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(1, '1');

    res = temporaryIdGenerator.createId(0);
    expect(res).toBe(1001, '1001');
  });

  it(`should set the temporary Id to 1000 when 'baseForId' is -1`, () => {
    const res: number = temporaryIdGenerator.createId(-1);
    expect(res).toBe(1000, '1000');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(1, '1');
  });

  it(`should set the temporary Id to 2000 after two calls 'createId()' with '1' and '2'`, () => {
    let res: number = temporaryIdGenerator.createId(1);
    res = temporaryIdGenerator.createId(2);
    expect(res).toBe(2000, '2000');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(2, '2');
  });

  it(`should set the temporary Id to 1001 after two calls 'createId()' with '1'`, () => {
    let res: number = temporaryIdGenerator.createId(1);
    res = temporaryIdGenerator.createId(1);
    expect(res).toBe(1001, '1001');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(1, '1');
  });

  it(`should increase the temporary Id on 1 when current 'baseId' is less than previous`, () => {
    let res: number = temporaryIdGenerator.createId(100);
    res = temporaryIdGenerator.createId(99);
    expect(res).toBe(100001, '100001');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(100, '100');

    res = temporaryIdGenerator.createId(0);
    expect(res).toBe(100002, '100002');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(100, '100');

    res = temporaryIdGenerator.createId(0);
    expect(res).toBe(100003, '100003');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(100, '100');
    res = temporaryIdGenerator.createId(80);
    expect(res).toBe(100004, '100004');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(100, '100');

    res = temporaryIdGenerator.createId(101);
    expect(res).toBe(101000, '101000');
    expect(temporaryIdGenerator.lastBiggestBaseForId).toBe(101, '101');
  });
});
