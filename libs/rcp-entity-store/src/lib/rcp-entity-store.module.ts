import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppEntityServices } from './app-entity-services';
import { RecipeStateModule, recipeMetaReducer } from '@recipe-app-ngrx/recipe/state';

import { EntityDataModule, EntityServices, ENTITY_COLLECTION_META_REDUCERS } from '@ngrx/data';
import { entityConfig } from './entity-metadata';

export { AppEntityServices } from './app-entity-services';

@NgModule({
  imports: [
    CommonModule,
    EntityDataModule.forRoot(entityConfig),
    RecipeStateModule
  ],
  providers: [
    AppEntityServices,
    { provide: EntityServices, useExisting: AppEntityServices },
    { provide: ENTITY_COLLECTION_META_REDUCERS, useValue: [ recipeMetaReducer ]}
  ]
})
export class RcpEntityStoreModule {}
