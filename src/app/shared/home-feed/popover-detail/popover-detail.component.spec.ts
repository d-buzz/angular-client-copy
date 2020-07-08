import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverDetailComponent } from './popover-detail.component';

describe('PopoverDetailComponent', () => {
  let component: PopoverDetailComponent;
  let fixture: ComponentFixture<PopoverDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopoverDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopoverDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
