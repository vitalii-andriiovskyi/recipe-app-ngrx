import { Image } from './image.model';
import { Ingredient } from './ingredient.model';

export interface Recipe {
  _id: number;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  steps: string[];
  images?: Image[];
  footnotes?: string;
  nutritionFat?: string;
  preparetionTime?: number;
  cookTime?: number;
  servingsNumber?: number;

  category: string;
  user_username: string;
  date_created: Date;
}
