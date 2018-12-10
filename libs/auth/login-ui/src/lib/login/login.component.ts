import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { AuthUserVW } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  pending$ = this.authFacade.pending$;
  error$ = this.authFacade.error$;

  constructor(private authFacade: AuthFacade) { }

  ngOnInit() {
  }

  onSubmit(userAuthData: AuthUserVW) {
    this.authFacade.login(userAuthData);
  }

}
