import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { NxModule } from '@nrwl/nx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule, RouterStateSerializer, routerReducer } from '@ngrx/router-store';
import { storeFreeze } from 'ngrx-store-freeze';

import { FlexLayoutModule } from '@angular/flex-layout';
import { environment } from '../environments/environment';

import { CustomRouterStateSerializer } from '@recipe-app-ngrx/utils';
import { AuthStateModule } from '@recipe-app-ngrx/auth/state';
import { AuthLoginUiModule } from '@recipe-app-ngrx/auth/login-ui';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';

import { AppComponent } from './app.component';

import { ENV_RCP, LogService } from '@recipe-app-ngrx/utils'; 
import { CoreComponentsModule } from '@recipe-app-ngrx/core-components';
import { RecipeUiModule } from '@recipe-app-ngrx/recipe/ui';
import { RouterHistoryStateModule } from '@recipe-app-ngrx/router-history-state';
   
const routes: Routes = [
  // { path: '**', component: PageNotFoundComponent }
]
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NxModule.forRoot(),
    BrowserAnimationsModule,
    StoreModule.forRoot({
      router: routerReducer
    },{ metaReducers : !environment.production ? [storeFreeze] : [] }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRouterConnectingModule,
    AuthStateModule,
    AuthLoginUiModule,
    FlexLayoutModule,
    SharedComponentsModule,
    RcpEntityStoreModule,
    RouterHistoryStateModule,
    RecipeUiModule,
    // CoreComponentsModule has the route { path: '**', component: PageNotFoundComponent }. Therefore in must be imported after all modules with Routes
    CoreComponentsModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', onSameUrlNavigation: 'reload' }),
  ],
  providers: [
    { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer },
    { provide: ENV_RCP, useValue: environment },
    LogService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
