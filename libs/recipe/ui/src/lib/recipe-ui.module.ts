import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';

import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';

export const recipeUiRoutes: Route[] = [
  { path: 'create-recipe', component: RecipeEditorComponent }
];

@NgModule({
  imports: [
    SharedComponentsModule,
    RouterModule.forChild(recipeUiRoutes)
  ],
  declarations: [RecipeEditorComponent],
  exports: [RecipeEditorComponent]
})
export class RecipeUiModule {}
