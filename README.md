# RecipeAppNgrx

__Table of contents__
* [The description of the project](#the-description-of-the-project)
* [Helpful sources used for the project](#helpful-sources-used-for-the-project)
* [How to install and use](#how-to-install-and-use)

## The description of the project

The goal of developing this project was to become familiar and confident in work with [`ngrx`](https://ngrx.io/) and [`ngrx-data`](https://github.com/johnpapa/angular-ngrx-data).

This project also uses: 
* [Angular Material](https://material.angular.io/). It's implemented custom [css-theme](./apps/recipe-app/src/recipe-theme.scss) and used lots of [modules from this library](./libs/shared-components/src/lib/shared-components.module.ts)
* [Angular Layout](https://github.com/angular/flex-layout/wiki).

Also, there's the backend part written by means of TypeScript. The backend work relies on these libraries:
* [Express.js](https://expressjs.com/).
* [Mongoose.js](https://mongoosejs.com/) 
* [Winston](https://github.com/winstonjs/winston#readme).

The project is tested. The frontend part is tested by means of [Jasmine](https://jasmine.github.io/). The backend part is tested by means of [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest).

The major toolkit for building the project is [NRWL](https://nrwl.io/). 

### Features

Following the idea provided by [NRWL](https://nrwl.io/) team, the project is structured into apps and libraries. 
It has 2 apps and 10 libraries. Apps are these:
* [recipe-app](./apps/recipe-app/). It contains just `AppModule` and `AppComponent`.
* [api](./apps/api/). It includes the whole backend.

The list of libraries which are reusable modules includes: 
* [auth-state](./libs/auth/state/src). This is `ngrx` part to manage the authorization.
* [auth-login-ui](./libs/auth/state/src). This is UI to log in. 
* [rcp-entity-store](./libs/rcp-entity-store/src). This is the main library for `ngrx-data`. It imports all modules which use `ngrx-data`. In this case, imported module is `RecipeStateModule`. `ngrx-data` doesn't provide method `forChild()` for any Feature Module, so it's needed to register Feature Modules in `rcp-entity-store`. Also it's needed to import into `rcp-entity-store` `CustomEntityCollectionService`, metadata for `EntityDataService` and metaReducers.
* [recipe-state](./libs/recipe/state/src). This is `ngrx` part to manage the saving, updating, loading and filtering recipes. It can filter recipes by `user` and `category` looking at the URL, which is the source of truth in this case. Effects are waiting for `ROUTER_NAVIGATION` action and update filters in needed case. 
* [recipe-ui](./libs/recipe/ui/src). It provides UI for showing, creating and editing the recipes. Creation and updating of a recipe are possible just for authorized users. 
* [router-history-state](./libs/router-history-state/src). This is `ngrx` state containing data about previous and current route. It's used to come to the previous page from login page after signing up. 
* [core-components](./libs/core-components/src). This lib includes `PageNotFoundComponent`, `HeaderComponent` and `SidenavComponent`. 
* [shared-components](./libs/shared-components/src). It has `FilterComponent` and imports lots of Angular Material modules. This lib is useful to many others.
* [models](./libs/models/src). These are different data models used in the project.
* [utils](./libs/utils/src). It includes helpful services and functions.

## Helpful sources used while the project

NGRX:
* Theory:
  - [Ngrx Store (official documentation)](https://ngrx.io/guide/store)
  - [Comprehensive Introduction to @ngrx/store](https://gist.github.com/btroncone/a6e4347326749f938510)
  - [Ngrx Store - An Architecture Guide](https://blog.angular-university.io/angular-ngrx-store-and-effects-crash-course/)
  - [NgRx Entity - Complete Practical Guide](https://blog.angular-university.io/ngrx-entity/)
  - [Angular Ngrx DevTools: Important Practical Tips](https://blog.angular-university.io/angular-ngrx-devtools/)
  - [Using NgRx 4 to Manage State in Angular Applications](https://blog.nrwl.io/using-ngrx-4-to-manage-state-in-angular-applications-64e7a1f84b7b)
  - [NgRx: Patterns and Techniques](https://blog.nrwl.io/ngrx-patterns-and-techniques-f46126e2b1e5)
  - [Angular - Splitter and Aggregation patterns for ngrx/effects](https://medium.com/default-to-open/angular-splitter-and-aggregation-patterns-for-ngrx-effects-c6f2908edf26)
  - [NgRx + Facades: Better State Management](https://medium.com/@thomasburleson_11450/ngrx-facades-better-state-management-82a04b9a1e39)
  - [NgRx: tips & tricks](https://blog.angularindepth.com/ngrx-tips-tricks-69feb20a42a7)
* Working projects:
  - [Angular, NgRx and Angular Material Starter](https://github.com/tomastrajan/angular-ngrx-material-starter)
  - [Book Collection NgRx](https://stackblitz.com/github/ngrx/platform/tree/61cbfe537f9df8cef3dd4a6ee0b8f483e49653f4)

___
Angular Libraries and helpful articles:
* [Angular Material](https://material.angular.io/)
* [The complete guide to Angular Material Themes](https://medium.com/@tomastrajan/the-complete-guide-to-angular-material-themes-4d165a9d24d1)
* [Angular Layout](https://github.com/angular/flex-layout/wiki)
* [Angular Flex-Layout: Flexbox](https://blog.angularindepth.com/angular-flex-layout-flexbox-and-grid-layout-for-angular-component-6e7c24457b63)
* [How To Build Responsive Layouts With Bootstrap 4 and Angular 6](https://medium.com/@tomastrajan/how-to-build-responsive-layouts-with-bootstrap-4-and-angular-6-cfbb108d797b)
* [Nx NRWL](https://nx.dev/getting-started/getting-started/)
* [Building Full-Stack Applications Using Angular CLI and Nx](https://blog.nrwl.io/building-full-stack-applications-using-angular-cli-and-nx-5eff205248f1)

___
Backend TypeScript | MEAN:
* Theory:
  - [MEAN App Unplugged](https://brianflove.com/2017/07/16/mean-app-unplugged/)
  - [TypeScript 2 + Express + Mongoose + Mocha + Chai](https://brianflove.com/2016/11/11/typescript-2-express-mongoose-mocha-chai/)
  - [TypeScript: Declaring Mongoose Schema + Model](https://brianflove.com/2016/10/04/typescript-declaring-mongoose-schema-model/)
  - [TypeScript: Mongoose Schema](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mongoose)
  - [Articles about testing Node.js backend](http://www.albertgao.xyz/tags/jest/)
* Working projects:
  - [MEAN + Material + Reactive in TypeScript](https://github.com/blove/mean-material-reactive/tree/initial-app/server)
  - [MEAN with Angular 2/5 - User Registration and Login Example & Tutorial](http://jasonwatmore.com/post/2017/02/22/mean-with-angular-2-user-registration-and-login-example-tutorial)
  - [Winds - the example of backend](https://github.com/GetStream/Winds/tree/master/api/src)

## How to install and use

To install this project do these actions:
- run `git clone https://github.com/vitalii-andriiovskyi/recipe-app-ngrx.git`
- run `yarn` to install packages
- create the db `rcp` in the `MongoDB`
- import files from the folder `db` into `MongoDB`. The folder `db` is in the root of the project

To run the `api` use command `ng serve api`.  
To run the `recipe-app` use command `ng serve recipe-app`.
