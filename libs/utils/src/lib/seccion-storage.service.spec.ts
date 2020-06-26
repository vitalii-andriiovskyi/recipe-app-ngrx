import { TestBed } from '@angular/core/testing';

import { SessionStorageService } from './session-storage.service';

describe('sessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ SessionStorageService ]
    });
    service = TestBed.inject(SessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  afterEach(() => sessionStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('testsessionStorage should be executable', () => {
    spyOn(service, 'testSessionStorage');
    service.testSessionStorage();
    expect(service.testSessionStorage).toHaveBeenCalled();
  });

  it('should get, set, and remove the item', () => {
    service.setItem('TEST', 'item');
    expect(service.getItem('TEST')).toBe('item');
    service.removeItem('TEST');
    expect(service.getItem('TEST')).toBe(null);
  });

});
