import { Component, OnInit, Input } from '@angular/core';
import { Recipe } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-recipe-preview',
  templateUrl: './recipe-preview.component.html',
  styleUrls: ['./recipe-preview.component.scss']
})
export class RecipePreviewComponent implements OnInit {
  @Input() recipe: Recipe;

  constructor() { }

  ngOnInit() {
  }

}
