import { NgModule } from '@angular/core';
import { LibraryModule } from '~library';

@NgModule({
  imports: [LibraryModule]
})
export class WrapperModule {}

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
