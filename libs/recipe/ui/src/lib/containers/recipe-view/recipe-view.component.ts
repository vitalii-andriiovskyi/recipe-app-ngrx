import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';
import { tap, filter, map, takeUntil, shareReplay, delay } from 'rxjs/operators';

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
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

}
