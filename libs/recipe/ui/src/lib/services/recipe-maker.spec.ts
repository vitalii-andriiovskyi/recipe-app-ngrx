import { RecipeMaker } from './recipe-maker';
import { Recipe, RecipeCategory, recipeCategoriesList } from '@recipe-app-ngrx/models';
import { TestBed } from '@angular/core/testing';


describe('RecipeMaker', () => {
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

    category: { url: 'breads-and-rolls' },
    user_username: 'rcp_user',
    date_created: new Date()
  }
  const title_slugged = 'pasta-by-alain-ducasse';
  const category: RecipeCategory = { value: 'Breads & Rolls', url: 'breads-and-rolls'};


  let recipe: Recipe;
  let recipeMaker: RecipeMaker;

  beforeEach(() => { 
    TestBed.configureTestingModule({
      providers: [
        RecipeMaker
      ]
    });
    recipeMaker = TestBed.inject(RecipeMaker);
  });

  it('should be created', () => {
    expect(recipeMaker).toBeTruthy();
  });
  it(`should create Recipe with url 'pasta-by-alain-ducasse'`, () => {
    recipe = recipeMaker.create(recOptions);
    expect(recipe.title_slugged).toBe(title_slugged, title_slugged);
  });

  it(`should create Recipe with url 'pasta-by-alain-ducasse' when the option 'title=Pasta  by Alain Ducasse' has two double spaces`, () => {
    recOptions.title = 'Pasta  by Alain Ducasse';
    recipe = recipeMaker.create(recOptions);
    expect(recipe.title_slugged).toBe(title_slugged, title_slugged);
  });

  // This test could fail in the future because RecipeMaker uses 'recipesCategoriesList' (Set<RecipeCategory>)
  // but test uses the excerpt of it. This excerpt is saved in variable 'category'
  it(`should create Recipe which has category value 'Breads & Rolls'`, () => {
    recipe = recipeMaker.create(recOptions);
    expect(recipe.category.value).toBe(category.value, category.value);
  });

});
  