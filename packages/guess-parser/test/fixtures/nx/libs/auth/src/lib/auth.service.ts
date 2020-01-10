import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User> = new BehaviorSubject(null);

  public currentUser$ = this.userSubject.asObservable();

  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor(private router: Router) {}

  public login(username: string, password: string): Observable<User> {
    if ('test' === username) {
      const user = { username, fullName: 'Test User' };

      this.userSubject.next(user);
      this.router.navigateByUrl('/');

      return of(user);
    }

    return throwError(new Error('Wrong user or password'));
  }

  public logout() {
    this.userSubject.next(null);
    this.router.navigateByUrl('/auth/login');
  }
}

export interface User {
  username: string;
  fullName: string;
}
