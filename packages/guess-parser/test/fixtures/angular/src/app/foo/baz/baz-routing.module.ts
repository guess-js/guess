import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BazComponent } from './baz.component';

const routes: Routes = [
  {
    path: '',
    component: BazComponent
  },
  {
    path: 'index',
    component: BazComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BazRoutingModule {}
