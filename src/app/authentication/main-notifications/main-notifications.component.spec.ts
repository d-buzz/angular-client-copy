import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainNotificationsComponent } from './main-notifications.component';

describe('MainNotificationsComponent', () => {
  let component: MainNotificationsComponent;
  let fixture: ComponentFixture<MainNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
