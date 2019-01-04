import { async, TestBed } from '@angular/core/testing';
import { RecipeStateModule } from './recipe-state.module';

describe('RecipeStateModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RecipeStateModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(RecipeStateModule).toBeDefined();
  });
});
