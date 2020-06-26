import { async, TestBed } from '@angular/core/testing';
import { UserStateModule } from './user-state.module';

describe('UserStateModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UserStateModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UserStateModule).toBeDefined();
  });
});
