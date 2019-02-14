import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, Subject, merge, of } from 'rxjs';
import { tap, map, filter, switchMap, takeUntil, shareReplay, delay, catchError } from 'rxjs/operators';

import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe, CreatedRecipeEvtObj, User } from '@recipe-app-ngrx/models';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { ofEntityOp, EntityOp } from 'ngrx-data';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'rcp-recipe-maker',
  templateUrl: './recipe-maker.component.html',
  styleUrls: ['./recipe-maker.component.scss']
})
export class RecipeMakerComponent implements OnInit, OnDestroy {
  componentName = 'RecipeMakerComponent';
  recipeEntityService: RecipeEntityCollectionService;

  recipeById$: Observable<Recipe>;
  nonRecipe$: Observable<null>;
  recipe$: Observable<Recipe | null>

  destroy$ = new Subject();
  error$: Observable<string>;
  loading$: Observable<boolean>;

  user$: Observable<{}>;
  paramMapId: string;
  constructor(
    private activatedRoute: ActivatedRoute, 
    private appEntityServices: AppEntityServices,
    private authFacade: AuthFacade,
    private snackBar: MatSnackBar
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
    this.paramMapId = this.activatedRoute.snapshot.paramMap.get('id');

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
      map(errorAction => errorAction.payload.data.error ? errorAction.payload.data.error.message : 'Oops! An error occurred.'),
      // delay guards against `ExpressionChangedAfterItHasBeenCheckedError`
      delay(1),
      takeUntil(this.destroy$)
    );

    this.loading$ = combineLatest(this.recipeById$, this.recipeEntityService.loading$).pipe(
      map(([recipe, loading]) => !recipe && loading),
      delay(1),
      takeUntil(this.destroy$)
    );

    this.recipeEntityService.loadTotalNRecipes('RecipeMakerComponent');
    this.user$ = this.authFacade.authencticatedUser$;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
