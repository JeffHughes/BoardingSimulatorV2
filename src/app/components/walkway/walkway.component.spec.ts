import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalkwayComponent } from './walkway.component';

describe('WalkwayComponent', () => {
  let component: WalkwayComponent;
  let fixture: ComponentFixture<WalkwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkwayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalkwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
