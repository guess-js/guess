import { IdleMonitorService } from '@scullyio/ng-lib';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '@ng-cli-app/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public user$: Observable<User>;

  constructor(
    private idle: IdleMonitorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$;
  }

  public logout() {
    this.authService.logout();
  }
}
