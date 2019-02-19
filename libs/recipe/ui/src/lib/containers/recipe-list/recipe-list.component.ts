import { Component, OnInit } from '@angular/core';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Observable } from 'rxjs';
import { Recipe } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  recipeEntityService: RecipeEntityCollectionService;

  filteredRecipes$: Observable<Recipe[]>;
  countFilteredRecipes$: Observable<number>;
  
  constructor(
    private appEntityServices: AppEntityServices,

  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
    this.filteredRecipes$ = this.recipeEntityService.filteredEntitiesByAllFilters$;
    this.countFilteredRecipes$ = this.recipeEntityService.countFilteredRecipes$;
  }

}
