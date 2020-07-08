import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home.component";
import { SLeftComponent } from "src/app/shared/s-left/s-left.component";
import { SRightComponent } from "src/app/shared/s-right/s-right.component";
import { NavbarComponent } from "src/app/shared/navbar/navbar.component";
import { HomeFeedComponent } from "src/app/shared/home-feed/home-feed.component";
import { WhoToFollowComponent } from "src/app/shared/who-to-follow/who-to-follow.component";
import { ModalPostComponent } from "src/app/shared/home-feed/modal-post/modal-post.component";
import { PipesModule } from "../../shared/pipes/pipes.module";
import { SharedModule } from "../../shared/shared.module";
import { Ng5SliderModule } from "ng5-slider";
import { BlockingModalComponent } from "src/app/shared/blocking-modal/blocking-modal.component";
import { ImagePreviewComponent } from "src/app/shared/home-feed/image-preview/image-preview.component";
import { MarkdownModule } from 'ngx-markdown';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: "full"},
  { path: 'home/:feed', component: HomeComponent, pathMatch: "full"},
];

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
    PipesModule,
    SharedModule,
    Ng5SliderModule,
    MarkdownModule.forChild(),
    
  ],
  declarations: [
      SLeftComponent,
      SRightComponent,
      NavbarComponent,
      HomeFeedComponent,
      WhoToFollowComponent,
      ModalPostComponent,   
      BlockingModalComponent,
      ImagePreviewComponent
    
    ],

  exports: [
      SLeftComponent,
      SRightComponent,
      NavbarComponent,
      HomeFeedComponent,
      RouterModule,
      PipesModule,
      SharedModule,
      ImagePreviewComponent
    ],

  providers: [],
  entryComponents: [ModalPostComponent,BlockingModalComponent ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class HomeModule {}
