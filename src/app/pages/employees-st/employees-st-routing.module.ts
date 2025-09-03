import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesStComponent } from './employees-st.component';

const routes: Routes = [
  {
    path: '' , component : EmployeesStComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesStRoutingModule { }
