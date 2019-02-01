import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from './header/header.component';
import { FilterComponent } from './filter/filter.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  declarations: [HeaderComponent, FilterComponent, PageNotFoundComponent],
  exports: [HeaderComponent, FilterComponent, PageNotFoundComponent]
})
export class SharedComponentsModule {}
