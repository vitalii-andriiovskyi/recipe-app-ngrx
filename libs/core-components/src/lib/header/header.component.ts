import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';

@Component({
  selector: 'rcp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  logoName = 'Recipe App';
  userMenuData: any[] = [
    { url: '/create-recipe', itemText: 'Create Recipe' }
  ];
  
  loggedIn$ = this.authFacade.loggedIn$;
  user$ = this.authFacade.authencticatedUser$;

  constructor(private authFacade: AuthFacade) { }

  ngOnInit() {
  }

  logout() {
    this.authFacade.logout();
  }

}
