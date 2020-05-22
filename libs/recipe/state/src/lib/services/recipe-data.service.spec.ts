import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NgModule, Injectable } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NxModule } from '@nrwl/angular';
import {
  EntityDataModule,
  EntityServices,
  ENTITY_METADATA_TOKEN,
  EntityDataService,
  EntityServicesBase,
  EntityServicesElements,
  EntityCollectionReducerRegistry
} from '@ngrx/data';

import { RecipeEntityCollectionService } from './recipe-entity-collection.service';
import { recipeEntityMetadata } from '../recipe-entity-metadata';
import {
  TemporaryIdGenerator,
  LogService,
  ENV_RCP
} from '@recipe-app-ngrx/utils';

import { RecipeDataService } from './recipe-data.service';

describe('RecipeDataService', () => {
  beforeEach(() => {
    @NgModule({
      imports: [],
      providers: [
        {
          provide: ENTITY_METADATA_TOKEN,
          multi: true,
          useValue: recipeEntityMetadata
        },
        RecipeDataService,
        EntityCollectionReducerRegistry
      ]
    })
    class CustomFeatureModule {
      constructor(
        entityDataService: EntityDataService,
        recipeDataService: RecipeDataService
      ) {
        entityDataService.registerService('Recipe', recipeDataService);
      }
    }

    @NgModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        EntityDataModule.forRoot({}),
        CustomFeatureModule
      ],
      // providers: [ RecipeEntityCollectionService ]
      providers: [
        AppEntityServices,
        { provide: EntityServices, useExisting: AppEntityServices }
      ]
    })
    class RootModule {}

    TestBed.configureTestingModule({
      imports: [RootModule, HttpClientTestingModule],
      providers: [
        TemporaryIdGenerator,
        LogService,
        { provide: ENV_RCP, useValue: { production: false } }
      ]
    });
  });

  it('should be created', () => {
    const service: RecipeDataService = TestBed.get(RecipeDataService);
    expect(service).toBeTruthy();
  });
});

@Injectable()
class AppEntityServices extends EntityServicesBase {
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
