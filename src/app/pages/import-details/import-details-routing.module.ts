import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportDetailsComponent } from './import-details.component';

const routes: Routes = [{ path: '', component: ImportDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportDetailsRoutingModule {}
