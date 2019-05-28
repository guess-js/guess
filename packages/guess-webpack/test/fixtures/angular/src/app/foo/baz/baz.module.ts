import { NgModule } from '@angular/core';
import { BazComponent } from './baz.component';
import { BazRoutingModule } from './baz-routing.module';

@NgModule({
  declarations: [BazComponent],
  imports: [BazRoutingModule],
  bootstrap: [BazComponent]
})
export class BazModule {}
