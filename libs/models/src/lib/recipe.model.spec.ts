import { Recipe, RecipeMaker } from "./recipe.model";


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
    nutritionFat: 'light',
    preparetionTime: 15,
    cookTime: 15,
    servingsNumber: 2,

    category: 'hot dishes',
    user_username: 'rcp_user',
    date_created: new Date()
  }
  let recipe: Recipe;


  it(`should create Recipe with url 'pasta-by-alain-ducasse'`, () => {
    const res = 'pasta-by-alain-ducasse';
    recipe = RecipeMaker.create(recOptions);
    expect(recipe.title_slugged).toBe(res, res);
  });

  it(`should create Recipe with url 'pasta-by-alain-ducasse' when the option 'title=Pasta  by Alain Ducasse' has two double spaces`, () => {
    const res = 'pasta-by-alain-ducasse';
    recOptions.title = 'Pasta  by Alain Ducasse';
    recipe = RecipeMaker.create(recOptions);
    expect(recipe.title_slugged).toBe(res, res);
  });

});
  