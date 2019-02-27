import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  MatToolbarModule,
          MatMenuModule,
          MatIconModule,
          MatButtonModule,
          MatDividerModule,
          MatFormFieldModule,
          MatInputModule,
          MatTooltipModule,
          MatSelectModule,
          MatSnackBarModule,
          MatProgressSpinnerModule,
          MatTableModule,
          MatCardModule,
          MatPaginatorModule,
          MatListModule,
          MatSidenavModule,
          MatDialogModule
        } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { FilterComponent } from './filter/filter.component';

const modules = [
  CommonModule,
  FlexLayoutModule,
  ReactiveFormsModule,
  
  MatDialogModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatButtonModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatSelectModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatCardModule,
  MatPaginatorModule,
  MatListModule,
  MatSidenavModule
]
@NgModule({
  imports: [
    modules
  ],
  declarations: [FilterComponent],
  exports: [FilterComponent, modules]
})
export class SharedComponentsModule {}
