import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';
import { tap, filter, map, takeUntil, shareReplay, delay } from 'rxjs/operators';
import { ofEntityOp, EntityOp } from 'ngrx-data';

@Component({
  selector: 'rcp-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.scss']
})
export class RecipeViewComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject()

  componentName = 'RecipeViewComponent';
  recipeEntityService: RecipeEntityCollectionService;

  recipe$: Observable<Recipe>;
  loading$: Observable<boolean>;
  error$: Observable<string>;

  loggedIn$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authFacade: AuthFacade,
    private appEntityServices: AppEntityServices
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
    this.recipe$ = combineLatest(
      this.activatedRoute.paramMap.pipe(map(paramMap => paramMap.get('id'))),
      this.recipeEntityService.entityMap$
    ).pipe(
      map(([id, entityMap]) => {
        const recipe = entityMap[id];

        if (!recipe) {
          this.recipeEntityService.getByKey(id, { tag: this.componentName });
        }
        return recipe;
      }),
      takeUntil(this._destroy$),
      shareReplay(1)
    );

    this.loading$ = this.recipeEntityService.loading$.pipe(
      delay(1),
      takeUntil(this._destroy$)
    );

    this.error$ = this.recipeEntityService.errors$.pipe(
      ofEntityOp(EntityOp.QUERY_BY_KEY_ERROR),
      map(errorAction => errorAction.payload.data.error ? errorAction.payload.data.error.message : 'Oops! An error occurred.'),
      // delay guards against `ExpressionChangedAfterItHasBeenCheckedError`
      delay(1),
      takeUntil(this._destroy$)
    );

    this.loggedIn$ = this.authFacade.loggedIn$;
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

}
