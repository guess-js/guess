import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import './cycle-parent';

@Component({
  selector: 'app-baz',
  template: 'Baz'
})
export class BazComponent {}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: BazComponent
  }
];

@NgModule({
  declarations: [BazComponent],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BazModule {}
