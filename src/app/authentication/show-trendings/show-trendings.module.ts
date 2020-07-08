import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from "@angular/core";
import { CommonModule } from '@angular/common';
import { ShowTrendingsComponent } from './show-trendings.component';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MoreTrendsComponent } from 'src/app/shared/more-trends/more-trends.component';
import { FormsModule } from '@angular/forms';
import { MoretrendsnavComponent } from "src/app/shared/more-trends/navbar/moretrendsnav/moretrendsnav.component";
import { SharedModule } from "src/app/shared/shared.module";
import { PipesModule } from "src/app/shared/pipes/pipes.module";

const routes: Routes = [
  { path: 'trends', component: ShowTrendingsComponent, pathMatch: "full"}, 
];


@NgModule({
  declarations: [
    MoreTrendsComponent,
    MoretrendsnavComponent
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
    MoreTrendsComponent,
    RouterModule,
    MoretrendsnavComponent,
    SharedModule,
    PipesModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ShowTrendingsModule { }
