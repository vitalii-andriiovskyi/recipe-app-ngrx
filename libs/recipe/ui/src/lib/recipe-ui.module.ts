import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';

export const recipeUiRoutes: Route[] = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(recipeUiRoutes)
  ]
})
export class RecipeUiModule {}
