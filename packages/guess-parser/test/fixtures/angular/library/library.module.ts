import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({

})
class LibraryComponent {}

@NgModule({
  declarations: [LibraryComponent],
  imports: [RouterModule.forChild([
    {
      path: '',
      component: LibraryComponent,
      pathMatch: 'full'
    }
  ])],
  bootstrap: [LibraryComponent]
})
export class LibraryModule {}
