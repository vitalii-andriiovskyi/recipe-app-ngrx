import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgrxDataModule, EntityServices } from 'ngrx-data';
import { entityMetadata } from './entity-metadata';

@NgModule({
  imports: [
    CommonModule,
    NgrxDataModule.forRoot({
      entityMetadata: entityMetadata
    })
  ]
})
export class RcpEntityStoreModule {}
