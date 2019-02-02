import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { take, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FilterObserver } from '@recipe-app-ngrx/models';

@Component({
  selector: 'rcp-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() filterObserver: FilterObserver;
  @Input() filterPlaceholder: string;
  filter: FormControl = new FormControl();

  constructor() { }

  clear() {
    this.filter.setValue('');
  }

  ngOnInit() {
    // Set the filter to the current value from filterObserver or ''
    // IMPORTANT: filterObserver must emit at least once!
    this.filterObserver.filter$.pipe(
      take(1),
      tap(value => this.filter.setValue(value))
    ).subscribe();

    this.filter.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => this.filterObserver.setFilter(value)),
    ).subscribe()
  }

}
