import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BarComponent } from './bar/bar.component';

const routes: Routes = [
  {
    path: 'fo' + 'o',
    loadChildren: './foo/foo.module#FooModule'
  },
  {
    path: 'qux',
    loadChildren: './qux/qux.module#QuxModule'
  },
  {
    path: 'bar',
    component: BarComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'bar'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
