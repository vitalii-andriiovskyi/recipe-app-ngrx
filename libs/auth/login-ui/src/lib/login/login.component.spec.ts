import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { NgModule, Component, DebugElement } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { NxModule } from '@nrwl/nx';

import { AuthFacade, AuthStateModule, AuthService } from '@recipe-app-ngrx/auth/state';

import { MatDialog, MatDialogModule } from '@angular/material';
import { User, AuthUserVW } from '@recipe-app-ngrx/models';
import { LoginFormComponent } from '../login-form/login-form.component';
import { LogoutConfirmationDialogComponent } from '../logout-confirmation-dialog/logout-confirmation-dialog.component';

import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { readFirst } from '@nrwl/nx/testing';
import { RouterTestingModule } from '@angular/router/testing';

export function newEvent(eventName: string, bubbles = false, cancelable = false) {
  const evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}

describe('LoginComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let component: LoginComponent;
  let loginComponentDE: DebugElement;

  let facade: AuthFacade;
  let getLoginSpy: jasmine.Spy;
  let getLogoutSpy: jasmine.Spy;
  let getMatDialogOpenSpy: jasmine.Spy;
  const userTest = {
    _id: '',
    username: 'test_name',
    password: '1111',
    firstName: '',
    lastName: '',
    email: ''
  } as User;

  describe('used in NgModule', () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'logout']);
    getLoginSpy = authServiceSpy.login;
    getLogoutSpy = authServiceSpy.logout;

    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    getMatDialogOpenSpy = matDialogSpy.open;

    beforeEach(() => {
      @NgModule({
        imports: [
          ReactiveFormsModule,
          MatButtonModule,
          MatCardModule,
          MatInputModule,
          MatFormFieldModule,
          NoopAnimationsModule,
          MatDialogModule,
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          AuthStateModule,
          RouterTestingModule
        ],
        declarations: [ LoginComponent, LoginFormComponent, LogoutConfirmationDialogComponent, TestComponent ],
       
      })
      class RootModule {}
      TestBed.configureTestingModule({
        imports: [RootModule],
        providers: [
          { provide: AuthService, useValue: authServiceSpy},
          { provide: MatDialog, useValue: matDialogSpy }
        ]
      });

      facade = TestBed.get(AuthFacade);
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent);
      testComponent = fixture.componentInstance;
      
      loginComponentDE = fixture.debugElement.query(By.css('rcp-login'));
      component = loginComponentDE.componentInstance;
      fixture.detectChanges();
    });
  
    it('should create LoginComponent', () => {
      expect(component).toBeTruthy();
    });

    it('should dispatch a login event on submit', async(done) => {
      try {
        const authData: AuthUserVW = {
          username: 'test_name',
          password: '1111'
        };
        getLoginSpy.and.returnValue(of(userTest));
    
        const inputs = fixture.debugElement.queryAll(By.css('input'));
        const usernameInput = inputs[0].nativeElement;
        usernameInput.value = authData.username;
        usernameInput.dispatchEvent(newEvent('input'));
    
        const passfordInput = inputs[1].nativeElement;
        passfordInput.value = authData.password;
        passfordInput.dispatchEvent(newEvent('input'));
    
        fixture.detectChanges();
    
        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        form.dispatchEvent(newEvent('submit'));
        
        fixture.detectChanges();

        const user = await readFirst(facade.authencticatedUser$);
        const error = await readFirst(component.error$);

        expect(user['username']).toBe('test_name', 'test_name');
        expect(error).toBeFalsy('there\'s no error');

        done();
      } catch(err) {
        done.fail(err);
      }
      
    });
    
  });
});


@Component({
  template: `
    <rcp-login></rcp-login>
  `
})
class TestComponent {
  constructor() {}
}