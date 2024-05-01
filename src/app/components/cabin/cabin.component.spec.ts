import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinComponent } from './cabin.component';

describe('CabinComponent', () => {
  let component: CabinComponent;
  let fixture: ComponentFixture<CabinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CabinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
