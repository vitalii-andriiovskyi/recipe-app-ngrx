import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

import { Observable, Subject, merge, combineLatest, of } from 'rxjs';
import { takeUntil, tap, delay, map, distinctUntilChanged, delayWhen } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { EntityOp, ofEntityOp } from '@ngrx/data';

import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { RecipeEntityCollectionService, RecipeEntityOp } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
  animations: [
    trigger('seqFadeInUp', [
      transition(':enter', [
        query('.recipe-preview-wrapper', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(75, [
            animate('0.5s ease-in-out', style({ opacity: 1, transform: 'translateY(0)'}))
          ])
        ], { 
          optional: true
        })
      ])
    ])
  ]
})
export class RecipeListComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('@seqFadeInUp')
  public animatePage = true; 

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  componentName = 'RecipeListComponent';
  pageSize = 3;
  recipeEntityService: RecipeEntityCollectionService;

  filteredRecipes$: Observable<Recipe[]>;
  countFilteredRecipes$: Observable<number>;
  loading$: Observable<boolean>;
  error$: Observable<string>;
  sumError$: Observable<string>;

  private _destroy$ = new Subject();
  constructor(
    private appEntityServices: AppEntityServices,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: { page: 0, itemsPage: this.pageSize } });
    
    this.route.paramMap.pipe(
      map(paramMap => paramMap.get('id')),
      distinctUntilChanged(),
      tap(() => this.router.navigate(['./'], { relativeTo: this.route, queryParams: { page: 0, itemsPage: this.pageSize } })),
      tap(() => { 
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = this.pageSize
      }),
      takeUntil(this._destroy$)
    ).subscribe();

    this.filteredRecipes$ = this.recipeEntityService.filteredEntitiesByAllFilters$;
    this.countFilteredRecipes$ = this.recipeEntityService.countFilteredRecipes$;
    this.loading$ = this.recipeEntityService.loading$.pipe(
      delay(1),
      delayWhen(value => value ? of(value) : of(value).pipe(delay(400))),
      takeUntil(this._destroy$)
    );

    this.error$ = this.recipeEntityService.errors$.pipe(
      ofEntityOp([EntityOp.QUERY_MANY_ERROR]),
      map(errorAction => errorAction.payload.data.error ? errorAction.payload.data.error.message : 'Oops! An error occurred.'),
      // delay guards against `ExpressionChangedAfterItHasBeenCheckedError`
      // delay(1),
      // takeUntil(this._destroy$)
    );

    this.sumError$ = combineLatest([this.error$, this.filteredRecipes$]).pipe(
      map(([error, recipes]) => {
        const isErrorCase = error && recipes.length === 0;
        return isErrorCase ? error : '';
      }),
      // delay guards against `ExpressionChangedAfterItHasBeenCheckedError`
      delay(1),
      takeUntil(this._destroy$)
    )

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
