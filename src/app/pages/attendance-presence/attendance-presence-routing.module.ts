import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendancePresenceComponent } from './attendance-presence.component';

const routes: Routes = [
  {
    path : '' , component : AttendancePresenceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendancePresenceRoutingModule { }
