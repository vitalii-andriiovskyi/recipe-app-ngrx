import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { AppEntityServices } from '@recipe-app-ngrx/rcp-entity-store';
import { Subject } from 'rxjs';

@Component({
  selector: 'rcp-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.scss']
})
export class RecipeViewComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject()

  constructor(
    private activatedRoute: ActivatedRoute,
    private authFacade: AuthFacade,
    private appEntityServices: AppEntityServices
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

}
