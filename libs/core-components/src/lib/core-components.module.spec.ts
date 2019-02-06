import { async, TestBed } from '@angular/core/testing';
import { CoreComponentsModule } from './core-components.module';

describe('CoreComponentsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CoreComponentsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CoreComponentsModule).toBeDefined();
  });
});
