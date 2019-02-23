import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeDetailComponent } from './recipe-detail.component';
import { Component, DebugElement } from '@angular/core';
import { Recipe } from '@recipe-app-ngrx/models';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
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

const shortRecipe: Recipe = {
  id: 1001,
  title: 'Recipe 1',
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

  category: { url: 'desserts', value: 'Desserts' },
  user_username: 'test_user',
  date_created: new Date(),
};

describe('RecipeDetailComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpDetailComponent: DebugElement;
  let rcpDetailComponent: RecipeDetailComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        SharedComponentsModule,
      ],
      declarations: [ RecipeDetailComponent, TestComponent ],
      providers: [{
        provide: HAMMER_LOADER,
        useValue: () => new Promise(() => {})
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    deRcpDetailComponent = fixture.debugElement.query(By.css('rcp-recipe-detail'));
    rcpDetailComponent = deRcpDetailComponent.componentInstance;
  });

  it('should create', () => {
    expect(rcpDetailComponent).toBeTruthy();
  });

  it(`shouldn't show the 'edit-recipe' button when, 'loggedIn=false'`, () => {
    const editButtonWrapper = fixture.debugElement.query(By.css('.edit-btn-wrapper'));
    expect(editButtonWrapper).toBeFalsy(`there's no .edit-btn-wrapper`);
  });

  it(`should show the 'edit-recipe' button when, 'loggedIn=true'`, () => {
    testComponent.loggedIn = true;
    fixture.detectChanges();

    const editButtonWrapper = fixture.debugElement.query(By.css('.edit-btn-wrapper'));
    expect(editButtonWrapper).toBeTruthy(`there's no .edit-btn-wrapper`);
  });

  it(`should show the title, username and date of creation of the recipe`, () => {
    const h1: HTMLElement = deRcpDetailComponent.query(By.css('.mat-h1')).nativeElement;

    expect(h1).toBeTruthy(`there's the title`);
    expect(h1.innerHTML).toContain(recipe.title, recipe.title);

    const usernameEl: HTMLElement = deRcpDetailComponent.query(By.css('.mat-h1 + div a')).nativeElement;
    expect(usernameEl).toBeTruthy(`there's A tag for user`);
    expect(usernameEl.innerHTML).toContain(recipe.user_username, recipe.user_username);
    expect(usernameEl.getAttribute('href')).toContain(recipe.user_username, recipe.user_username);

    const date_createdEl: HTMLElement = deRcpDetailComponent.query(By.css('.mat-h1 + div time')).nativeElement;
    expect(date_createdEl).toBeTruthy(`there's TIME tag`);
    const formatedDate = formatDate(recipe.date_created, '', 'en-US');
    expect(date_createdEl.innerHTML).toContain(formatedDate, formatedDate);
  });

  describe('description section',() => {
    it(`should show the description if 'recipe.description' has value`, () => {
      const descriptionEl: HTMLElement = deRcpDetailComponent.query(By.css('.recipe-item-body > section:first-child')).nativeElement;
      expect(descriptionEl).toBeTruthy('description element exists');
      expect(descriptionEl.innerHTML).toContain(recipe.description, recipe.description);
    });
  
    it(`shouldn't show the description if 'recipe.description' doesn't exist`, () => {
      let descriptionEl: HTMLElement = deRcpDetailComponent.query(By.css('.recipe-item-body > section:first-child')).nativeElement;
      expect(descriptionEl).toBeTruthy('description element exists');
      expect(descriptionEl.innerHTML).toContain(recipe.description, recipe.description);
  
      testComponent.recipe = shortRecipe;
      fixture.detectChanges();
  
      descriptionEl = deRcpDetailComponent.query(By.css('.recipe-item-body > section:first-child')).nativeElement;
      expect(descriptionEl).not.toContain(recipe.description, recipe.description);
    });
  });


  describe('ingredients section', () => {

    it(`should show the number of servings if 'recipe.servingsNumber' has value`, () => {
      const servingsNumberEl: HTMLElement = deRcpDetailComponent.query(By.css('.ingredients-section .mat-h2 + div')).nativeElement;
      expect(servingsNumberEl).toBeTruthy('servingsNumber element exists');
      expect(servingsNumberEl.innerHTML).toContain(`${recipe.servingsNumber}`, `${recipe.servingsNumber}`);
    });

    it(`shouldn't show the number of servings if 'recipe.servingsNumber' doesn't exist`, () => {
      const  servingsNumberEl: HTMLElement = deRcpDetailComponent.query(By.css('.ingredients-section .mat-h2 + div')).nativeElement;
      expect(servingsNumberEl).toBeTruthy('servingsNumber element exists');
      expect(servingsNumberEl.innerHTML).toContain(`${recipe.servingsNumber}`, `${recipe.servingsNumber}`);

      testComponent.recipe = shortRecipe;
      fixture.detectChanges();

      const deServingsNumberEl: DebugElement = deRcpDetailComponent.query(By.css('.ingredients-section .mat-h2 + div'));
      expect(deServingsNumberEl).toBeFalsy('servingsNumber element doesn\'t exist');
    });

    it(`should show the mat-table with ingredients`, () => {
      fixture.detectChanges();
      const matTable: DebugElement = deRcpDetailComponent.query(By.css('.ingredients-section .mat-table'));
      const matRows: HTMLElement[] = matTable.nativeElement.querySelectorAll('tbody > tr');
      expect(matRows.length).toBe(recipe.ingredients.length, recipe.ingredients.length);

      const matTdIn1Row: any = matRows[0].querySelectorAll('td');
      expect(matTdIn1Row[0].innerHTML).toContain(recipe.ingredients[0].name, recipe.ingredients[0].name);
      expect(matTdIn1Row[1].innerHTML).toContain(recipe.ingredients[0].quantity, recipe.ingredients[0].quantity);
      expect(matTdIn1Row[1].innerHTML).toContain(recipe.ingredients[0].unit, recipe.ingredients[0].unit);
    });

  });

  describe(`directions .cooking-time-info`, () => {

    it(`should show '.cooking-time-info' with 'Prep', 'Cook' and 'Ready in' <div>'s, when 'recipe.preparationTime' and 'recipe.cookTime' have value`, () => {
      const cookingTimeInfoEl: HTMLElement = deRcpDetailComponent.query(By.css('.cooking-time-info')).nativeElement;
      expect(cookingTimeInfoEl).toBeTruthy('.cooking-time-info');

      const prepTimeEl: HTMLElement = cookingTimeInfoEl.querySelector('div:nth-child(2)');
      expect(prepTimeEl.innerHTML).toContain(`${recipe.preparationTime}`, recipe.preparationTime);

      const cookTimeEl: HTMLElement = cookingTimeInfoEl.querySelector('div:nth-child(3)');
      expect(cookTimeEl.innerHTML).toContain(`${recipe.cookTime}`, recipe.cookTime);

      const readyTimeEl: HTMLElement = cookingTimeInfoEl.querySelector('div:nth-child(4)');
      expect(readyTimeEl.innerHTML).toContain(`${recipe.cookTime + recipe.preparationTime}`, `${recipe.cookTime + recipe.preparationTime}`);
    });

    it(`should show '.cooking-time-info' without 'Prep' and 'Ready in' <div>'s, when 'recipe.preparationTime' doesn't exist`, () => {
      const shortenedRecipe: Recipe = { ...recipe };
      delete shortenedRecipe.preparationTime;
      testComponent.recipe = shortenedRecipe;
      fixture.detectChanges()

      const cookingTimeInfoEl: HTMLElement = deRcpDetailComponent.query(By.css('.cooking-time-info')).nativeElement;
      expect(cookingTimeInfoEl).toBeTruthy('.cooking-time-info');
      const divChildren: any = cookingTimeInfoEl.querySelectorAll('div');
      console.log(divChildren);
      expect(divChildren.length).toBe(2, 2);

      const cookTimeEl: HTMLElement = cookingTimeInfoEl.querySelector('div:nth-child(2)');
      expect(cookTimeEl.innerHTML).toContain(`${recipe.cookTime}`, `${recipe.cookTime}`);
    });

    it(`should show '.cooking-time-info' without 'Cook' and 'Ready in' <div>'s, when 'recipe.cookTime' doesn't exist`, () => {
      const shortenedRecipe: Recipe = { ...recipe };
      delete shortenedRecipe.cookTime;
      testComponent.recipe = shortenedRecipe;
      fixture.detectChanges()

      const cookingTimeInfoEl: HTMLElement = deRcpDetailComponent.query(By.css('.cooking-time-info')).nativeElement;
      expect(cookingTimeInfoEl).toBeTruthy('.cooking-time-info');
      const divChildren: any = cookingTimeInfoEl.querySelectorAll('div');
      expect(divChildren.length).toBe(2, 2);

      const preparationTimeEl: HTMLElement = cookingTimeInfoEl.querySelector('div:nth-child(2)');
      expect(preparationTimeEl.innerHTML).toContain(`${recipe.preparationTime}`, `${recipe.preparationTime}`);
    });

    it(`should show '.cooking-time-info' when 'recipe.cookTime' and 'recipe.preparationTime' don't exist`, () => {
      const shortenedRecipe: Recipe = { ...recipe };
      delete shortenedRecipe.cookTime;
      delete shortenedRecipe.preparationTime;
      testComponent.recipe = shortenedRecipe;
      fixture.detectChanges()

      const cookingTimeInfoEl: DebugElement = deRcpDetailComponent.query(By.css('.cooking-time-info'));
      expect(cookingTimeInfoEl).toBeFalsy('.cooking-time-info');
    
    });
  });

  describe('directions section', () => {
    it(`should show the list .steps`, () => {
      const deSteps: DebugElement[] = deRcpDetailComponent.queryAll(By.css('.steps > li'));
      expect(deSteps.length).toBe(recipe.steps.length, recipe.steps.length);
      expect(deSteps[0].nativeElement.innerHTML).toContain(recipe.steps[0]);
    });
  });

  describe('nutrition facts section',() => {
    it(`should show the nutrition facts if 'recipe.nutritionFacts' has value`, () => {
      const nutritionFactsEl: HTMLElement = deRcpDetailComponent.query(By.css('.recipe-item-body > section:last-of-type')).nativeElement;
      expect(nutritionFactsEl).toBeTruthy('nutritionFacts element exists');
      expect(nutritionFactsEl.innerHTML).toContain(recipe.nutritionFacts, recipe.nutritionFacts);
    });
  
    it(`shouldn't show the nutrition facts if 'recipe.nutritionFacts' doesn't exist`, () => {
      let nutritionFactsEl: HTMLElement = deRcpDetailComponent.query(By.css('.recipe-item-body > section:last-of-type')).nativeElement;
      expect(nutritionFactsEl).toBeTruthy('nutritionFacts element exists');
      expect(nutritionFactsEl.innerHTML).toContain(recipe.nutritionFacts, recipe.nutritionFacts);
  
      testComponent.recipe = shortRecipe;
      fixture.detectChanges();
  
      nutritionFactsEl = deRcpDetailComponent.query(By.css('.recipe-item-body > section:last-of-type')).nativeElement;
      expect(nutritionFactsEl).not.toContain(recipe.nutritionFacts, recipe.nutritionFacts);
    });
  });

  describe('footnotes',() => {
    it(`should show the footnotes if 'recipe.footnotes' has value`, () => {
      const footnotesEl: HTMLElement = deRcpDetailComponent.query(By.css('.recipe-item-body > p:last-of-type')).nativeElement;
      expect(footnotesEl).toBeTruthy('footnotes element exists');
      expect(footnotesEl.innerHTML).toContain(recipe.footnotes, recipe.footnotes);
    });
  
    it(`shouldn't show the footnotes if 'recipe.footnotes' doesn't exist`, () => {
      const footnotesEl: HTMLElement = deRcpDetailComponent.query(By.css('.recipe-item-body > p:last-of-type')).nativeElement;
      expect(footnotesEl).toBeTruthy('footnotes element exists');
      expect(footnotesEl.innerHTML).toContain(recipe.footnotes, recipe.footnotes);
  
      testComponent.recipe = shortRecipe;
      fixture.detectChanges();
  
      const deFootnotes = deRcpDetailComponent.query(By.css('.recipe-item-body > p:last-of-type'));
      expect(deFootnotes).toBeFalsy(`there's no footnotes`);
    });
  });

  
});

@Component({
  selector: 'rcp-test-comp',
  template: `
    <div><rcp-recipe-detail [recipe]="recipe" [loggedIn]="loggedIn"></rcp-recipe-detail></div>
  `
})
class TestComponent {
  recipe: Recipe = recipe;
  loggedIn = false;
}
