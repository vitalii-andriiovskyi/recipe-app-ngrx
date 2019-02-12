import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RecipeEditorComponent } from './recipe-editor.component';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { Component, DebugElement } from '@angular/core';
import { Subject } from 'rxjs';
import { Recipe, CreatedRecipeEvtObj, recipeCategoriesList } from '@recipe-app-ngrx/models';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormGroup } from '@angular/forms';

interface IngredientControls {
  idControl: DebugElement;
  nameControl: DebugElement;
  unitControl: DebugElement;
  quantityControl: DebugElement;
  removeButton: DebugElement;
};

interface StepControls {
  stepControl: DebugElement;
  removeButton: DebugElement;
};

interface RcpFormControlsAButtons {
  idControl: DebugElement;
  titleControl: DebugElement;
  categoryControl: DebugElement;
  descriptionControl: DebugElement;
  ingredients: {
    ingArr: IngredientControls[];
    addIngredientBut: DebugElement;
  };
  steps: {
    stepArr: StepControls[];
    addStepBut: DebugElement;
  };
  images: {
    imagesControl: DebugElement;
    imagesArr: any[]
  };
  footnotesControl: DebugElement;
  nutritionFactsControl: DebugElement;
  preparationTimeControl: DebugElement;
  cookTimeControl: DebugElement;
  servingsNumberControl: DebugElement;

  saveRecipeButton: DebugElement;
};

const recipe: Recipe = {
  id: 1001,
  title: 'Recipe 1',
  title_slugged: 'recipe-1',
  description: 'Tasty recipe',
  ingredients: [
    {
      id: 0,
      name: 'bread',
      quantity: 2,
      unit: 'kg'
    }
  ],
  steps: [ 'Step 1'],
  images: [],
  footnotes: 'Some info',
  nutritionFacts: '372 calories',
  preparationTime: 12,
  cookTime: 12,
  servingsNumber: 6,

  category: 'desserts',
  user_username: 'test_user',
  date_created: new Date(),
};

