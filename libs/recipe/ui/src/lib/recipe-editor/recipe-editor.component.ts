import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { CommonErrorStateMatcher } from '@recipe-app-ngrx/utils';
import { recipeCategoriesList, RecipeCategory, UnitGroup, unitGroups, Recipe, CreatedRecipeEvtObj, RecipeMaker } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-editor',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.scss']
})
export class RecipeEditorComponent implements OnInit {
  @Input() recipe$: Observable<Recipe>;
  @Input() username: string;

  @Output() createdRecipe = new EventEmitter<CreatedRecipeEvtObj>();

  categories: Set<RecipeCategory> = recipeCategoriesList;
  units: UnitGroup[] = unitGroups;
  addMode = false;

  recipeForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    ingredients: new FormArray([
      this.createIngredient()
    ], [Validators.required]),
    steps: new FormArray([
      new FormControl('')
    ], [Validators.required]),
    images: new FormArray([
      // new FormGroup({
      //   url: new FormControl(''),
      //   altText: new FormControl(''),
      //   titleText: new FormControl(''),
      // })
    ]),
    footnotes: new FormControl(''),
    nutritionFat: new FormControl(''),
    preparationTime: new FormControl(''),
    cookTime: new FormControl(''),
    servingsNumber: new FormControl('')
  });

  get title() { return this.recipeForm.get('title') };
  get category() { return this.recipeForm.get('category') };
  get ingredients() { return this.recipeForm.get('ingredients') as FormArray; };
  get steps() { return this.recipeForm.get('steps') as FormArray; };
  matcher = new CommonErrorStateMatcher();;

  constructor() { }

  ngOnInit() {
    this.recipe$.pipe(
      take(1), // maybe I should use 'takeUntil' and additional Subject which emits values in 'ngOnDestroy'
      tap(rcp => {
        // gets recipe and fills the form in order to update the existing recipe
        if (rcp) { 
          this.addMode = true;
          this.fillRecipeForm(rcp);
        }
      })
    ).subscribe();

  }

  createIngredient(): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      name: new FormControl(''),
      unit: new FormControl(''),
      quantity: new FormControl()
    });
  }

  addIngredient() {
    this.ingredients.push(
      this.createIngredient()
    );
  }
  removeIngredient(id: number) { this.ingredients.removeAt(id); }

  addStep() { this.steps.push( new FormControl('')); }
  removeStep(id: number) { this.steps.removeAt(id); }

  saveRecipe() {
    let recipe: Recipe;
    const { valid, dirty, value} = this.recipeForm;
    
    if (valid && dirty) {
      recipe = RecipeMaker.create({...value, user_username: this.username, date_created: new Date()});
      this.createdRecipe.emit({
        addMode: this.addMode,
        recipe: recipe
      });
    }
  }

  fillRecipeForm(recipe: Recipe) {
    const rcp: any = { ...recipe };
    delete rcp.title_slugged;
    delete rcp.date_created;
    delete rcp.user_username;

    this.recipeForm.setValue(rcp);
  }

}
