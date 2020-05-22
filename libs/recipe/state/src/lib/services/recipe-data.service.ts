import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';

import { LogService } from '@recipe-app-ngrx/utils';
import { Recipe, RecipeFilters } from '@recipe-app-ngrx/models';
import { Observable } from 'rxjs';

@Injectable()
export class RecipeDataService extends DefaultDataService<Recipe>{

  constructor(
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    logger: LogService
  ) { 
    super('Recipe', http, httpUrlGenerator);
    logger.log('Created custom Recipe EntityDataService');
  }

  getTotalNRecipes(): Observable<number> {
    return this.execute('GET', 'api/recipes/totalN');
  }

  getCountFilteredRecipes(filters: RecipeFilters): Observable<number> {
    const paramObj = {
      'category': filters.category,
      'username': filters.username
    }
    const params = new HttpParams({ fromObject: paramObj });
    return this.execute('GET', 'api/recipes/countFilteredRecipes', null, { params });
  }
}
