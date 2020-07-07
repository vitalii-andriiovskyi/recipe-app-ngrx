import { Router, Request, Response, NextFunction } from 'express';
import { RecipeModel } from '../models/recipe';
import { Recipe } from '@recipe-app-ngrx/models';
import getLogger from '../utils/logger';
import { CounterModel } from '../models/counter';
import { HttpError } from '../utils/error';

const logger = getLogger(module);

export class RecipesApi {

  public static create(router: Router): void {
    
    router.get('/recipes/countFilteredRecipes', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getCountFilteredRecipes(req, res, next);
    });
    
    router.get('/recipes/totalN', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getRecipesTotalNumber(req, res, next);
    });

    router.get('/recipes', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getRecipes(req, res, next);
    });

    router.get('/recipe/:id', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getRecipe(req, res, next);
    });
    
    router.post('/recipe', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().postRecipe(req, res, next);
    });

    router.put('/recipe/:id', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().putRecipe(req, res, next);
    });

    router.delete('/recipe/:id', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().deleteRecipe(req, res, next);
    });
  }

  public getRecipes(req: Request, res: Response, next: NextFunction) {
    const queryParams = req.query,
          username = queryParams.username, 
          categoryUrl = queryParams.category,
          pageNumber = parseInt(queryParams.page as string, 10) || 0,
          itemsPerPage = parseInt(queryParams.itemsPerPage as string, 10),

          queryObj = {
            user_username: username as string,
            'category.url': categoryUrl
          };

    if (!username) { delete queryObj.user_username };
    if (username === 'null') { delete queryObj.user_username };
    if (!categoryUrl) { delete queryObj['category.url'] };
    if (categoryUrl === 'null') { delete queryObj['category.url'] };
       
    RecipeModel.find(queryObj)
      .sort({ date_created: -1 })
      .skip(pageNumber * itemsPerPage)
      .limit(itemsPerPage)
      // .slice([pageNumber, itemsPerPage])
      .then(recipes => { 
        if (recipes.length === 0) throw new HttpError(404, 'Recipes are not found');
        res.status(200).json(recipes);
        next();
      })
      .catch(next);
  }

  public getRecipe(req: Request, res: Response, next: NextFunction) {
    // verify the id parameter exists
    const PARAM_ID = 'id';
    if (req.params[PARAM_ID] === undefined) {
      res.status(404).send('Recipe not found.');
      next();
      return;
    }

    const id: number = parseInt(req.params[PARAM_ID], 10);
    if (!id) {
      res.status(404).send('Recipe not found.');
      next();
      return;
    }

    RecipeModel.findOne({ id: id }).then(recipe => {
      if (recipe === null) {
        res.status(404).send('Recipe not found.');
        next();
        return;
      }

      res.status(200).json(recipe.toObject());
      logger.info('Recipe found and sent');
      next();
    }).catch(next);
  }

  public postRecipe(req: Request, res: Response, next: NextFunction) {
    const recipe = new RecipeModel(req.body);
    recipe.save().then(rcp => {
      res.status(201).json(rcp.toObject());
      logger.info('New recipe created successfully!');
      next();
    }).catch(next);
  }

  public putRecipe(req: Request, res: Response, next: NextFunction) {
    // verify the id parameter exists
    const PARAM_ID = 'id';
    if (req.params[PARAM_ID] === undefined) {
      res.status(404).send(`There's no 'id' parameter in put method`);
      next();
      return;
    }

    const id: number = parseInt(req.params[PARAM_ID], 10);
    // This way of giving the value to updatedRecipe isn't good because some fields could be missed and
    // the new document without those fields will be saved. 
    // This refers to the case when there's no the document for updating and new one must be created
    const updatedRecipe = { ...req.body, id: id };

    RecipeModel.findOneAndUpdate(
      { id: id }, 
      { $set: updatedRecipe },
      { upsert: true, new: true },
    ).then(recipe => {
      res.status(200).json(recipe.toObject());
      logger.info('Recipe updated successfully');
      next();
    }).catch(next);
  }

  public deleteRecipe(req: Request, res: Response, next: NextFunction) {
    // verify the id parameter exists
    const PARAM_ID = 'id';
    if (req.params[PARAM_ID] === undefined) {
      res.status(404).send(`There's no 'id' parameter in delete method`);
      next();
      return;
    }

    const id: number = parseInt(req.params[PARAM_ID], 10);

    RecipeModel.findOneAndRemove({id: id}).then(recipe => {
      const resData = recipe ? recipe.toObject() : null;
      res.status(200).json(resData);
      logger.info('Recipe removed successfully');
      next();
    }).catch(next);
  }

  public getRecipesTotalNumber(req: Request, res: Response, next: NextFunction) {
    CounterModel.findById('recipes').then(counter => {
      res.status(200).json(counter.seq);
      logger.info(`Got the number of recipes: ${counter.seq}`);
      next();
    }).catch(next);
  }

  public getCountFilteredRecipes(req: Request, res: Response, next: NextFunction) {
    const queryParams = req.query,
          username = queryParams.username, 
          categoryUrl = queryParams.category,

          queryObj = {
            user_username: username as string,
            'category.url': categoryUrl
          };

    if (!username) { delete queryObj.user_username };
    if (!categoryUrl) { delete queryObj['category.url'] };
    if (username === 'null') { delete queryObj.user_username };
    if (categoryUrl === 'null') { delete queryObj['category.url'] };

    RecipeModel.countDocuments(queryObj)
      .then(count => { 
        res.status(200).json(count);
        next();
      })
      .catch(next);
  }
 
}