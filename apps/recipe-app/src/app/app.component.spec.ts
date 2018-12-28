import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';

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
        NoopAnimationsModule
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
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have as title 'recipe-app'`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('recipe-app');
  // });

  // it('should render title in a h1 tag', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain(
  //     'Welcome to recipe-app!'
  //   );
  // });
});
