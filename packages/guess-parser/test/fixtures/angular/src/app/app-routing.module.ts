import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BarComponent } from './bar/bar.component';

const module = 'foo/foo.module';
const routes: Routes = [
  {
    path: 'fo' + 'o',
    loadChildren: () => import(module).then(e => e.foo)
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
