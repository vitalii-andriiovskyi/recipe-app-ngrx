import { async, TestBed } from '@angular/core/testing';
import { RouterHistoryStateModule } from './router-history-state.module';

describe('RouterHistoryStateModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterHistoryStateModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(RouterHistoryStateModule).toBeDefined();
  });
});
