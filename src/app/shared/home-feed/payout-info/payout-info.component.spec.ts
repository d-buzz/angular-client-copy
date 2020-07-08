import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutInfoComponent } from './payout-info.component';

describe('PayoutInfoComponent', () => {
  let component: PayoutInfoComponent;
  let fixture: ComponentFixture<PayoutInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
