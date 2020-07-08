import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaysComponent } from './says.component';

describe('SaysComponent', () => {
  let component: SaysComponent;
  let fixture: ComponentFixture<SaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
