import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsFeedComponent } from './friends-feed.component';

describe('FriendsFeedComponent', () => {
  let component: FriendsFeedComponent;
  let fixture: ComponentFixture<FriendsFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendsFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
