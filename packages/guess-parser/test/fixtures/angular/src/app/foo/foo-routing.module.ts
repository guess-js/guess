import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FooComponent } from './foo.component';

const baz = 'baz';
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: FooComponent
  },
  {
    path: 'index',
    component: FooComponent
  },
  {
    path: 'baz',
    loadChildren: baz + '/baz.module#BazModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FooRoutingModule {}
