import { Router, Request, Response, NextFunction } from 'express';
import { RecipeModel } from '../models/recipe';
import { Recipe } from '@recipe-app-ngrx/models';
import getLogger from '../utils/logger';

const logger = getLogger(module);

export class RecipesApi {

  public static create(router: Router): void {
    router.get('/recipes', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getRecipes(req, res, next);
    });

    router.get('/recipe/:id', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getRecipe(req, res, next);
    });

    router.post('/recipe', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().postRecipe(req, res, next);
    });
  }

  public getRecipes(req: Request, res: Response, next: NextFunction) {
    const queryParams = req.query,
          username = queryParams.username, 
          categoryValue = queryParams.category,
          pageNumber = parseInt(queryParams.page, 10) || 0,
          itemsPerPage = parseInt(queryParams.itemsPerPage, 10),

          queryObj = {
            user_username: username,
            category: { $in: categoryValue }
          };

    if (!username) { delete queryObj.user_username };
    if (!categoryValue) { delete queryObj.category };
    
    RecipeModel.find(queryObj)
      .sort({ date_created: -1 })
      .skip(pageNumber * itemsPerPage)
      .limit(itemsPerPage)
      // .slice([pageNumber, itemsPerPage])
      .then(recipes => { 
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
 
}