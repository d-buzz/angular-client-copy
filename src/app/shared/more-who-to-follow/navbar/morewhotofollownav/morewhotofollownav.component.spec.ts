import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MorewhotofollownavComponent } from './morewhotofollownav.component';

describe('MorewhotofollownavComponent', () => {
  let component: MorewhotofollownavComponent;
  let fixture: ComponentFixture<MorewhotofollownavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MorewhotofollownavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MorewhotofollownavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
