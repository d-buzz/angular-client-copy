import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowWhoToFollowComponent } from './show-who-to-follow.component';

describe('ShowWhoToFollowComponent', () => {
  let component: ShowWhoToFollowComponent;
  let fixture: ComponentFixture<ShowWhoToFollowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowWhoToFollowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowWhoToFollowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
