import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormComponent } from './login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Component, DebugElement } from '@angular/core';
import { AuthUserVW } from '@recipe-app-ngrx/models';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

export function newEvent(eventName: string, bubbles = false, cancelable = false) {
  const evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}

describe('LoginFormComponent', () => {
  let testComponent: TestComponent;
  let loginFormDE: DebugElement;
  let component: LoginFormComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        NoopAnimationsModule
      ],
      declarations: [ LoginFormComponent, TestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    loginFormDE = fixture.debugElement.query(By.css('rcp-login-form'));
    component = loginFormDE.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the form if pending', () => {
    testComponent.pending = true;

    fixture.detectChanges();

    const form = component.form;
    expect(form.disabled).toBeTruthy('form is disabled');
  });

  it('should display an error message if provided', () => {
    const errorMessage = 'Invalid credentials'
    testComponent.errorMessage = errorMessage;

    fixture.detectChanges();
    
    const loginError = loginFormDE.query(By.css('.loginError'));
    expect(loginError.nativeElement.innerHTML).toContain(errorMessage);
  });

  it('should emit the event \'submit\' if the form is valid when submitted', () => {
    const authData: AuthUserVW = {
      username: 'test',
      password: '1111'
    };

    const inputs = loginFormDE.queryAll(By.css('input'));
    const usernameInput = inputs[0].nativeElement;
    usernameInput.value = authData.username;
    usernameInput.dispatchEvent(newEvent('input'));

    const passfordInput = inputs[1].nativeElement;
    passfordInput.value = authData.password;
    passfordInput.dispatchEvent(newEvent('input'));

    fixture.detectChanges();

    const form = loginFormDE.query(By.css('form')).nativeElement;
    form.dispatchEvent(newEvent('submit'));
    
    fixture.detectChanges();

    const userTestComponent = testComponent.user;
    expect(userTestComponent.username).toBe(authData.username, 'test');
    expect(userTestComponent.password).toBe(authData.password, '1111');
  });

  it('shouldn\'t emit the event \'submit\' if there isn\'t username', () => {
    const authData: AuthUserVW = {
      username: '',
      password: '1111'
    };

    const inputs = loginFormDE.queryAll(By.css('input'));
    const usernameInput = inputs[0].nativeElement;
    usernameInput.value = authData.username;
    usernameInput.dispatchEvent(newEvent('input'));

    const passfordInput = inputs[1].nativeElement;
    passfordInput.value = authData.password;
    passfordInput.dispatchEvent(newEvent('input'));

    fixture.detectChanges();

    const form = loginFormDE.query(By.css('form')).nativeElement;
    form.dispatchEvent(newEvent('submit'));
    
    fixture.detectChanges();

    const user = testComponent.user;
    expect(user).toBeFalsy();

    const matError = loginFormDE.queryAll(By.css('mat-error'))[0].nativeElement;
    expect(matError.innerHTML).toContain('Username is required');
  });

  it('shouldn\'t emit the event \'submit\' if there isn\'t password', () => {
    const authData: AuthUserVW = {
      username: 'test',
      password: ''
    };

    const inputs = loginFormDE.queryAll(By.css('input'));
    const usernameInput = inputs[0].nativeElement;
    usernameInput.value = authData.username;
    usernameInput.dispatchEvent(newEvent('input'));

    const passfordInput = inputs[1].nativeElement;
    passfordInput.value = authData.password;
    passfordInput.dispatchEvent(newEvent('input'));

    fixture.detectChanges();

    const form = loginFormDE.query(By.css('form')).nativeElement;
    form.dispatchEvent(newEvent('submit'));
    
    fixture.detectChanges();

    const user = testComponent.user;
    expect(user).toBeFalsy();
    const matError = loginFormDE.queryAll(By.css('mat-error'))[0].nativeElement;
    expect(matError.innerHTML).toContain('Password is required');
  });

  it('shouldn\'t emit the event \'submit\' if username length is less than 4 characters', () => {
    const authData: AuthUserVW = {
      username: 'rcp',
      password: '1111'
    };

    const inputs = loginFormDE.queryAll(By.css('input'));
    const usernameInput = inputs[0].nativeElement;
    usernameInput.value = authData.username;
    usernameInput.dispatchEvent(newEvent('input'));

    const passfordInput = inputs[1].nativeElement;
    passfordInput.value = authData.password;
    passfordInput.dispatchEvent(newEvent('input'));

    fixture.detectChanges();

    const form = loginFormDE.query(By.css('form')).nativeElement;
    form.dispatchEvent(newEvent('submit'));
    
    fixture.detectChanges();

    const user = testComponent.user;
    expect(user).toBeFalsy();

    const matError = loginFormDE.queryAll(By.css('mat-error'))[0].nativeElement;
    expect(matError.innerHTML).toContain('Username must be at least 4 characters long');
  });

  it('shouldn\'t emit the event \'submit\' if the password length is less than 4 characters', () => {
    const authData: AuthUserVW = {
      username: 'test',
      password: '111'
    };

    const inputs = loginFormDE.queryAll(By.css('input'));
    const usernameInput = inputs[0].nativeElement;
    usernameInput.value = authData.username;
    usernameInput.dispatchEvent(newEvent('input'));

    const passfordInput = inputs[1].nativeElement;
    passfordInput.value = authData.password;
    passfordInput.dispatchEvent(newEvent('input'));

    fixture.detectChanges();

    const form = loginFormDE.query(By.css('form')).nativeElement;
    form.dispatchEvent(newEvent('submit'));
    
    fixture.detectChanges();

    const user = testComponent.user;
    expect(user).toBeFalsy();
    const matError = loginFormDE.queryAll(By.css('mat-error'))[0].nativeElement;
    expect(matError.innerHTML).toContain('Password must be at least 4 characters long');
  });

  
});

@Component({
  template: `
    <rcp-login-form [pending]="pending" [errorMessage]="errorMessage" (submitted)="handleSubmition($event)"></rcp-login-form>
  `
})
class TestComponent {
  pending: boolean;
  errorMessage: string | null;

  user: AuthUserVW;
  constructor() {}

  handleSubmition(user: AuthUserVW) {
    this.user = user;
  }
}
