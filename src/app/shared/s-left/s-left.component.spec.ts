import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SLeftComponent } from './s-left.component';

describe('SLeftComponent', () => {
  let component: SLeftComponent;
  let fixture: ComponentFixture<SLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
