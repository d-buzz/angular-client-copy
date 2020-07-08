import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginFooterComponent } from 'src/app/shared/login-footer/login-footer.component';

const routes: Routes = [
  { path: "login", component: LoginComponent, pathMatch: "full" }
];

@NgModule({
  declarations: [ LoginFooterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot()
  ],
  exports :[
    LoginFooterComponent, 
    RouterModule
  ]
})
export class LoginModule { }
