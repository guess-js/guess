import { NgModule } from '@angular/core';
import { QuxComponent } from './qux.component';
import { QuxRoutingModule } from './qux-routing.module';

@NgModule({
  declarations: [QuxComponent],
  imports: [QuxRoutingModule],
  bootstrap: [QuxComponent]
})
export class QuxModule {}
