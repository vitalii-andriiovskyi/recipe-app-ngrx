import { Injectable } from '@angular/core';
import { EntityServicesElements, EntityServicesBase } from 'ngrx-data';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    entityServicesElements: EntityServicesElements,
    // Inject custom services, register them with the EntityServices, and expose in API.
    // public readonly villainsService: VillainsService
  ) {
    super(entityServicesElements);
    this.registerEntityCollectionServices([]);
  }

  // ... Additional convenience members
}
