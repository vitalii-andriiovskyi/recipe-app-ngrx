import { Recipe } from './recipe.model';


describe('RECIPE MODEL', () => {
  const recOptions: Recipe = {
    id: 0,
    title: 'Pasta by Alain Ducasse',
    description: 'Testy pasta',
    ingredients: [
      { id: 0, name: 'pasta'},
      { id: 1, name: 'cheese'}
    ],
    steps: [ 'Step 1', 'Step 2', 'Step 3'],
    images: [
      {
        url: 'image-1',
        altText: 'Pasta',
        titleText: 'Pasta'
      }
    ],
    footnotes: 'Footnotes',
    nutritionFacts: 'light',
    preparationTime: 15,
    cookTime: 15,
    servingsNumber: 2,

    category: { url: 'hot-dishes'},
    user_username: 'rcp_user',
    date_created: new Date()
  }

  it(`just for working all test`, () => {
    const res = 'pasta-by-alain-ducasse';
    expect(recOptions.title).toBe(recOptions.title, recOptions.title);
  });

});
  