import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginComponent } from './login/login.component';

export { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';

const authRoutes: Routes = [
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [
    SharedComponentsModule,
    RouterModule.forChild(authRoutes)
  ],
  declarations: [LogoutConfirmationDialogComponent, LoginFormComponent, LoginComponent],
  exports: [LoginFormComponent, LoginComponent],
  entryComponents: [LogoutConfirmationDialogComponent],
})
export class AuthLoginUiModule {}
