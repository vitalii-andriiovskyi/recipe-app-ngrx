import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENTITY_METADATA_TOKEN, EntityDataService } from 'ngrx-data';

import { recipeEntityMetadata } from './recipe-entity-metadata';
import { RecipeDataService } from './services/recipe-data.service';

export { RecipeEntityCollectionService } from './services/recipe-entity-collection.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: recipeEntityMetadata },
    RecipeDataService
  ]
})
export class RecipeStateModule {
  constructor(
    entityDataService: EntityDataService,
    recipeDataService: RecipeDataService
  ) {
    entityDataService.registerService('Recipe', recipeDataService);
  }
}
