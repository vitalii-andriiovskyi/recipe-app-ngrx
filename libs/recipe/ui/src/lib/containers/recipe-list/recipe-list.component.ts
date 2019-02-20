import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  componentName = 'RecipeListComponent';
  pageSize = 3;
  recipeEntityService: RecipeEntityCollectionService;

  filteredRecipes$: Observable<Recipe[]>;
  countFilteredRecipes$: Observable<number>;

  private _destroy$ = new Subject();
  constructor(
    private appEntityServices: AppEntityServices,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: { page: 0, itemsPage: this.pageSize } })
    this.filteredRecipes$ = this.recipeEntityService.filteredEntitiesByAllFilters$;
    this.countFilteredRecipes$ = this.recipeEntityService.countFilteredRecipes$;
    this.loadRecipes();
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

  loadRecipes() {
    this.recipeEntityService.loadRecipesByFilters({ tag: this.componentName }).pipe(
      takeUntil(this._destroy$)
    ).subscribe();
  }

}
