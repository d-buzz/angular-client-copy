import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SRightComponent } from './s-right.component';

describe('SRightComponent', () => {
  let component: SRightComponent;
  let fixture: ComponentFixture<SRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
