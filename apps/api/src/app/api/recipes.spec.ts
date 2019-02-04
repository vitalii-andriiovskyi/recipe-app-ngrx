import { ExpressServer as server } from '../app';
import * as supertest from 'supertest';

import { MongooseStub } from '../../testing/mongoose-stub';
import { Recipe } from '@recipe-app-ngrx/models';
import { RecipeModel } from '../models/recipe';

const app = server.bootstrap().app;
const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe(`RecipesApi`, () => {
  const recipe: Recipe = {
    id: 0,
    title: 'Recipe 1',
    title_slugged: 'recipe-1',
    description: 'Tasty recipe',
    ingredients: [],
    steps: ['step-1', 'step-2', 'step-3'],
    images: [],
    footnotes: 'string',
    nutritionFat: 'string',
    preparetionTime: 12,
    cookTime: 12,
    servingsNumber: 6,

    category: 'dessert',
    user_username: 'test_user',
    date_created: new Date(0),
  };

  const recipes: Recipe[] = [
    recipe,
    {...recipe, id: 1, title: 'Recipe 2', date_created: new Date(1)},
    {...recipe, id: 2, title: 'Recipe 3', date_created: new Date(2)},
    {...recipe, id: 3, title: 'Recipe 4', date_created: new Date(3)},
    {...recipe, id: 4, title: 'Recipe 5', date_created: new Date(4)},
    {...recipe, id: 5, title: 'Recipe 6', category: ['salad', 'dessert'], date_created: new Date(5), user_username: 'test_user_an'},
    {...recipe, id: 6, title: 'Recipe 7', category: ['salad'], date_created: new Date(6), user_username: 'test_user_an'},
    {...recipe, id: 7, title: 'Recipe 8', category: ['salad'], date_created: new Date(7)},
    {...recipe, id: 8, title: 'Recipe 9', category: ['salad'], date_created: new Date(8), user_username: 'test_user_an'},
  ];

  const params: {[field: string]: string} = {
    category: 'dessert',
    username: null,
    page: '0',
    itemsPerPage: '2'
  }

  // beforeAll(async done => {
  beforeAll(() => {
    MongooseStub.connect();
    // await RecipeModel.create(recipes);
    // done();
  });

  beforeEach(() => {
    const recipesArr = recipes.map(rcp => new RecipeModel(rcp));
    recipesArr.forEach(async rcp => await rcp.save())
  });

  afterEach(async done => {
    await RecipeModel.find().remove();
    done();
  });

  afterAll(async done => {
    // await RecipeModel.find().remove();
    MongooseStub.disconnect(done);
  });

  describe(`GET '/api/recipes' with params`, () => {
    it(`should get 2 recipes by category='dessert' and user_username=null`, async () => {
      await new Promise(resolve => setTimeout(resolve, 9000));
      const response = await request.get('/api/recipes').query(params);
      const loadedRecipes = response.body;

      expect(loadedRecipes.length).toBe(2);
      expect(loadedRecipes[0].title).toBe('Recipe 6');
    }, 10000);

    it(`should get 2 recipes by category='dessert' and username='test_user'`, async () => {
      const newParams = {...params, username: 'test_user'};
      await new Promise(resolve => setTimeout(resolve, 9000));
      const response = await request.get('/api/recipes').query(newParams);
      const loadedRecipes = response.body;

      expect(loadedRecipes.length).toBe(2);
      expect(loadedRecipes[0].title).toBe('Recipe 5');
    }, 10000);

    it(`should get 2 recipes by category='null' and username='test_user'`, async () => {
      const newParams = {...params, username: 'test_user', category: null};
      await new Promise(resolve => setTimeout(resolve, 9000));
      const response = await request.get('/api/recipes').query(newParams);
      const loadedRecipes = response.body;

      expect(loadedRecipes.length).toBe(2);
      expect(loadedRecipes[0].title).toBe('Recipe 8');
    }, 10000);
  });
})