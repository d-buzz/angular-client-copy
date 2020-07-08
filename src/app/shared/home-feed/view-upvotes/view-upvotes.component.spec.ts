import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUpvotesComponent } from './view-upvotes.component';

describe('ViewUpvotesComponent', () => {
  let component: ViewUpvotesComponent;
  let fixture: ComponentFixture<ViewUpvotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUpvotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUpvotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
