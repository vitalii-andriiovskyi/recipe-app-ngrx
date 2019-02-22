import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavComponent } from './sidenav.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RecipeCategory, recipeCategoriesList } from '@recipe-app-ngrx/models';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  const categoriesList: Set<RecipeCategory> = recipeCategoriesList;
  const firstCategoryItem: RecipeCategory = Array.from(recipeCategoriesList)[0];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        RouterTestingModule,
        SharedComponentsModule
      ],
      declarations: [ SidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it(`should show ${categoriesList.size + 1} sidenav items`, () => {
    const sidenavElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.mat-list-item'));
    expect(sidenavElements.length).toBe(categoriesList.size + 1, categoriesList.size + 1);
  });

  it(`should show ${firstCategoryItem.value} in first item and ${firstCategoryItem.url} in its 'href'`, () => {
    const sidenavElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.mat-list-item'));
    const aEl: HTMLElement = sidenavElements[0].query(By.css('a')).nativeElement;

    expect(aEl.innerText).toContain(firstCategoryItem.value, firstCategoryItem.value);
    expect(aEl.getAttribute('href')).toContain(firstCategoryItem.url, firstCategoryItem.url);
  });
});
