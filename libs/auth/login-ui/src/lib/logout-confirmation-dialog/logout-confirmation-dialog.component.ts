import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'rcp-logout-confirmation-dialog',
  template: `
    <h2 mat-dialog-title class="mat-h2">Logout</h2>
    <mat-dialog-content>Are you sure you want to logout?</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-flat-button color="accent" [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="accent" [mat-dialog-close]="true">OK</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 300px;
      }

      mat-dialog-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 10px;
      }

      .mat-flat-button {
        margin-left: 8px;
      }
    `,
  ]
})
export class LogoutConfirmationDialogComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
