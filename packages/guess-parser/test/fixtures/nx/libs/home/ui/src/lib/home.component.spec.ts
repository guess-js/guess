import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { EMPTY } from 'rxjs';
import { SharedComponentsModule } from '@ng-cli-app/shared/components';
import { CustomerService } from '@ng-cli-app/customers/data';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    const customerServiceMock = {
      getCustomerOfTheDay: () => EMPTY
    };

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [HomeComponent],
      providers: [{ provide: CustomerService, useValue: customerServiceMock }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
