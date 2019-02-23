import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, Subject, merge, of } from 'rxjs';
import { tap, map, filter, switchMap, takeUntil, shareReplay, delay, catchError } from 'rxjs/operators';
import { ofEntityOp, EntityOp } from 'ngrx-data';
import { MatSnackBar } from '@angular/material';

import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe, CreatedRecipeEvtObj, User } from '@recipe-app-ngrx/models';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { RecipeMaker } from '../../services/recipe-maker';

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

  username: string;
  paramMapId: string;
  constructor(
    private activatedRoute: ActivatedRoute, 
    private appEntityServices: AppEntityServices,
    private authFacade: AuthFacade,
    private snackBar: MatSnackBar,
    private recipeMaker: RecipeMaker
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
          this.recipeEntityService.getByKey(id, { tag: this.componentName });
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
    this.authFacade.authencticatedUser$.pipe(
      tap(user => this.username = user['username']),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  manageByCreatedRecipe(ev: CreatedRecipeEvtObj) {
    const recipe = this.recipeMaker.create({... ev.recipe, user_username: this.username, date_created: new Date(), category: { url: ev.recipe.category}});
    if (ev.addMode) {
      this.recipeEntityService.add(recipe, { tag: this.componentName }).pipe(
        tap(() => this.openSnackBar('Recipe saved', '&#10006;')),
        catchError(err => {
          const correlationId = err.payload ? err.payload.entity.id : err.requestData.data.id;
          this.recipeEntityService.cancel(correlationId, '', { tag: this.componentName });
          return of({})
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    } else {
      this.recipeEntityService.update(recipe, { tag: this.componentName });      
    }
  }
  
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1000,
    });
  }

}
