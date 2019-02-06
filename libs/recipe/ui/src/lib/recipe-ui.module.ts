import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { RecipeEditorComponent } from './recipe-editor/recipe-editor.component';

export const recipeUiRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(recipeUiRoutes)
  ],
  declarations: [RecipeEditorComponent]
})
export class RecipeUiModule {}
