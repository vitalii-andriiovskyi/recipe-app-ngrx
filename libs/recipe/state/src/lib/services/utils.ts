import { recipeCategoriesList } from '@recipe-app-ngrx/models';

export function isCategory(value: string): boolean {
  return recipeCategoriesList.indexOf(value) > -1;
}