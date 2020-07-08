import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverDetailComponent } from './home-feed/popover-detail/popover-detail.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { TimeagoModule } from 'ngx-timeago';


@NgModule({
  declarations: [
    PopoverDetailComponent,
    MobileMenuComponent,

      
  ],
  imports: [
    CommonModule,
    PipesModule,
  ],
  exports: [
    PopoverDetailComponent,
    MobileMenuComponent,
    TimeagoModule,

    
  ],
})
export class SharedModule { }
