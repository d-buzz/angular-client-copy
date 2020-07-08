import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainNotificationsComponent } from './main-notifications.component';
import { AuthGuard } from 'src/app/globals/route-guards/auth.guard';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SharedModule } from '../../shared/shared.module';
import { NotificationsComponent } from 'src/app/shared/notifications/notifications.component';
import { NotificationsnavComponent } from 'src/app/shared/notifications/navbar/notificationsnav/notificationsnav.component';
import { Ng5SliderModule } from 'ng5-slider';
import { MentionsComponent } from 'src/app/shared/notifications/mentions/mentions.component';
import { AllComponent } from 'src/app/shared/notifications/all/all.component';

const routes: Routes = [
  { path: "notifications", component: MainNotificationsComponent,  canActivate: [AuthGuard]},
];


@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationsnavComponent,
    MentionsComponent,
    AllComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
    PipesModule,
    SharedModule,
    Ng5SliderModule,
    ReactiveFormsModule
  ],
  exports: [
    RouterModule,
    PipesModule,
    SharedModule,
    NotificationsComponent,
    NotificationsnavComponent,
    MentionsComponent,
    AllComponent,
  ]
})
export class MainNotificationsModule { }
