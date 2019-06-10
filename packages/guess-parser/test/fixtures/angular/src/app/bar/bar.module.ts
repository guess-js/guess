import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'baz',
        loadChildren: () => import('./baz/baz.module').then(m => m.BazModule)
      }
    ])
  ]
})
export class BarModule {}
