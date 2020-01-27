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
  },
  {
    path: '',
    children: [
      {
        path: 'child1',
        component: FooComponent
      }
    ]
  },
  {
    path: 'foo-parent',
    children: [
      {
        path: 'child2',
        component: FooComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FooRoutingModule {}
