import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgrxDataModule, EntityServices, ENTITY_COLLECTION_META_REDUCERS } from 'ngrx-data';
import { entityMetadata } from './entity-metadata';
import { AppEntityServices } from './app-entity-services';
import { RecipeStateModule, recipeMetaReducer } from '@recipe-app-ngrx/recipe/state';

export { AppEntityServices } from './app-entity-services';

@NgModule({
  imports: [
    CommonModule,
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata
    }),
    RecipeStateModule
  ],
  providers: [
    AppEntityServices,
    { provide: EntityServices, useExisting: AppEntityServices },
    { provide: ENTITY_COLLECTION_META_REDUCERS, useValue: [ recipeMetaReducer ]}
  ]
})
export class RcpEntityStoreModule {}
