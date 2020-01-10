import { HomeComponent } from './home.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { SharedComponentsModule } from '@ng-cli-app/shared/components';
import { MatButtonModule } from '@angular/material/button';
import { AuthModule } from '@ng-cli-app/auth';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

export default {
  title: 'HomeComponent'
};

export const primary = () => ({
  moduleMetadata: {
    imports: [
      BrowserModule,
      HttpClientModule,
      RouterModule.forRoot([
        {
          path: '**',
          component: HomeComponent
        }
      ]),
      BrowserAnimationsModule,
      SharedComponentsModule,
      MatButtonModule,
      AuthModule
    ],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: '/'
      }
    ]
  },
  component: HomeComponent,
  props: {}
});
