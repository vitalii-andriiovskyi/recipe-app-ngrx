import { recipeCategoriesList } from '@recipe-app-ngrx/models';

// Not sure about having this function as single function. Maybe it should be moved to RecipeEffects
// Because it isn't universal function. It uses 'recipeCategoriesList' and depends on this list
export function isRecipeCategory(value: string): boolean {
  let result = false;

  recipeCategoriesList.forEach(item => {
    if(item.url === value) result = true;
  })
  return result;
}