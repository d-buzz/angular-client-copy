import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FriendsComponent } from './friends.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { Ng5SliderModule } from 'ng5-slider';
import { FriendsFeedComponent } from 'src/app/shared/friends-feed/friends-feed.component';
import { FriendsnavComponent } from 'src/app/shared/friends-feed/friendsnav/friendsnav.component';



const routes: Routes = [
  { path: 'home/friends', component: FriendsComponent, pathMatch: "full"},
];


@NgModule({
  declarations: [
    FriendsFeedComponent,
    FriendsnavComponent
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
    PipesModule,
    SharedModule,
    Ng5SliderModule
  ],
  exports: [
    RouterModule,
    PipesModule,
    SharedModule,
    FriendsFeedComponent,
    FriendsnavComponent

  ],
  entryComponents: [ ],

})
export class FriendsModule { }