describe('RecipeEditorComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let deRcpEditorComponent: DebugElement;
  let rcpEditorComponent: RecipeEditorComponent;
  let rcpFormControlsAButtons: RcpFormControlsAButtons;
  let matError: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedComponentsModule,
        NoopAnimationsModule
      ],
      declarations: [ TestComponent, RecipeEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    deRcpEditorComponent = fixture.debugElement.query(By.css('rcp-recipe-editor'));
    rcpEditorComponent = deRcpEditorComponent.componentInstance;
    rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
  });

  it('should create', () => {
    expect(rcpEditorComponent).toBeTruthy();
  });

  describe(`ADDING MODE (CREATION)`, () => {
    it(`the 'save recipe' button should be disabled, 'recipe$' is still silent, 'addMode=true'`, () => {
      fixture.detectChanges();
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
      expect(rcpEditorComponent.addMode).toBeTruthy('addMode=true');
      expect(rcpFormControlsAButtons.idControl.nativeElement.value).toBe('0', '0');
      expect(rcpFormControlsAButtons.titleControl.nativeElement.value).toBe('', '');
      // expect(rcpFormControlsAButtons.categoryControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.descriptionControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].idControl.nativeElement.value).toBe('0', '0');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.value).toBe('', '');
      // expect(rcpFormControlsAButtons.ingredients.ingArr[0].unitControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeFalsy(`there's no 'remove ingredient button'`);
      expect(rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeFalsy(`there's no 'remove step button'`);
      expect(rcpFormControlsAButtons.footnotesControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.nutritionFactsControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.preparationTimeControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.cookTimeControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.servingsNumberControl.nativeElement.value).toBe('', '');
    });
    
    it(`the 'save recipe' button should be disabled when 'recipe$' passes 'null', 'addMode=true'`, fakeAsync(() => {
      testComponent.sendRecipe(null);
      tick();
      fixture.detectChanges();

      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
      expect(rcpEditorComponent.addMode).toBeTruthy('addMode=true');
    }));

    it(`the 'title' control should show the error when event 'blur' fires and value is empty`, fakeAsync(() => {
      const controlValue = 'Recipe 1';
      matError = getMatError(rcpFormControlsAButtons.titleControl);
      expect(matError).toBeFalsy(`there's no <mat-error>`);

      rcpFormControlsAButtons.titleControl.triggerEventHandler('focus', null);
      fixture.detectChanges();
      rcpFormControlsAButtons.titleControl.triggerEventHandler('blur', null);
      fixture.detectChanges();

      matError = getMatError(rcpFormControlsAButtons.titleControl); 
      expect(matError).toBeTruthy(`there's <mat-error>`);
      expect(rcpEditorComponent.recipeForm.value.title).toBe('', '');

      rcpFormControlsAButtons.titleControl.nativeElement.value = controlValue;
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));

      tick();
      fixture.detectChanges();
      expect(rcpEditorComponent.recipeForm.value.title).toBe(controlValue, controlValue);
      matError = getMatError(rcpFormControlsAButtons.titleControl);
      expect(matError).toBeFalsy(`there's no <mat-error>`);

    }));

    it(`the 'category' control should show the error when event 'blur' fires and value is empty`, fakeAsync(() => {
      matError = getMatError(rcpFormControlsAButtons.titleControl);
      expect(matError).toBeFalsy(`there's no <mat-error>`);

      // show <mat-option>'s
      rcpFormControlsAButtons.categoryControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // <mat-option>'s are in .cdk-overlay-container
      let matOptions = rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      const value = matOptions[0].getAttribute('ng-reflect-value');
      expect(matOptions.length).toBeGreaterThan(0, `there're several <mat-option>'s`);

      // hide <mat-option>'s by clicking elsewhere beside the .cdk-overlay-connected-position-bounding-box
      rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelector('.cdk-overlay-backdrop').dispatchEvent(new MouseEvent('click'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      matOptions = rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      expect(matOptions.length).toBe(0, `0`);

      matError = getMatError(rcpFormControlsAButtons.categoryControl);
      expect(matError).toBeTruthy(`there's <mat-error>`);
      expect(rcpEditorComponent.recipeForm.value.category).toBe('', '');

      // show <mat-option>'s
      rcpFormControlsAButtons.categoryControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();

      matOptions = rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      matOptions[0].dispatchEvent(new MouseEvent('click'));
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));
      
      tick();
      fixture.detectChanges();
      matError = getMatError(rcpFormControlsAButtons.categoryControl);
      
      expect(matError).toBeFalsy(`there's no <mat-error>`);
      expect(rcpEditorComponent.recipeForm.value.category).toBe(value, value);

      tick(1000);
    }));

    

    it(`should enable the 'save recipe' button when 'title', 'category', 'ingredients', 'steps' are filled by value`, fakeAsync(() => {
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is enabled');
      
      rcpFormControlsAButtons.titleControl.nativeElement.value = recipe.title;
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.value = recipe.ingredients[0].name;
      rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.value = recipe.ingredients[0].quantity;
      rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.value = recipe.steps[0];
      rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      // show <mat-option>'s for 'category' control
      rcpFormControlsAButtons.categoryControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();
      let matOptions = rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      matOptions[0].dispatchEvent(new MouseEvent('click'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // show <mat-option>'s for 'ingrediets -> units' control
      rcpFormControlsAButtons.ingredients.ingArr[0].unitControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();
      matOptions = rcpFormControlsAButtons.ingredients.ingArr[0].unitControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      matOptions[0].dispatchEvent(new MouseEvent('click'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeFalsy('save button is enabled');
      tick(1000);

    }));

    it(`should fire the event 'createdRecipe' when 'recipeForm' is filled correctly and submitted`, fakeAsync(() => {
      
      rcpFormControlsAButtons.titleControl.nativeElement.value = recipe.title;
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();
      // expect(rcpFormControlsAButtons.categoryControl.nativeElement.value).toBe('', '');
      rcpFormControlsAButtons.descriptionControl.nativeElement.value = recipe.description;
      rcpFormControlsAButtons.descriptionControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.value = recipe.ingredients[0].name;
      rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      // expect(rcpFormControlsAButtons.ingredients.ingArr[0].unitControl.nativeElement.value).toBe('', '');
      rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.value = recipe.ingredients[0].quantity;
      rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.value = recipe.steps[0];
      rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.footnotesControl.nativeElement.value = recipe.footnotes;
      rcpFormControlsAButtons.footnotesControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.nutritionFactsControl.nativeElement.value = recipe.nutritionFacts;
      rcpFormControlsAButtons.nutritionFactsControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.preparationTimeControl.nativeElement.value = recipe.preparationTime;
      rcpFormControlsAButtons.preparationTimeControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.cookTimeControl.nativeElement.value = recipe.cookTime;
      rcpFormControlsAButtons.cookTimeControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.servingsNumberControl.nativeElement.value = recipe.servingsNumber;
      rcpFormControlsAButtons.servingsNumberControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      // show <mat-option>'s for 'category' control
      rcpFormControlsAButtons.categoryControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();
      let matOptions = rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      matOptions[0].dispatchEvent(new MouseEvent('click'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // show <mat-option>'s for 'ingrediets -> units' control
      rcpFormControlsAButtons.ingredients.ingArr[0].unitControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();
      matOptions = rcpFormControlsAButtons.ingredients.ingArr[0].unitControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      matOptions[0].dispatchEvent(new MouseEvent('click'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeFalsy('save button is enabled');
      tick(1000);

      expect(testComponent.createdRecipeEvObj).toBeFalsy('');
      deRcpEditorComponent.query(By.css('form')).triggerEventHandler('submit', null);
      tick();
      fixture.detectChanges();
      expect(testComponent.createdRecipeEvObj).toBeTruthy(`event 'createdRecipe' is fired`);
      expect(testComponent.createdRecipeEvObj.addMode).toBeTruthy(`addMode is true`);
      expect(testComponent.createdRecipeEvObj.recipe.title).toBe(recipe.title, recipe.title);
      expect(testComponent.createdRecipeEvObj.recipe.title_slugged).toBe(recipe.title_slugged, recipe.title_slugged);

    }));

    it(`shouldn't fire the event 'createdRecipe' when 'recipeForm' is filled wrongly and submitted`, fakeAsync(() => {
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is enabled');
      
      rcpFormControlsAButtons.titleControl.nativeElement.value = recipe.title;
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.value = recipe.ingredients[0].name;
      rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.value = recipe.ingredients[0].quantity;
      rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.value = recipe.steps[0];
      rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();

      // show <mat-option>'s for 'category' control
      rcpFormControlsAButtons.categoryControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
      fixture.detectChanges();
      const matOptions = rcpFormControlsAButtons.categoryControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
      matOptions[0].dispatchEvent(new MouseEvent('click'));
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      
      tick(1000);
      expect(testComponent.createdRecipeEvObj).toBeFalsy('createdRecipeEvObj is undefined');
      deRcpEditorComponent.query(By.css('form')).triggerEventHandler('submit', null);
      tick();
      fixture.detectChanges();
      expect(testComponent.createdRecipeEvObj).toBeFalsy('createdRecipeEvObj is undefined');
    }));

    describe(`INGREDIENTS FUNCTIONALITY`, () => {
      it(`the 'name' control should show the error when event 'blur' fires and its value is empty`, fakeAsync(() => {
        const controlValue = 'Bread';
        const nameControl: DebugElement = rcpFormControlsAButtons.ingredients.ingArr[0].nameControl;
        matError = getMatError(nameControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
        nameControl.triggerEventHandler('focus', null);
        fixture.detectChanges();
        nameControl.triggerEventHandler('blur', null);
        fixture.detectChanges();
  
        matError = getMatError(nameControl);
        expect(matError).toBeTruthy(`there's <mat-error>`);
        expect(rcpEditorComponent.recipeForm.value.ingredients[0].name).toBe('', '');
  
        nameControl.nativeElement.value = controlValue;
        nameControl.nativeElement.dispatchEvent(newEvent('input'));
  
        tick();
        fixture.detectChanges();
        expect(rcpEditorComponent.recipeForm.value.ingredients[0].name).toBe(controlValue, controlValue);
        matError = getMatError(nameControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
      }));

      it(`the 'quantity' control should show the error when event 'blur' fires and its value is empty`, fakeAsync(() => {
        const controlValue = 5;
        const quantityControl: DebugElement = rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl;
        matError = getMatError(quantityControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
        quantityControl.triggerEventHandler('focus', null);
        fixture.detectChanges();
        quantityControl.triggerEventHandler('blur', null);
        fixture.detectChanges();
  
        matError = getMatError(quantityControl);
        expect(matError).toBeTruthy(`there's <mat-error>`);
        expect(rcpEditorComponent.recipeForm.value.ingredients[0].quantity).toBe(null, null);
  
        quantityControl.nativeElement.value = controlValue;
        quantityControl.nativeElement.dispatchEvent(newEvent('input'));
  
        tick();
        fixture.detectChanges();
        expect(rcpEditorComponent.recipeForm.value.ingredients[0].quantity).toBe(controlValue, controlValue);
        matError = getMatError(quantityControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
      }));

      it(`the 'unit' control should show the error when event 'blur' fires and value is empty`, fakeAsync(() => {
        let unitControl: DebugElement = rcpFormControlsAButtons.ingredients.ingArr[0].unitControl;
        matError = getMatError(unitControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
        // show <mat-option>'s
        unitControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
        fixture.detectChanges();
        
        // <mat-option>'s are in .cdk-overlay-container
        let matOptions = unitControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
        const value = matOptions[0].getAttribute('ng-reflect-value');
        expect(matOptions.length).toBeGreaterThan(0, `there're several <mat-option>'s`);
  
        // hide <mat-option>'s by clicking elsewhere beside the .cdk-overlay-connected-position-bounding-box
        unitControl.nativeElement.closest('body').querySelector('.cdk-overlay-backdrop').dispatchEvent(new MouseEvent('click'));
        tick();
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
  
        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        unitControl = rcpFormControlsAButtons.ingredients.ingArr[0].unitControl;
        matOptions = unitControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
        expect(matOptions.length).toBe(0, `0`);
  
        matError = getMatError(unitControl);
        expect(matError).toBeTruthy(`there's <mat-error>`);
        expect(rcpEditorComponent.recipeForm.value.ingredients[0].unit).toBe('', '');
  
        // show <mat-option>'s
        unitControl.query(By.css('.mat-select-trigger')).triggerEventHandler('click', null);
        fixture.detectChanges();
  
        matOptions = unitControl.nativeElement.closest('body').querySelectorAll('.cdk-overlay-container mat-option');
        matOptions[0].dispatchEvent(new MouseEvent('click'));
        unitControl.nativeElement.dispatchEvent(newEvent('input'));
        
        tick();
        fixture.detectChanges();
        matError = getMatError(unitControl);
        
        expect(matError).toBeFalsy(`there's no <mat-error>`);
        expect(rcpEditorComponent.recipeForm.value.ingredients[0].unit).toBe(value, value);
  
        tick(1000);
      }));

      it(`the button 'remove ingredient' (<mat-icon>delete forever</...) shouldn't be created when there's one ingredient`, () => {
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(1, '1 ingredient');
        expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeFalsy(`there's no remove button`);
      });

      it(`the button 'add new ingredient' should add new ingredient`, fakeAsync(() => {
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(1, '1 ingredient');
        rcpFormControlsAButtons.ingredients.addIngredientBut.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();

        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(2, '2 ingredients');
      }));

      it(`buttons 'remove ingredient' (<mat-icon>delete forever</...) should be created when there're 2 and more ingredients`, fakeAsync(() => {
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(1, '1 ingredient');
        expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeFalsy(`there's no remove button`);

        rcpFormControlsAButtons.ingredients.addIngredientBut.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();

        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(2, '2 ingredients');

        expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeTruthy(`there's remove button for 1th ingredient`);
        expect(rcpFormControlsAButtons.ingredients.ingArr[1].removeButton).toBeTruthy(`there's remove button for 2th ingredient`);

      }));
      
      it(`the button 'remove ingredient' (<mat-icon>delete forever</...) should remove needed ingredient`, fakeAsync(() => {
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(1, '1 ingredient');
        expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeFalsy(`there's no remove button`);

        // add 2 ingredients
        rcpFormControlsAButtons.ingredients.addIngredientBut.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();
        rcpFormControlsAButtons.ingredients.addIngredientBut.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(3, '3 ingredients');

        // show error in second ingredient for the control 'name'
        rcpFormControlsAButtons.ingredients.ingArr[1].nameControl.triggerEventHandler('focus', null);
        tick();
        fixture.detectChanges();
        rcpFormControlsAButtons.ingredients.ingArr[1].nameControl.triggerEventHandler('blur', null);
        tick();
        fixture.detectChanges();

        matError = getMatError(rcpFormControlsAButtons.ingredients.ingArr[1].nameControl);
        expect(matError).toBeTruthy(`there's mat-error below the name of 2th ingredient`);

        // remove ingredient with errored control called 'name'
        rcpFormControlsAButtons.ingredients.ingArr[1].removeButton.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        const matErrors = deRcpEditorComponent.queryAll(By.css('.ingredients mat-error'));
        expect(matErrors.length).toBe(0);
        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.ingredients.ingArr.length).toBe(2, ' 2 ingredients')
      }));

      it(`should create new ingredient (FormGroup), method createIngredient()`, () => {
        const newIngredient: FormGroup = rcpEditorComponent.createIngredient();
        expect(newIngredient.value).toBeTruthy('new FormGroup is created');
        expect(newIngredient.value.id).toBe(null, 'null');
        expect(newIngredient.value.name).toBe('', '');
        expect(newIngredient.value.quantity).toBe(null, 'null');
        expect(newIngredient.value.unit).toBe('', '');

      });
    });

    describe(`STEPS FUNCTIONALITY`, () => {
      it(`the control from formArrayName 'steps' should show the error when event 'blur' fires and value is empty`, fakeAsync(() => {
        const controlValue = 'Step 1';
        const stepControl = rcpFormControlsAButtons.steps.stepArr[0].stepControl;
        matError = getMatError(stepControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
        stepControl.triggerEventHandler('focus', null);
        fixture.detectChanges();
        stepControl.triggerEventHandler('blur', null);
        fixture.detectChanges();
  
        matError = getMatError(stepControl);
        expect(matError).toBeTruthy(`there's <mat-error>`);
        expect(rcpEditorComponent.recipeForm.value.steps[0]).toBe('', '');
  
        stepControl.nativeElement.value = controlValue;
        stepControl.nativeElement.dispatchEvent(newEvent('input'));
  
        tick();
        fixture.detectChanges();
        expect(rcpEditorComponent.recipeForm.value.steps[0]).toBe(controlValue, controlValue);
        matError = getMatError(stepControl);
        expect(matError).toBeFalsy(`there's no <mat-error>`);
  
      }));
      
      it(`the button 'remove step' (<mat-icon>delete forever</...) shouldn't be created when there's one step`, () => {
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(1, '1 step');
        expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeFalsy(`there's no remove button`);
      });

      it(`the button 'add new step' should add new step`, fakeAsync(() => {
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(1, '1 step');
        rcpFormControlsAButtons.steps.addStepBut.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();

        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(2, '2 ingredients');
      }));

      it(`buttons 'remove step' (<mat-icon>delete forever</...) should be created when there're 2 and more steps`, fakeAsync(() => {
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(1, '1 step');
        expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeFalsy(`there's no remove button`);
        rcpFormControlsAButtons.steps.addStepBut.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();

        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(2, '2 steps');

        expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeTruthy(`there's remove button for 1th step`);
        expect(rcpFormControlsAButtons.steps.stepArr[1].removeButton).toBeTruthy(`there's remove button for 2th step`);

      }));

      it(`the button 'remove step' (<mat-icon>delete forever</...) should remove needed step`, fakeAsync(() => {
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(1, '1 step');
        expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeFalsy(`there's no remove button`);
        
        // add 2 steps
        rcpFormControlsAButtons.steps.addStepBut.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();
        rcpFormControlsAButtons.steps.addStepBut.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(3, '3 steps');

        // show error in second ingredient for the control 'name'
        rcpFormControlsAButtons.steps.stepArr[1].stepControl.triggerEventHandler('focus', null);
        tick();
        fixture.detectChanges();
        rcpFormControlsAButtons.steps.stepArr[1].stepControl.triggerEventHandler('blur', null);
        tick();
        fixture.detectChanges();

        matError = getMatError(rcpFormControlsAButtons.steps.stepArr[1].stepControl);
        expect(matError).toBeTruthy(`there's mat-error below the 2th step`);

        // remove ingredient with errored control called 'name'
        rcpFormControlsAButtons.steps.stepArr[1].removeButton.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        const matErrors = deRcpEditorComponent.queryAll(By.css('.steps mat-error'));
        expect(matErrors.length).toBe(0);
        rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
        expect(rcpFormControlsAButtons.steps.stepArr.length).toBe(2, ' 2 steps')
      }));
    });

  });

  describe(`EDITING MODE`, () => {
    it(`'recipe$' should pass 'Recipe', method 'fillRecipeForm()' should be called,'addMode=false'`, fakeAsync(() => {
      const fillRecipeFormSpy = spyOn(rcpEditorComponent, 'fillRecipeForm');
      fillRecipeFormSpy.and.callThrough();

      testComponent.sendRecipe(recipe);
      tick();
      fixture.detectChanges();

      expect(fillRecipeFormSpy).toHaveBeenCalled();
      expect(fillRecipeFormSpy).toHaveBeenCalledWith(recipe);
      expect(rcpEditorComponent.addMode).toBeFalsy('addMode=false');

    }));

    it(`all controls should be filled by values, errors are not shown`, fakeAsync(() => {
      fixture.detectChanges();
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
      expect(rcpEditorComponent.addMode).toBeTruthy('addMode=true');
      expect(rcpFormControlsAButtons.idControl.nativeElement.value).toBe('0', '0');
      expect(rcpFormControlsAButtons.titleControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.descriptionControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].idControl.nativeElement.value).toBe('0', '0');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeFalsy(`there's no 'remove ingredient button'`);
      expect(rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeFalsy(`there's no 'remove step button'`);
      expect(rcpFormControlsAButtons.footnotesControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.nutritionFactsControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.preparationTimeControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.cookTimeControl.nativeElement.value).toBe('', '');
      expect(rcpFormControlsAButtons.servingsNumberControl.nativeElement.value).toBe('', '');

      testComponent.sendRecipe(recipe);
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      expect(rcpFormControlsAButtons.titleControl.nativeElement.value).toBe(recipe.title, recipe.title);
      expect(rcpFormControlsAButtons.descriptionControl.nativeElement.value).toBe(recipe.description, recipe.description);
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].idControl.nativeElement.value).toBe(`${recipe.ingredients[0].id}`, `${recipe.ingredients[0].id}`);
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].nameControl.nativeElement.value).toBe(recipe.ingredients[0].name, recipe.ingredients[0].name);
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].quantityControl.nativeElement.value).toBe(`${recipe.ingredients[0].quantity}`, `${recipe.ingredients[0].quantity}`);
      expect(rcpFormControlsAButtons.ingredients.ingArr[0].removeButton).toBeFalsy(`there's no 'remove ingredient button'`);
      expect(rcpFormControlsAButtons.steps.stepArr[0].stepControl.nativeElement.value).toBe(recipe.steps[0], recipe.steps[0]);
      expect(rcpFormControlsAButtons.steps.stepArr[0].removeButton).toBeFalsy(`there's no 'remove step button'`);
      expect(rcpFormControlsAButtons.footnotesControl.nativeElement.value).toBe(recipe.footnotes, recipe.footnotes);
      expect(rcpFormControlsAButtons.nutritionFactsControl.nativeElement.value).toBe(recipe.nutritionFacts, recipe.nutritionFacts);
      expect(rcpFormControlsAButtons.preparationTimeControl.nativeElement.value).toBe(`${recipe.preparationTime}`, `${recipe.preparationTime}`);
      expect(rcpFormControlsAButtons.cookTimeControl.nativeElement.value).toBe(`${recipe.cookTime}`, `${recipe.cookTime}`);
      expect(rcpFormControlsAButtons.servingsNumberControl.nativeElement.value).toBe(`${recipe.servingsNumber}`, `${recipe.servingsNumber}`);
      expect(rcpEditorComponent.recipeForm.value.ingredients[0].unit).toBe(recipe.ingredients[0].unit,recipe.ingredients[0].unit)
      expect(rcpEditorComponent.recipeForm.value.category).toBe(recipe.category, recipe.category);
      expect(rcpEditorComponent.recipeForm.value.id).toBe(recipe.id, recipe.id);

      const matErrors: DebugElement[] = deRcpEditorComponent.queryAll(By.css('form mat-error'));
      expect(matErrors.length).toBe(0);

    }));

    it(`the 'save recipe' button should be enabled`, fakeAsync(() => {
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
      testComponent.sendRecipe(recipe);
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeFalsy('save button is enabled');

      rcpFormControlsAButtons.titleControl.nativeElement.value = '';
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();
      
      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      matError = getMatError(rcpFormControlsAButtons.titleControl);
      expect(matError).toBeTruthy();
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
    }));

    it(`shouldn't update recipe if 'recipeForm' isn't dirty; the event 'createdRecipe' isn't fired`, fakeAsync(() => {
      expect(testComponent.createdRecipeEvObj).toBeFalsy('createdRecipeEvObj is empty');
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
      testComponent.sendRecipe(recipe);
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      deRcpEditorComponent.query(By.css('form')).triggerEventHandler('submit', null);

      tick();
      fixture.detectChanges();
      expect(testComponent.createdRecipeEvObj).toBeFalsy('createdRecipeEvObj is empty');

    }));

    it(`should fire the event 'createdRecipe' when 'recipeForm' is filled correctly and submitted. addMode=false`, fakeAsync(() => {
      const changedTitle = 'Another recipe';
      const changedTitle_slugged = 'another-recipe';
      expect(testComponent.createdRecipeEvObj).toBeFalsy('createdRecipeEvObj is empty');
      expect(rcpFormControlsAButtons.saveRecipeButton.nativeElement.disabled).toBeTruthy('save button is disabled');
      testComponent.sendRecipe(recipe);
      tick();
      fixture.detectChanges();

      rcpFormControlsAButtons.titleControl.nativeElement.value = changedTitle;
      rcpFormControlsAButtons.titleControl.nativeElement.dispatchEvent(newEvent('input'));
      tick();
      fixture.detectChanges();
      
      rcpFormControlsAButtons = getRcpFormControlsAButtons(deRcpEditorComponent);
      deRcpEditorComponent.query(By.css('form')).triggerEventHandler('submit', null);

      tick();
      fixture.detectChanges();
      expect(testComponent.createdRecipeEvObj).toBeTruthy('createdRecipeEvObj is updated');
      expect(testComponent.createdRecipeEvObj.addMode).toBeFalsy('addMode=false');
      expect(testComponent.createdRecipeEvObj.recipe.title).toBe(changedTitle, changedTitle);
      expect(testComponent.createdRecipeEvObj.recipe.title_slugged).toBe(changedTitle_slugged, changedTitle_slugged);
      expect(testComponent.createdRecipeEvObj.recipe.id).toBe(recipe.id, recipe.id);
      expect(testComponent.createdRecipeEvObj.recipe.description).toBe(recipe.description, recipe.description);
      expect(testComponent.createdRecipeEvObj.recipe.ingredients[0].id).toBe(recipe.ingredients[0].id, recipe.ingredients[0].id);
      expect(testComponent.createdRecipeEvObj.recipe.ingredients[0].name).toBe(recipe.ingredients[0].name, recipe.ingredients[0].name);
      expect(testComponent.createdRecipeEvObj.recipe.ingredients[0].quantity).toBe(recipe.ingredients[0].quantity, recipe.ingredients[0].quantity);
      expect(testComponent.createdRecipeEvObj.recipe.ingredients[0].unit).toBe(recipe.ingredients[0].unit, recipe.ingredients[0].unit);
      expect(testComponent.createdRecipeEvObj.recipe.steps[0]).toBe(recipe.steps[0], recipe.steps[0]);
      expect(testComponent.createdRecipeEvObj.recipe.footnotes).toBe(recipe.footnotes, recipe.footnotes);
      expect(testComponent.createdRecipeEvObj.recipe.nutritionFacts).toBe(recipe.nutritionFacts, recipe.nutritionFacts);
      expect(testComponent.createdRecipeEvObj.recipe.preparationTime).toBe(recipe.preparationTime, recipe.preparationTime);
      expect(testComponent.createdRecipeEvObj.recipe.cookTime).toBe(recipe.cookTime, recipe.cookTime);
      expect(testComponent.createdRecipeEvObj.recipe.servingsNumber).toBe(recipe.servingsNumber, recipe.servingsNumber);
      expect(testComponent.createdRecipeEvObj.recipe.category).toBe(recipe.category, recipe.category);
      expect(testComponent.createdRecipeEvObj.recipe.user_username).toBe(recipe.user_username, recipe.user_username);
      expect(+testComponent.createdRecipeEvObj.recipe.date_created).toBeGreaterThan(+recipe.date_created, +recipe.date_created);

    }));


  });
});

// *********************************** HELPERS ************************************
function getRcpFormControlsAButtons(de: DebugElement): RcpFormControlsAButtons {
  const rcpFormControlsAButtons: RcpFormControlsAButtons = {
    idControl: de.query(By.css('input[formcontrolname="id"]')),
    titleControl: de.query(By.css('input[formcontrolname="title"]')),
    categoryControl: de.query(By.css('[formcontrolname="category"]')), // ????????
    descriptionControl: de.query(By.css('textarea[formcontrolname="description"]')),
    ingredients: {
      ingArr: null,
      addIngredientBut: de.query(By.css('.ingredients .button-wrapper button')),
    },
    steps: {
      stepArr: null,
      addStepBut: de.query(By.css('.steps .button-wrapper button')),
    },
    images: {
      imagesControl: null,
      imagesArr: null,
    },
    footnotesControl: de.query(By.css('input[formcontrolname="footnotes"]')),
    nutritionFactsControl: de.query(By.css('[formcontrolname="nutritionFacts"]')),
    preparationTimeControl: de.query(By.css('input[formcontrolname="preparationTime"]')),
    cookTimeControl: de.query(By.css('input[formcontrolname="cookTime"]')),
    servingsNumberControl: de.query(By.css('input[formcontrolname="servingsNumber"]')),

    saveRecipeButton: de.query(By.css('button[type="submit"]'))
  };

  rcpFormControlsAButtons.ingredients.ingArr = de.queryAll(By.css('.ingredients .ingredient-wrapper'))
    .map(ing => {
      const controls: IngredientControls = {
        idControl: ing.query(By.css('input[formcontrolname="id"]')),
        nameControl: ing.query(By.css('input[formcontrolname="name"]')),
        unitControl: ing.query(By.css('[formcontrolname="unit"]')),
        quantityControl: ing.query(By.css('input[formcontrolname="quantity"]')),
        removeButton: ing.query(By.css('button'))
      }
      return controls;
    });

  rcpFormControlsAButtons.steps.stepArr = de.queryAll(By.css('.steps .step-wrapper'))
    .map(step => {
      const controls: StepControls = {
        stepControl: step.query(By.css('textarea')),
        removeButton: step.query(By.css('button'))
      }
      return controls;
    });
  return rcpFormControlsAButtons;
}

function getMatError(de: DebugElement): HTMLElement {
  return de.nativeElement.closest('mat-form-field').querySelector('mat-error');
}

export function newEvent(eventName: string, bubbles = false, cancelable = false) {
  const evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}

@Component({
  selector: 'rcp-test',
  template: `
    <div class="recipe-editor-wrapper">
      <rcp-recipe-editor [username]="username" [recipe$]="recipe$" (createdRecipe)="getCreatedRecipe($event)"></rcp-recipe-editor>
    </div>
  `
})
class TestComponent {
  username = 'test_user';
  private _recipe = new Subject<Recipe>();
  recipe$ = this._recipe.asObservable();

  createdRecipeEvObj: CreatedRecipeEvtObj;
  getCreatedRecipe(ev: CreatedRecipeEvtObj) {
    this.createdRecipeEvObj = ev;
  };

  sendRecipe(rcp: Recipe) {
    this._recipe.next(rcp);
  }
}
