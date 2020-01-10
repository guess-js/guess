import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { SharedComponentsModule } from '@ng-cli-app/shared/components';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [{ path: '', component: HomeComponent }];

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedComponentsModule, RouterModule.forChild(routes)]
})
export class HomeUiModule {}
