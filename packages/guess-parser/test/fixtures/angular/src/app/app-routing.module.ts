import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BarSimpleComponent } from './bar-simple.component';

const module = './foo/foo.module';
const routes: Routes = [
  {
    path: 'fo' + 'o',
    loadChildren: () => import(module).then(e => e.FooModule)
  },
  {
    path: 'bar',
    loadChildren: () => import('./bar/bar.module').then(m => m.BarModule)
  },
  {
    path: 'bar-simple',
    component: BarSimpleComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'bar'
  }
];

@NgModule({
  declarations: [BarSimpleComponent],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
