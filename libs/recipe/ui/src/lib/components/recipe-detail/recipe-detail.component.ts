import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Recipe, recipeCategoriesList } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeDetailComponent implements OnInit {
  @Input() loggedIn: boolean;
  @Input() recipe: Recipe;

  displayedColumns = ['ingredientName', 'ingredientQuantity'];
  
  constructor() { }

  ngOnInit() {
  }

}
