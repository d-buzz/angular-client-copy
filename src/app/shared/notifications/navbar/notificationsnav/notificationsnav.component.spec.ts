import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsnavComponent } from './notificationsnav.component';

describe('NotificationsnavComponent', () => {
  let component: NotificationsnavComponent;
  let fixture: ComponentFixture<NotificationsnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
