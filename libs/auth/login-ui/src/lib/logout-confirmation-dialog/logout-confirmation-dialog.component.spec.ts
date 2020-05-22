import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

describe('LogoutConfirmationDialogComponent', () => {
  let component: LogoutConfirmationDialogComponent;
  let fixture: ComponentFixture<LogoutConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatButtonModule, MatDialogModule ],
      declarations: [ LogoutConfirmationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
