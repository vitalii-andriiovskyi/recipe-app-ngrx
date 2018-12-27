import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';
import { MatButtonModule, MatDialogModule, MatCardModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { LoginFormComponent } from './login-form/login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';

export { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';

const authRoutes: Routes = [
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule.forChild(authRoutes)
  ],
  declarations: [LogoutConfirmationDialogComponent, LoginFormComponent, LoginComponent],
  exports: [LoginFormComponent, LoginComponent],
  entryComponents: [LogoutConfirmationDialogComponent],
})
export class AuthLoginUiModule {}
