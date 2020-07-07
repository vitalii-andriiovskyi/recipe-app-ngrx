import { Injectable } from '@angular/core';

import { slugify } from '@recipe-app-ngrx/utils';
import { Recipe, recipeCategoriesList, RecipeCategory } from '@recipe-app-ngrx/models';

@Injectable({
  providedIn: 'root'
})
export class RecipeMaker {
  categoriesList = recipeCategoriesList;

  constructor() { }

  create(recipe: Recipe): Recipe {
    const slugged_url = slugify(recipe.title);
    const cat: RecipeCategory = this.findRightCategory(recipe.category.url, this.categoriesList);
    const createdRecipe: Recipe = {
      id: recipe.id,
      title: recipe.title,
      title_slugged: slugged_url,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      images: recipe.images,
      footnotes: recipe.footnotes,
      nutritionFacts: recipe.nutritionFacts,
      preparationTime: recipe.preparationTime,
      cookTime: recipe.cookTime,
      servingsNumber: recipe.servingsNumber,
      category: cat ,
      user_username: recipe.user_username,
      date_created: new Date(),
    };
    return createdRecipe;
  }

  findRightCategory(category: string, categoriesList: Set<RecipeCategory>): RecipeCategory {
    let result: RecipeCategory;

    categoriesList.forEach(cat => {
      if (cat.url === category) {
        result = cat;
      }
    });
    return result;
  }
}
