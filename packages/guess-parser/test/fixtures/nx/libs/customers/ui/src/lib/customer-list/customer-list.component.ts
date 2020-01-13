import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { CustomerListDataSource } from './customer-list-datasource';

import { Customer, CustomerService } from '@ng-cli-app/customers/data';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<Customer>;

  dataSource: CustomerListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: (keyof Customer)[] = [
    'id',
    'first_name',
    'last_name',
    'email',
    'city',
    'country'
  ];

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.dataSource = new CustomerListDataSource(this.customerService);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
