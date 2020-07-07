import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';

import { RecipePreviewComponent } from './recipe-preview.component';
import { Recipe } from '@recipe-app-ngrx/models';
import { By } from '@angular/platform-browser';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

const recipe: Recipe = {
  id: 1001,
  title: 'Recipe 1',
  title_slugged: 'recipe-1',
  description: `Lorem ipsum dolor, sit amet consectetur consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
  ingredients: [
    {
      id: 0,
      name: 'Ingredient 1',
      quantity: 2,
      unit: 'kg'
    },
    {
      id: 1,
      name: 'Ingredient 2',
      quantity: 2,
      unit: 'pieces'
    },
    {
      id: 2,
      name: 'Ingredient 3',
      quantity: 2,
      unit: 'units'
    }    
  ],
  steps: [ 
    `Step 1`,
    `Step 2`,
    `Step 3`,
    `Step 4`,
  ],
  images: [],
  footnotes: 'Some info',
  nutritionFacts: `Nutrition Facts`,
  preparationTime: 12,
  cookTime: 15,
  servingsNumber: 6,

  category: { url: 'desserts', value: 'Desserts' },
  user_username: 'test_user',
  date_created: new Date(),
};

describe('RecipePreviewComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpPreviewComponent: DebugElement;
  let rcpPreviewComponent: RecipePreviewComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedComponentsModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      declarations: [ RecipePreviewComponent, TestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    deRcpPreviewComponent = fixture.debugElement.query(By.css('rcp-recipe-preview'));
  });

  it('should create', () => {
    rcpPreviewComponent = deRcpPreviewComponent.componentInstance;
    expect(rcpPreviewComponent).toBeTruthy();
  });

  it(`should show 'recipe.title' in .mat-card-title`, () => {
    const titleEl: HTMLElement = deRcpPreviewComponent.query(By.css('.mat-card-title')).nativeElement;
    expect(titleEl.innerHTML).toContain(recipe.title, recipe.title);
  });

  it(`should show 'recipe.user_username' in .mat-card-subtitle`, () => {
    const subTitleEl: HTMLElement = deRcpPreviewComponent.query(By.css('.mat-card-subtitle')).nativeElement;
    expect(subTitleEl.innerHTML).toContain(recipe.user_username, recipe.user_username);
    expect(subTitleEl.querySelector('a').getAttribute('href')).toContain(`/recipes/${recipe.user_username}`, `/recipes/${recipe.user_username}`)
  });

  it(`should show 'recipe.description' in .mat-card-content when 'recipe.description' exists`, () => {
    const descriptionEl: HTMLElement = deRcpPreviewComponent.query(By.css('.mat-card-content')).nativeElement;
    expect(descriptionEl.innerHTML).toContain(recipe.description, recipe.description);
    expect(descriptionEl.innerHTML).not.toContain(recipe.title, recipe.title);
  });

  it(`should show 'recipe.title' in .mat-card-content when 'recipe.description' doesn't exists`, () => {
    const shortRecipe: Recipe = { ...recipe };
    delete shortRecipe.description;
    testComponent.recipe = shortRecipe;

    fixture.detectChanges();
    deRcpPreviewComponent = fixture.debugElement.query(By.css('rcp-recipe-preview'));

    const descriptionEl: HTMLElement = deRcpPreviewComponent.query(By.css('.mat-card-content')).nativeElement;
    expect(descriptionEl.innerHTML).toContain(recipe.title, recipe.title);
    expect(descriptionEl.innerHTML).not.toContain(recipe.description, recipe.description);
  });

  it(`should show 'View Recipe' A tag with 'href' having '/recipe/:id'`, () => {
    const viewRecipeBut: HTMLElement = deRcpPreviewComponent.query(By.css('.mat-card-actions a.mat-flat-button')).nativeElement;
    expect(viewRecipeBut.getAttribute('href')).toContain(`/recipe/${recipe.id}`, `/recipe/${recipe.id}`);
  });

  // it(`should show img .mat-card-image`, () => {
  //   // This is implemented humble and not as expected. There's no sense to test it yet 
  // });

  
});

@Component({
  selector: 'rcp-test',
  template: `
    <div>
      Test RecipePreviewComponent
      <rcp-recipe-preview [recipe]="recipe"></rcp-recipe-preview>
    </div>
  `
})
class TestComponent {
  recipe: Recipe = recipe;
}
