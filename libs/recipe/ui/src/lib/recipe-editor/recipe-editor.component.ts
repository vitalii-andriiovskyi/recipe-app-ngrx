import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'rcp-recipe-editor',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.scss']
})
export class RecipeEditorComponent implements OnInit {
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

}
