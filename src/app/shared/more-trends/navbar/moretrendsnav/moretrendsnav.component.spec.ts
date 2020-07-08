import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoretrendsnavComponent } from './moretrendsnav.component';

describe('MoretrendsnavComponent', () => {
  let component: MoretrendsnavComponent;
  let fixture: ComponentFixture<MoretrendsnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoretrendsnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoretrendsnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
