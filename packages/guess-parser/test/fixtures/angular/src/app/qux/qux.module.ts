import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({

})
class QuxComponent {}


@NgModule({
  declarations: [QuxComponent],
  imports: [RouterModule.forChild([
    {
      path: '',
      component: QuxComponent,
      pathMatch: 'full'
    }
  ])],
  bootstrap: [QuxComponent]
})
export class QuxModule {}
