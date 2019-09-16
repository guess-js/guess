import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuxComponent } from './qux.component';

const routes: Routes = [
  {
    path: '',
    component: QuxComponent
  },
  {
    path: 'index',
    component: QuxComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuxRoutingModule {}
