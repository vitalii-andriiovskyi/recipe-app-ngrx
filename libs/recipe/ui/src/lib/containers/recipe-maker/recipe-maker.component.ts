import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'rcp-recipe-maker',
  templateUrl: './recipe-maker.component.html',
  styleUrls: ['./recipe-maker.component.scss']
})
export class RecipeMakerComponent implements OnInit {
  recipeEntityService: RecipeEntityCollectionService;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private appEntityServices: AppEntityServices
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
  }

}
