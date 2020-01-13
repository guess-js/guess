import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { SharedComponentsModule } from '@ng-cli-app/shared/components';
import { MatButtonModule } from '@angular/material/button';
import { AuthModule, AUTH_ROUTES, AuthGuard } from '@ng-cli-app/auth';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'auth', children: AUTH_ROUTES },
  {
    path: 'home',
    loadChildren: () => import('@ng-cli-app/home/ui').then(m => m.HomeUiModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('@ng-cli-app/customers/ui').then(m => m.CustomersUiModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    SharedComponentsModule,
    MatButtonModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
