import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTrendingsComponent } from './show-trendings.component';

describe('ShowTrendingsComponent', () => {
  let component: ShowTrendingsComponent;
  let fixture: ComponentFixture<ShowTrendingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowTrendingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTrendingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
