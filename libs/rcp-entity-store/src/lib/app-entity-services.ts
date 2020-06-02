import { Injectable } from '@angular/core';
import { EntityServicesElements, EntityServicesBase } from '@ngrx/data';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    entityServicesElements: EntityServicesElements,
    // Inject custom services, register them with the EntityServices, and expose in API.
    public readonly recipeEntityCollectionService: RecipeEntityCollectionService
  ) {
    super(entityServicesElements);
    this.registerEntityCollectionServices([recipeEntityCollectionService]);
  }

  // ... Additional convenience members
}
