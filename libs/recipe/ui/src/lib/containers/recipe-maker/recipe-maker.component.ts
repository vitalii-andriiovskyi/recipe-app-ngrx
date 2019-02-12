import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, Subject, merge } from 'rxjs';
import { tap, map, filter, switchMap, takeUntil, shareReplay, delay } from 'rxjs/operators';

import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { ofEntityOp, EntityOp } from 'ngrx-data';

@Component({
  selector: 'rcp-recipe-maker',
  templateUrl: './recipe-maker.component.html',
  styleUrls: ['./recipe-maker.component.scss']
})
export class RecipeMakerComponent implements OnInit, OnDestroy {
  recipeEntityService: RecipeEntityCollectionService;

  recipeById$: Observable<Recipe>;
  nonRecipe$: Observable<null>;
  recipe$: Observable<Recipe | null>

  destroy$ = new Subject();
  error$: Observable<string>;
  loading$: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private appEntityServices: AppEntityServices
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {

    this.recipeById$ = combineLatest(
      this.activatedRoute.paramMap.pipe(map(paramMap => paramMap.get('id'))),
      this.recipeEntityService.entityMap$
    ).pipe(
      filter(([id, entityMap]) => !!parseInt(id, 10)),
      map(([id, entityMap]) => {
        const recipe = entityMap[id];

        if (!recipe) {
          this.recipeEntityService.getByKey(id);
        }
        return recipe;
      }),
      takeUntil(this.destroy$),
      shareReplay(1)
    );

    this.nonRecipe$ = this.activatedRoute.paramMap.pipe(
      map(paramMap => paramMap.get('id')),
      filter(id => !id),
      map(id => null)
    );

    this.recipe$ = merge(this.recipeById$, this.nonRecipe$).pipe(
      takeUntil(this.destroy$)
    )

    this.error$ = this.recipeEntityService.errors$.pipe(
      ofEntityOp(EntityOp.QUERY_BY_KEY_ERROR),
      map(errorAction => errorAction.payload.error ? errorAction.payload.error.message : 'Oops! An error occurred.'),
      // delay guards against `ExpressionChangedAfterItHasBeenCheckedError`
      delay(1),
      takeUntil(this.destroy$)
    );

    this.loading$ = this.recipeEntityService.loading$.pipe(
      delay(1),
      takeUntil(this.destroy$)
    );
    
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
