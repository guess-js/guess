import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BarSimpleComponent } from './bar-simple.component';

const module = './foo/foo.module';
const routes: Routes = [
  // {
  //   path: 'foo',
  //   component: BarSimpleComponent,
  //   children: [
  //     {
  //       path: 'qux',
  //       component: BarSimpleComponent,
  //       children: [
  //         {
  //           path: 'bar',
  //           loadChildren: () => import('./bar/bar.module').then(m => m.BarModule)
  //         }
  //       ]
  //     }
  //   ]
  // },
  {
    path: 'fo' + 'o',
    loadChildren: () => import(module).then(e => e.FooModule)
  },
  {
    path: 'bar',
    loadChildren: () => import('./bar/bar.module').then(m => m.BarModule)
  },
  {
    path: 'qux',
    loadChildren: 'app/qux/qux.module#QuxModule'
  },
  {
    path: 'library',
    loadChildren: 'app/wrapper/wrapper.module#WrapperModule'
  },
  {
    path: 'bar-simple',
    component: BarSimpleComponent
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'eager',
    children: [
      {
        path: 'lazy',
        loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule)
      }
    ]
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
