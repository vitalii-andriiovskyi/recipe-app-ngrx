import { Image } from './image.model';
import { Ingredient } from './ingredient.model';
import { RecipeCategory } from './recipe-categories-list';

export interface Recipe {
  id: number;
  title: string;
  title_slugged?: string;
  description?: string;
  ingredients: Ingredient[];
  steps: string[];
  images?: Image[];
  footnotes?: string;
  nutritionFacts?: string;
  preparationTime?: number;
  cookTime?: number;
  servingsNumber?: number;

  category: RecipeCategory;
  user_username: string;
  date_created: Date;
}

export interface CreatedRecipeEvtObj {
  addMode: boolean;
  recipe: any;
}