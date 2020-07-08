import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainProfileComponent } from './main-profile.component';
import { ProfileComponent } from 'src/app/shared/profile/profile.component';
import { SaysComponent } from 'src/app/shared/profile/says/says.component';
import { RepliesComponent } from 'src/app/shared/profile/replies/replies.component';
import { AuthGuard } from 'src/app/globals/route-guards/auth.guard';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng5SliderModule } from 'ng5-slider';
import { ProfilenavComponent } from 'src/app/shared/profile/profilenav/profilenav.component';
import { FollowingComponent } from 'src/app/shared/profile/following/following.component';
import { FollowersComponent } from 'src/app/shared/profile/followers/followers.component';
import { MarkdownModule } from 'ngx-markdown';


const routes: Routes = [
  { path: "profile", component: MainProfileComponent, canActivate: [AuthGuard] },
  { path: "profile/:username", component: MainProfileComponent, canActivate: [AuthGuard] }
];


@NgModule({
  declarations: [
    ProfileComponent, 
    SaysComponent, 
    RepliesComponent, 
    ProfilenavComponent, 
    FollowingComponent, 
    FollowersComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
    PipesModule,
    SharedModule,
    Ng5SliderModule,
    ReactiveFormsModule,
    MarkdownModule.forChild(),
  ],
  exports: [
    ProfileComponent,
    SaysComponent,
    RepliesComponent,
    RouterModule,
    PipesModule,
    SharedModule,
    ProfilenavComponent,
    FollowingComponent,
    FollowersComponent

  ],


})
export class MainProfileModule { }
