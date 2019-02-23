import { Component, OnInit } from '@angular/core';
import { RecipeCategory, recipeCategoriesList, recipeCategoryAll } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  categoriesList: Set<RecipeCategory> = new Set(recipeCategoriesList);
  constructor() { }

  ngOnInit() {
    this.categoriesList.add(recipeCategoryAll);
  }

}
