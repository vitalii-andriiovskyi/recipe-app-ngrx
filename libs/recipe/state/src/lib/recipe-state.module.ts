import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENTITY_METADATA_TOKEN } from 'ngrx-data';

import { recipeEntityMetadata } from './recipe-entity-metadata';

@NgModule({
  imports: [CommonModule],
  providers: [
    { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: recipeEntityMetadata }
  ]
})
export class RecipeStateModule {}
