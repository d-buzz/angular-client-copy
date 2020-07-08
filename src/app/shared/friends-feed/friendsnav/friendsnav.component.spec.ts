import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsnavComponent } from './friendsnav.component';

describe('FriendsnavComponent', () => {
  let component: FriendsnavComponent;
  let fixture: ComponentFixture<FriendsnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendsnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
