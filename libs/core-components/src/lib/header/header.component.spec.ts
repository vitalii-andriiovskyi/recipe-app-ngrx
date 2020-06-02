import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { User } from '@recipe-app-ngrx/models';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  // let authFacade: AuthFacade;
  let authFacadeSpy: jasmine.SpyObj<AuthFacade>;
  const authencticatedUser$ = new BehaviorSubject(null);
  const loggedIn$ = new BehaviorSubject(false);

  let loggedIn: DebugElement;

  const logo = 'Logo';
  const userMenu: any[] = [
    { url: '/create-recipe', itemText: 'Create Recipe'}
  ];

  const user: User = {
    _id: '5c18cb336a07d64bac65fddb',
    username: 'test_user',
    password: '*****',
    firstName: 'test_user',
    lastName: 'test_user',
    email: '',
    address: {
      street: '',
      state: '',
      city: '',
      zip: ''
    },
    phone: '+380',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YzE4Y2IzMzZhMDdkNjRiYWM2NWZkZGIiLCJpYXQiOjE1NDU5OTUzNTZ9.XGQMsEZcxVtaFxkoGB0dG1ccApRGwboMqhkB6NSPJZ0',
  }

  beforeEach(async(() => {
    const spyAuthFacade = jasmine.createSpyObj('AuthFacade', ['logout']);
    spyAuthFacade.authencticatedUser$ = authencticatedUser$.asObservable();
    spyAuthFacade.loggedIn$ = loggedIn$.asObservable();

    TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule,
        FlexLayoutModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      declarations: [ HeaderComponent ],
      providers: [
        { provide: AuthFacade, useValue: spyAuthFacade }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.logoName = logo;
    component.userMenuData = userMenu;
    
    fixture.detectChanges();    
    authFacadeSpy = TestBed.get(AuthFacade);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should set the logo text as 'Logo'`, () => {
    const logoEl: HTMLElement = fixture.debugElement.query(By.css('.nav-logo')).nativeElement;
    expect(logoEl.innerHTML).toContain(logo, logo);
  });

  it(`should show the button 'Log in' and not create the button '.btn-logged-in'`, () => {
    const loginEl: HTMLElement = fixture.debugElement.query(By.css('.btn-login')).nativeElement;
    expect(loginEl).toBeTruthy(`There's the button 'Log in'`);
    expect(loginEl.innerHTML).toContain('Log in', 'Log in');

    loggedIn = fixture.debugElement.query(By.css('.btn-logged-in'));
    expect(loggedIn).toBeFalsy(`There's no button 'Logged-in'`);
  });

  it(`should show the button '.btn-logged-in`, fakeAsync(() => {
    
    let loginEl: DebugElement = fixture.debugElement.query(By.css('.btn-login'));
    expect(loginEl.nativeElement).toBeTruthy(`There's the button 'Log in'`);

    loggedIn = fixture.debugElement.query(By.css('.btn-logged-in'));
    expect(loggedIn).toBeFalsy(`There's no button '.btn-logged-in'`);
    
    // fake authentication
    loggedIn$.next(true);
    authencticatedUser$.next(user);

    tick();
    fixture.detectChanges();
    
    loggedIn = fixture.debugElement.query(By.css('.btn-logged-in'));
    expect(loggedIn).toBeTruthy(`There's button '.btn-logged-in'`);
    expect(loggedIn.nativeElement.innerHTML).toContain(user.username, user.username);

    const router = TestBed.get(Router);
    expect(router.url).toBe('/', '/ - url of current page');

    loginEl = fixture.debugElement.query(By.css('.btn-login'));
    expect(loginEl).toBeFalsy(`There's no the button 'Log in'`);
    
    discardPeriodicTasks();
  }));

  it(`should open userMenu after clicking on the button '.btn-logged-in`, fakeAsync(() => {
    loggedIn$.next(true);
    authencticatedUser$.next(user);

    tick();
    fixture.detectChanges();
    loggedIn = fixture.debugElement.query(By.css('.btn-logged-in'));

    loggedIn.triggerEventHandler('click', null);

    tick();
    fixture.detectChanges();

    const userMenuA: HTMLElement[] = fixture.nativeElement.closest('body').querySelectorAll('.mat-menu-content > a');
    expect(userMenuA[0].innerHTML).toContain(userMenu[0].itemText);
    const logout = fixture.nativeElement.closest('body').querySelector('.mat-menu-content .logout');
    expect(logout.innerHTML).toContain('Logout', 'Logout'); 

    logout.click();
    tick(1000);
    fixture.detectChanges(); 
    expect(authFacadeSpy.logout).toHaveBeenCalled();

    discardPeriodicTasks();
  }));


});