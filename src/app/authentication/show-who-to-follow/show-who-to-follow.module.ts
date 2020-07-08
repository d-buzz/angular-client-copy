import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowWhoToFollowComponent } from './show-who-to-follow.component';
import { SharedModule } from "src/app/shared/shared.module";
import { PipesModule } from "src/app/shared/pipes/pipes.module";
import { MoreWhoToFollowComponent } from 'src/app/shared/more-who-to-follow/more-who-to-follow.component';
import { MorewhotofollownavComponent } from 'src/app/shared/more-who-to-follow/navbar/morewhotofollownav/morewhotofollownav.component';

const routes: Routes = [
  { path: 'tofollow', component: ShowWhoToFollowComponent, pathMatch: "full"}, 
];


@NgModule({
  declarations: [
    MoreWhoToFollowComponent,
    MorewhotofollownavComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
    SharedModule,
    PipesModule
  ],
  exports :[
    MoreWhoToFollowComponent,
    MorewhotofollownavComponent,
    RouterModule,
    SharedModule,
    PipesModule
  ],
})
export class ShowWhoToFollowModule { }
