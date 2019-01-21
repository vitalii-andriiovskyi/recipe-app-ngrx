import { Image } from './image.model';
import { Ingredient } from './ingredient.model';
import { slugify } from '@recipe-app-ngrx/utils';

export interface Recipe {
  id: number;
  title: string;
  title_slugged?: string;
  description?: string;
  ingredients: Ingredient[];
  steps: string[];
  images?: Image[];
  footnotes?: string;
  nutritionFat?: string;
  preparetionTime?: number;
  cookTime?: number;
  servingsNumber?: number;

  category: string | string[];
  user_username: string;
  date_created: Date;
}

export class RecipeMaker {
  constructor() { }

  static create(recipe: Recipe): Recipe {
    const slugged_url = slugify(recipe.title);
    const createdRecipe: Recipe = {
      id: recipe.id,
      title: recipe.title,
      title_slugged: slugged_url,

      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      images: recipe.images,
      footnotes: recipe.footnotes,
      nutritionFat: recipe.nutritionFat,
      preparetionTime: recipe.preparetionTime,
      cookTime: recipe.cookTime,
      servingsNumber: recipe.servingsNumber,

      category: recipe.category,
      user_username: recipe.user_username,
      date_created: new Date(),
    }
    return createdRecipe;
  }
}