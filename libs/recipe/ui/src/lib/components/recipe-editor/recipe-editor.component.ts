import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable, Subject } from 'rxjs';
import { take, tap, takeUntil } from 'rxjs/operators';

import { CommonErrorStateMatcher } from '@recipe-app-ngrx/utils';
import { recipeCategoriesList, RecipeCategory, UnitGroup, unitGroups, Recipe, CreatedRecipeEvtObj } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-editor',
  templateUrl: './recipe-editor.component.html',
  styleUrls: ['./recipe-editor.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(`:enter`, [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('0.5s ease-in-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class RecipeEditorComponent implements OnInit, OnDestroy {
  @Input() recipe$: Observable<Recipe>;

  @Output() createdRecipe = new EventEmitter<CreatedRecipeEvtObj>();

  private _destroy$ = new Subject();

  categories: Set<RecipeCategory> = recipeCategoriesList;
  units: UnitGroup[] = unitGroups;
  addMode = true;

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
    nutritionFacts: new FormControl(''),
    preparationTime: new FormControl(''),
    cookTime: new FormControl(''),
    servingsNumber: new FormControl('')
  });

  get title() { return this.recipeForm.get('title') };
  get category() { return this.recipeForm.get('category') };
  get ingredients() { return this.recipeForm.get('ingredients') as FormArray; };
  get steps() { return this.recipeForm.get('steps') as FormArray; };
  matcher = new CommonErrorStateMatcher();

  constructor() { }

  ngOnInit() {
    this.recipe$.pipe(
      // take(1), // maybe I should use 'takeUntil' and additional Subject which emits values in 'ngOnDestroy'
      tap(rcp => {
        // gets recipe and fills the form in order to update the existing recipe
        if (rcp) { 
          this.addMode = false;
          this.fillRecipeForm(rcp);
        }
      }),
      takeUntil(this._destroy$)
    ).subscribe();

  }

  ngOnDestroy() {
    this._destroy$.next();
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
    const { valid, dirty, value} = this.recipeForm;
    
    if (valid && dirty) {
      this.createdRecipe.emit({
        addMode: this.addMode,
        recipe: value
      });
    }
  }

  fillRecipeForm(recipe: Recipe) {
    const rcp: any = { ...recipe };
    delete rcp.title_slugged;
    delete rcp.date_created;
    delete rcp.user_username;
    rcp.category = rcp.category.url;

    this.recipeForm.setValue(rcp);
  }

}
