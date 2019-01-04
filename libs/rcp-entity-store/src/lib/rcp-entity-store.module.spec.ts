import { async, TestBed } from '@angular/core/testing';
import { RcpEntityStoreModule } from './rcp-entity-store.module';

describe('RcpEntityStoreModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RcpEntityStoreModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(RcpEntityStoreModule).toBeDefined();
  });
});
