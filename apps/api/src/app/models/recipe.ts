import { Schema, HookNextFunction, Document, Model, model } from 'mongoose';

import { increment } from './counter';
import { Recipe } from '@recipe-app-ngrx/models';


const RecipeSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    title_slugged: { type: String, required: true },
    description: String,
    ingredients: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        unit: String,
        quantity: Number
      }
    ],
    steps: [{type: String, required: true}],
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String, required: true },
        titleText: { type: String, required: true }
      }
    ],
    footnotes: String,
    nutritionFacts: String,
    preparationTime: Number,
    cookTime: Number,
    servingsNumber: Number,

    category: { 
      url: { type: String, required: true },
      value: String,
    },
    user_username: { type: String, required: true },
    date_created: Date,
  },
  {
    collection: 'recipes',
    read: 'nearest'
  }
);

RecipeSchema.pre('save', function(next: HookNextFunction) {
  // if (typeof this['category'] === 'string') this['category'] = [ this['category'] ];
  increment('recipes', this, next);
});

export interface RecipeDocument extends Recipe, Document {
  id: number,
  _id: any
};

export const RecipeModel: Model<RecipeDocument> = model<RecipeDocument>('Recipe', RecipeSchema);