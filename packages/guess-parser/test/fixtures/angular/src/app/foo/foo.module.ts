import { NgModule, Component } from '@angular/core';
import { FooComponent } from './foo.component';
import { FooRoutingModule } from './foo-routing.module';

@NgModule({
  declarations: [FooComponent],
  imports: [FooRoutingModule],
  bootstrap: [FooComponent]
})
export class FooModule {}
