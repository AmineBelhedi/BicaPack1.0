import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ImportComponent } from './import.component';

const routes = [
  { path: '', component: ImportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportRoutingModule { }
