import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HomeModule } from "./home/home.module";
import { HomeComponent } from "./home/home.component";
import { MessagesComponent } from './messages/messages.component';
import { LoginComponent } from './login/login.component';
import { LoginModule } from "./login/login.module";
import { MainProfileComponent } from './main-profile/main-profile.component';
import { MainProfileModule } from "./main-profile/main-profile.module";
import { MainPostComponent } from "./main-post/main-post.component";
import { MainPostModule } from "./main-post/main-post.module";
import { NewPostComponent } from "../shared/s-left/new-post/new-post.component";
import { ViewResaidsComponent } from "../shared/home-feed/view-resaids/view-resaids.component";
import { ViewUpvotesComponent } from "../shared/home-feed/view-upvotes/view-upvotes.component";
import { TestPasswordModule } from "./test-password/test-password.module";
import { Ng5SliderModule } from "ng5-slider";
import { ShowTrendingsComponent } from './show-trendings/show-trendings.component';
import { ShowWhoToFollowComponent } from './show-who-to-follow/show-who-to-follow.component';
import { ShowTrendingsModule } from "./show-trendings/show-trendings.module";
import { ShowWhoToFollowModule } from "./show-who-to-follow/show-who-to-follow.module";
import { MainSearchComponent } from './main-search/main-search.component';
import { MainSearchModule } from "./main-search/main-search.module";
import { MainNotificationsModule } from "./main-notifications/main-notifications.module";
import { MainNotificationsComponent } from "./main-notifications/main-notifications.component";
import { WalletComponent } from "../shared/profile/wallet/wallet.component";
import { LoginOptionsComponent } from "../shared/login-options/login-options.component";
import { PayoutInfoComponent } from "../shared/home-feed/payout-info/payout-info.component";
import { NoticesComponent } from "../shared/notices/notices.component";
import { FriendsModule } from "./friends/friends.module";
import { FriendsComponent } from "./friends/friends.component";
import { NgxSpinnerModule } from "ngx-spinner"; 
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [
    HomeComponent,
    MessagesComponent,
    LoginComponent,
    MainProfileComponent,
    MainPostComponent,
    NewPostComponent,
    ViewResaidsComponent,
    ViewUpvotesComponent,
    ShowTrendingsComponent,
    ShowWhoToFollowComponent,
    MainSearchComponent,
    MainNotificationsComponent,
    WalletComponent,
    LoginOptionsComponent,
    PayoutInfoComponent,
    NoticesComponent,
    FriendsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    RouterModule,
    Ng5SliderModule,
    NgxSpinnerModule,
    MarkdownModule.forChild(),

    // Components Modules
    HomeModule,
    LoginModule,
    MainProfileModule,
    MainPostModule,
    TestPasswordModule,
    ShowTrendingsModule,   
    ShowWhoToFollowModule,
    MainSearchModule,
    MainNotificationsModule,
    FriendsModule

  ],
  exports: [RouterModule],
  entryComponents: [NewPostComponent, ViewResaidsComponent,ViewUpvotesComponent, WalletComponent, LoginOptionsComponent, PayoutInfoComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AuthroutesModule {}
