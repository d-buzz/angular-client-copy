import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from 'src/app/globals/route-guards/auth.guard';
import { MainPostComponent } from './main-post.component';
import { ViewPostComponent } from '../../shared/home-feed/view-post/view-post.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng5SliderModule } from 'ng5-slider';
import { ContentnavComponent } from 'src/app/shared/contentnav/contentnav.component';
import { MarkdownModule } from 'ngx-markdown';

const routes: Routes = [
  { path: "post/:username/:permlink", component: MainPostComponent,  canActivate: [AuthGuard]}
];

@NgModule({
  declarations: [ViewPostComponent,ContentnavComponent],
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
    ViewPostComponent,
    PipesModule,
    SharedModule,
    ContentnavComponent
  ],
})
export class MainPostModule { }
