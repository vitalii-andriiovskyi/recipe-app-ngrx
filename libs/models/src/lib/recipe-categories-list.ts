// Maybe this file shouldn't be in this this lib. But for this test project it could be
export interface RecipeCategory {
  value?: string;
  url: string;
}

export const recipeCategoryAll: RecipeCategory = {
  value: 'All recipes',
  url: 'all'
}

export const recipeCategoriesList: Set<RecipeCategory> = new Set([
  {value: 'Breads & Rolls', url: 'breads-and-rolls'},
  {value: 'Cookies & Candy', url: 'cookies-and-candy'},
  {value: 'Soups, Stews & Chili', url: 'soups-stews-and-chili'},
  {value: 'Salads', url: 'salads'},
  {value: 'Desserts', url: 'desserts'},
  {value: 'Smoothies', url: 'smoothies'}
]);
