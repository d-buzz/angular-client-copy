import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestPasswordComponent } from './test-password.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  { path: 'manager', component: TestPasswordComponent, pathMatch: "full"},

];

@NgModule({
  declarations: [TestPasswordComponent],
  imports: [
    CommonModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
  ]
})
export class TestPasswordModule { }
