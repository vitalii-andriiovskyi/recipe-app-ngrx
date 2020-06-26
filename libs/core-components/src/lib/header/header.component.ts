import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { UserFacade } from '@recipe-app-ngrx/user/state';
import { Observable } from 'rxjs';
import { User } from '@recipe-app-ngrx/models';

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
  user$: Observable<User> = this.userFacade.getUser$;

  constructor(private authFacade: AuthFacade,
              private userFacade: UserFacade) { }

  ngOnInit() {
    this.userFacade.loadUser(); // maybe this should be at the AppComponent. Anyway HeaderComponent loads contstantly.
  }

  logout() {
    this.authFacade.logout();
  }

}
