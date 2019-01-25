import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgrxDataModule, EntityServices } from 'ngrx-data';
import { entityMetadata } from './entity-metadata';
import { AppEntityServices } from './app-entity-services';
import { RecipeStateModule } from '@recipe-app-ngrx/recipe/state';

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
  ]
})
export class RcpEntityStoreModule {}
