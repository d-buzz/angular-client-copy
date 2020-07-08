import { BrowserModule } from "@angular/platform-browser";
import { NgModule, SecurityContext } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { CommonModule } from "@angular/common";
import { AuthroutesModule } from "./authentication/authroutes.module";
import { CookieService } from "ngx-cookie-service";
import { Ng5SliderModule } from 'ng5-slider';
import { ClipboardModule } from 'ngx-clipboard';
import { TimeagoModule } from 'ngx-timeago';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { EmbedVideo } from 'ngx-embed-video';
import { NgxSpinnerModule } from "ngx-spinner"; 
import { MarkdownModule } from 'ngx-markdown';
import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
// const config: SocketIoConfig = { url: environment.SOCKET_URL ,
//   options: {
//     path: '/steemsays',
//     forceNew: false,
// } };

const routes: Routes = [
  { path : '**', redirectTo: ''}
];
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(routes,  {onSameUrlNavigation: 'reload'}),
    AuthroutesModule,
    Ng5SliderModule,
    ClipboardModule,
    TimeagoModule.forRoot(),
    EmbedVideo.forRoot(),
    NgxSpinnerModule,
    MarkdownModule.forRoot(),
    // SocketIoModule.forRoot(config)
  ],
  exports: [RouterModule],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {}
