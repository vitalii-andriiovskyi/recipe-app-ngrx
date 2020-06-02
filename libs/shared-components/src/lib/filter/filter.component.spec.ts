import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, DebugElement } from '@angular/core';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subject, Observable } from 'rxjs';

import { FilterComponent } from './filter.component';
import { FilterObserver } from '@recipe-app-ngrx/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { cold, hot, getTestScheduler } from 'jasmine-marbles';
import { tap } from 'rxjs/operators';

describe('FilterComponent', () => {
  let testComponent: TestComponent;
  let deFilterComponent: DebugElement;
  let filterComponent: FilterComponent;
  let fixture: ComponentFixture<TestComponent>;
  let deFilterInput: DebugElement;
  let deCloseIcon: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatIconModule
      ],
      declarations: [ FilterComponent, TestComponent ],
      providers: [ 
        { provide: HAMMER_LOADER, useValue: () => new Promise(() => {})}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    deFilterComponent = fixture.debugElement.query(By.css('rcp-filter'));
  });

  it('should create', () => {
    filterComponent = deFilterComponent.componentInstance;
    expect(filterComponent).toBeTruthy();
  });

  it(`should set placeholder to formControl='filter'`, fakeAsync(() => {
    const placeholder = 'Write a word';
    testComponent.filterPlaceholder = placeholder;

    tick(100);
    fixture.detectChanges();
    deFilterInput = deFilterComponent.query(By.css('input'));
    const placeholderAttr = deFilterInput.nativeElement.getAttribute('placeholder');
    expect(placeholderAttr).toBe(placeholder);
  }));

  it(`should change the value of formControl='filter' when filterObserver.filters$ gets new value`, fakeAsync(() => {
    const filterValue = 'Tasty cookie';
    deFilterInput = deFilterComponent.query(By.css('input'));
    let valueOfFilterInput = deFilterInput.nativeElement.value;
    expect(valueOfFilterInput).toBe('', '');
    deCloseIcon = deFilterComponent.query(By.css('mat-icon'));
    expect(deCloseIcon).toBeFalsy(`there's no close icon`);

    testComponent.filterObserver.setFilter(filterValue);

    tick(300);
    fixture.detectChanges();
    deFilterInput = deFilterComponent.query(By.css('input'));
    valueOfFilterInput = deFilterInput.nativeElement.value;
    expect(valueOfFilterInput).toBe(filterValue, filterValue);

    deCloseIcon = deFilterComponent.query(By.css('mat-icon'));
    expect(deCloseIcon).toBeTruthy(`there's close icon`);
  }));

  it(`should set new value to filterObserver.filters$ while typing in the formControl='filter'`, fakeAsync(() => {
    const filterValue = 'Tasty soup';
    // let expected = cold('a', {a: ''});
    let resultFilter: string;

    // This way of getting the expected result is little strange but it works in this scenario when there is just one emitting of the value per 300 ms
    // It would be good to use cold() but it doesn't work in this case. Probably I misunderstood something.
    testComponent.filter$.pipe(
      tap(value => resultFilter = value)
    ).subscribe();

    deFilterInput = deFilterComponent.query(By.css('input'));
    deFilterInput.nativeElement.value = filterValue;
    deFilterInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(deFilterComponent.componentInstance.filter.value).toBe(filterValue, filterValue);
    // expected = cold('------------------------------a', {a: filterValue});
    // expect(testComponent.filter$).toBeObservable(expected);
    tick(600);
    expect(resultFilter).toBe(filterValue);
  }));

  it(`should clear the value of formControl='filter' by pressing 'close' icon`, fakeAsync(() => {
    const filterValue = 'Tasty soup';
    deFilterInput = deFilterComponent.query(By.css('input'));
    deFilterInput.nativeElement.value = filterValue;
    deFilterInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(deFilterInput.nativeElement.value).toBe(filterValue, filterValue);
    expect(deFilterComponent.componentInstance.filter.value).toBe(filterValue, filterValue);

    deCloseIcon = deFilterComponent.query(By.css('mat-icon'));
    expect(deCloseIcon).toBeTruthy(`there's the close icon`);

    deCloseIcon.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(deFilterInput.nativeElement.value).toBe('', '');
    tick(600);
    fixture.detectChanges();
  }));


});

// ---------------------------------------------------------------------------------

@Component({
  selector: `rcp-test`,
  template: `<rcp-filter [filterObserver]="filterObserver" [filterPlaceholder]="filterPlaceholder"></rcp-filter>`
})
class TestComponent implements OnInit {
  filtersSubject = new Subject<string>();
  filter$: Observable<string> = this.filtersSubject.asObservable();
  
  filterObserver: FilterObserver;

  filterPlaceholder = '';

  ngOnInit() {
    this.filterObserver = {
      filter$: this.filter$,
      setFilter: this.setFilter.bind(this)
    }
  }

  setFilter(value: string) {
    this.filtersSubject.next(value);
  }
}