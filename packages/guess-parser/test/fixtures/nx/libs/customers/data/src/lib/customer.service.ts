import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from './customer.model';
import { shareReplay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private httpClient: HttpClient) {}

  public getCustomers(): Observable<Customer[]> {
    return this.httpClient
      .get<Customer[]>('/assets/customers.json')
      .pipe(shareReplay(1));
  }

  public getCustomerOfTheDay(): Observable<Customer> {
    return this.getCustomers().pipe(
      map(customers => customers[Math.floor(Math.random() * customers.length)])
    );
  }
}
