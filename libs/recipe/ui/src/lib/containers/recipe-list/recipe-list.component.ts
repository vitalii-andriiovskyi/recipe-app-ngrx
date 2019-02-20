import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';

import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

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

  ngAfterViewInit() {
    this.paginator.page.pipe(
      tap(() => this.changeRecipeList()),
      takeUntil(this._destroy$)
    ).subscribe();
  }

  loadRecipes() {
    this.recipeEntityService.loadRecipesByFilters({ tag: this.componentName }).pipe(
      takeUntil(this._destroy$)
    ).subscribe();
  }

  changeRecipeList() {
    const updatedQueryParams = {
      page: this.paginator.pageIndex,
      itemsPage: this.paginator.pageSize
    };
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: updatedQueryParams });
  }

}
