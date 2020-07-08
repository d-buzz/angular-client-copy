import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewResaidsComponent } from './view-resaids.component';

describe('ViewResaidsComponent', () => {
  let component: ViewResaidsComponent;
  let fixture: ComponentFixture<ViewResaidsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewResaidsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewResaidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
