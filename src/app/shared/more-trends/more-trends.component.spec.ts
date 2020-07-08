import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreTrendsComponent } from './more-trends.component';

describe('MoreTrendsComponent', () => {
  let component: MoreTrendsComponent;
  let fixture: ComponentFixture<MoreTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
