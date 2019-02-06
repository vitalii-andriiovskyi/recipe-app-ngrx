import { async, TestBed } from '@angular/core/testing';
import { RecipeUiModule } from './recipe-ui.module';

describe('RecipeUiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RecipeUiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(RecipeUiModule).toBeDefined();
  });
});
