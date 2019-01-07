import { Image } from './image.model';
import { Ingredient } from './ingredient.model';

export interface RecipeOptions {
  id: number;
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

  category: string | string[];
  user_username: string;
}

export class Recipe implements RecipeOptions {
  public readonly id: number;
  date_created: Date;
  url: string;

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

  category: string | string[];
  user_username: string;

  constructor(options: RecipeOptions) {
    this.id = options.id;
    this.title = options.title;
    this.description = options.description;
    this.ingredients = options.ingredients;
    this.steps = options.steps;
    this.images = options.images;
    this.footnotes = options.footnotes;
    this.nutritionFat = options.nutritionFat;
    this.preparetionTime = options.preparetionTime;
    this.cookTime = options.cookTime;
    this.servingsNumber = options.servingsNumber;
    
    this.category = options.category;
    this.user_username = options.user_username;

    this.date_created = new Date();

    this.url = this.createUrl(options.title);
  }

  createUrl(value: string): string {
    const url = value.replace(/ +(?= )/g,'').toLowerCase().split(' ').join('-');
    return url;
  }
}