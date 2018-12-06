import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';
import { MatButtonModule, MatDialogModule } from '@angular/material';

export { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';
 

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  declarations: [LogoutConfirmationDialogComponent]
})
export class AuthLoginUiModule {}
