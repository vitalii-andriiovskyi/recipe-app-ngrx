import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, Subject } from 'rxjs';
import { tap, map, filter, switchMap, takeUntil, shareReplay } from 'rxjs/operators';

import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { Recipe } from '@recipe-app-ngrx/models';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';

@Component({
  selector: 'rcp-recipe-maker',
  templateUrl: './recipe-maker.component.html',
  styleUrls: ['./recipe-maker.component.scss']
})
export class RecipeMakerComponent implements OnInit, OnDestroy {
  recipeEntityService: RecipeEntityCollectionService;

  recipeById$: Observable<Recipe>;
  destroy$ = new Subject();
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
    
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
