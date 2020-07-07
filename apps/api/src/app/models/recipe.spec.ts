import { MongooseStub } from '../../testing/mongoose-stub';
import { CounterModel, CounterDocument } from './counter';
import { RecipeModel, RecipeDocument } from './recipe';
import { Counter, Recipe } from '@recipe-app-ngrx/models';

describe(`RecipeModel`, () => {
  let counterModel: CounterDocument;
  let recipeModel: RecipeDocument;
  const counter: Counter = {
    _id: 'recipes',
    seq: 0
  };

  const recipe: Recipe = {
    id: 0,
    title: 'Recipe 1',
    title_slugged: 'recipe-1',
    description: 'Tasty recipe',
    ingredients: [],
    steps: [],
    images: [],
    footnotes: 'string',
    nutritionFacts: 'string',
    preparationTime: 12,
    cookTime: 12,
    servingsNumber: 6,

    category: { url: 'dessert' },
    user_username: 'test_user',
    date_created: new Date(),
  }

  beforeAll(async () => {
    MongooseStub.connect();

    try {
      counterModel = await CounterModel.findById('recipes');
    } catch(err) {
      counterModel = new CounterModel(counter);
      return counterModel.save((err, count) => {
        if (err) {
          console.log('error');
          return;
        }
        console.log(count);
      });
    }
  });

  beforeEach(async () => {
    try {
      counterModel = await counterModel.update({seq: 0});
    } catch(err) {
      console.log(err);
    }
  });

  // afterEach(async () => {
  //   await counterModel.remove();
  // })

  afterAll((done) => {
    MongooseStub.disconnect(done);
  });

  it(`should save the recipe, set its 'id' to 1`, async done => {
    try {
      let counterM: Counter = await CounterModel.findById('recipes');
      expect(counterM.seq).toBe(0);

      recipeModel = new RecipeModel(recipe);
      await recipeModel.save();

      const recipes: Recipe[] = await RecipeModel.find().exec();
      expect(recipes.length).toBe(1);
      expect(recipes[0].id).toBe(1);
      expect(typeof recipes[0].category).toBe('object');

      counterM = await CounterModel.findById('recipes');
      expect(counterM.seq).toBe(1);

      const recipe2: Recipe = {...recipe, title: 'Recipe 2', title_slugged: 'recipe-2', steps: ['step-1', 'step-2']};
      const recipeModel2: RecipeDocument = new RecipeModel(recipe2);
      await recipeModel2.save();

      const recipeDocument = await RecipeModel.findOne({ id: 2});
      expect(recipeDocument).toBeTruthy();
      expect(recipeDocument.steps.length).toBe(2);
      
      await recipeModel.remove();
      await recipeModel2.remove();
      done();
    } catch (err) {
      done.fail(err);
    }

  })
})