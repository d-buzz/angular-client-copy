import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreWhoToFollowComponent } from './more-who-to-follow.component';

describe('MoreWhoToFollowComponent', () => {
  let component: MoreWhoToFollowComponent;
  let fixture: ComponentFixture<MoreWhoToFollowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreWhoToFollowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreWhoToFollowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
