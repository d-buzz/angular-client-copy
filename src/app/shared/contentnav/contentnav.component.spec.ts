import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentnavComponent } from './contentnav.component';

describe('ContentnavComponent', () => {
  let component: ContentnavComponent;
  let fixture: ComponentFixture<ContentnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
