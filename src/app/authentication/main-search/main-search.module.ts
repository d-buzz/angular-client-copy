import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultComponent } from 'src/app/shared/search-result/search-result.component';
import { MainSearchComponent } from './main-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WitnessComponent } from 'src/app/shared/search-result/witness/witness.component';
import { TopComponent } from 'src/app/shared/search-result/top/top.component';
import { PeopleComponent } from 'src/app/shared/search-result/people/people.component';
import { LatestComponent } from 'src/app/shared/search-result/latest/latest.component';
import { SearchnavComponent } from 'src/app/shared/search-result/navbar/searchnav/searchnav.component';
import { ModalPostComponent } from 'src/app/shared/home-feed/modal-post/modal-post.component';
import { BlockingModalComponent } from 'src/app/shared/blocking-modal/blocking-modal.component';
import { AuthGuard } from 'src/app/globals/route-guards/auth.guard';
import { Ng5SliderModule } from "ng5-slider";
import { MarkdownModule } from 'ngx-markdown';

const routes: Routes = [
  { path: 'search-results', component: MainSearchComponent , pathMatch: "full", canActivate: [AuthGuard]}
];



@NgModule({
  declarations: [
    SearchResultComponent,
    WitnessComponent,
    TopComponent,
    PeopleComponent,
    LatestComponent,
    SearchnavComponent,

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
    SharedModule,
    PipesModule,
    Ng5SliderModule,
    MarkdownModule.forChild(),
  ],
  exports :[
    SearchResultComponent,
    WitnessComponent,
    TopComponent,
    PeopleComponent,
    LatestComponent,
    SearchnavComponent,
    RouterModule,
    SharedModule,
    PipesModule
  ],
  providers: [],
  entryComponents: [ModalPostComponent,BlockingModalComponent ],
})
export class MainSearchModule { }
