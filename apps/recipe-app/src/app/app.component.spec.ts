import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { CoreComponentsModule } from '@recipe-app-ngrx/core-components';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  const authencticatedUser$ = new BehaviorSubject(null);
  const loggedIn$ = new BehaviorSubject(false);
  const pending$ = new BehaviorSubject(false);
  const error$ = new BehaviorSubject(null);

  beforeEach(async(() => {
    const spyAuthFacade = jasmine.createSpyObj('AuthFacade', ['logout']);
    spyAuthFacade.authencticatedUser$ = authencticatedUser$.asObservable();
    spyAuthFacade.loggedIn$ = loggedIn$.asObservable();
    spyAuthFacade.pending$ = pending$.asObservable();
    spyAuthFacade.error$ = error$.asObservable();

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, 
        FlexLayoutModule, 
        SharedComponentsModule,
        NoopAnimationsModule,
        CoreComponentsModule,
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthFacade, useValue: spyAuthFacade }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app: AppComponent = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();

    // let matSidenavContainer = fixture.debugElement.query(By.css('mat-sidenav-container'));
    let containerEl: HTMLElement = fixture.debugElement.query(By.css('rcp-header + .container')).nativeElement;
    containerEl.style.height = '400px';

    // let buttonEl: HTMLElement = containerEl.querySelector('.open-sidenav-btn-wrapper button');
    // expect(buttonEl).toBeTruthy();
    // console.log(buttonEl);
    // console.log(matSidenavContainer.nativeElement);
    // console.log(window.innerWidth);
    
    // // Object.defineProperty(window, 'innerWidth', {value: 600, writable: true});
    // window.resizeBy(600, 100);
    // console.log(window.innerWidth);
    // console.log(window);
    // const myMediaQueryListEvent = new MediaQueryListEvent('change', {media: '(max-width: 1210px)', matches: false});
    // // window.dispatchEvent(myMediaQueryListEvent);
    // // window.dispatchEvent(myMediaQueryListEvent);
    // window.dispatchEvent(new Event('resize'));
    // fixture.detectChanges();
    // fixture.detectChanges();
    // fixture.detectChanges();
    // matSidenavContainer = fixture.debugElement.query(By.css('mat-sidenav-container'));
    // console.log(matSidenavContainer.nativeElement);
    // app = fixture.debugElement.componentInstance;
    // console.log(app.mobileQuery.matches);

    // containerEl = fixture.debugElement.query(By.css('rcp-header + .container')).nativeElement;
    // buttonEl = containerEl.querySelector('.open-sidenav-btn-wrapper button');
    // expect(buttonEl).toBeFalsy(`there's no button`);

    // console.log(buttonEl);
  });

  // Main functions of the AppComponent: PROBLEM: I can't change the width of window manually;

  // should show the sidenav and not to show the '.open-sidenav-btn-wrapper' when window has width >= 960px
  // shouldn't show the sidenav and should show the '.open-sidenav-btn-wrapper' when window has width <= 959px
  // click on button in '.open-sidenav-btn-wrapper' should open the sidenav.

 });
