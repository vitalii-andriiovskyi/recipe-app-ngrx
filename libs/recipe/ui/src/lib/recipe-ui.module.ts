import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';

import { RecipeEditorComponent } from './components/recipe-editor/recipe-editor.component';
import { RecipeMakerComponent } from './containers/recipe-maker/recipe-maker.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { AuthGuard } from '@recipe-app-ngrx/auth/state';
import { RecipeViewComponent } from './containers/recipe-view/recipe-view.component';

export { RecipeEditorComponent } from './components/recipe-editor/recipe-editor.component';
export { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';

export const recipeUiRoutes: Route[] = [
  { path: 'create-recipe', component: RecipeMakerComponent, canActivate: [ AuthGuard ] },
  { path: 'edit-recipe/:id', component: RecipeMakerComponent, canActivate: [ AuthGuard ] },
  { path: 'recipe/:id', component: RecipeViewComponent },
];

@NgModule({
  imports: [
    SharedComponentsModule,
    RouterModule.forChild(recipeUiRoutes)
  ],
  declarations: [RecipeEditorComponent, RecipeMakerComponent, RecipeDetailComponent, RecipeViewComponent],
  exports: [ RecipeEditorComponent, RecipeDetailComponent ]
})
export class RecipeUiModule {}
