import { Router, Request, Response, NextFunction } from 'express';
import { RecipeModel } from '../models/recipe';


export class RecipesApi {

  public static create(router: Router): void {
    router.get('/recipes', (req: Request, res: Response, next: NextFunction) => {
      new RecipesApi().getRecipes(req, res, next);
    })
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
}