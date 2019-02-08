import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CommonErrorStateMatcher } from '@recipe-app-ngrx/utils';
import { recipeCategoriesList, RecipeCategory, UnitGroup, unitGroups } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-editor',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.scss']
})
export class RecipeEditorComponent implements OnInit {
  categories: Set<RecipeCategory> = recipeCategoriesList;
  units: UnitGroup[] = unitGroups;

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

  ngOnInit() { }

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

  

}
