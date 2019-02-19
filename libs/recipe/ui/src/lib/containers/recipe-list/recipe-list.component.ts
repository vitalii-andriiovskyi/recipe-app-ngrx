import { Component, OnInit } from '@angular/core';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';

@Component({
  selector: 'rcp-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  recipeEntityService: RecipeEntityCollectionService;

  constructor(
    private appEntityServices: AppEntityServices,

  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
  }

}
