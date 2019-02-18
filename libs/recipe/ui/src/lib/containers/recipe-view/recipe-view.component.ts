import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { Subject } from 'rxjs';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';

@Component({
  selector: 'rcp-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.scss']
})
export class RecipeViewComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject()

  componentName = 'RecipeViewComponent';
  recipeEntityService: RecipeEntityCollectionService;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authFacade: AuthFacade,
    private appEntityServices: AppEntityServices
  ) {
    this.recipeEntityService = appEntityServices.recipeEntityCollectionService;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

}
