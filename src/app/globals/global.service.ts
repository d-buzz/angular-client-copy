import { Injectable } from '@angular/core';
import { ImportsService } from './imports.service';
import Swal from 'sweetalert2';
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private api_host: string;

  constructor(private _imports: ImportsService, private _cookieService: CookieService) {
    this.api_host = _imports.ENV.API_HOST;
  }

  get ENV(): any {
    return this._imports.ENV;
  }
  get ROUTER(): any {
    return this._imports.ROUTER;
  }
  get ACTV_ROUTE() {
    return this._imports.ACTIVATED_ROUTE;
  }

  get HTTP() {
    return this._imports.HTTP;
  }

  get ROUTER_STATE() {
    return this.ACTV_ROUTE['_routerState']['snapshot']['url'].split("/");
  }

  public firstLetterUppercase(text: string) {
    if (text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
  }

  public limitString(text: string, count: number) {
    if (text) {
      return text.slice(0, count) + (text.length > count ? "..." : "");
    }
    return text;
  }

  public getYoutubeLink(content) {
    let yt_link: any = '';
    var youtube_link = /(\b(http(s)?:\/\/)?((w){3}.)?(m.)?youtu(be|.be)?(\.com)?\/[^\s]+)/gim;
    if (content.match(youtube_link)) {
      yt_link = content.match(youtube_link);
    }
    return yt_link;
  }

  public getThreeSpeakVidLink(content){
    let vid_link: any = '';
    var threespeak_link = /(\b(http(s)?:\/\/)?((w){3}.)?3speak.online\/watch\?[^\s]+)/gim;
    if (content.match(threespeak_link)) {
      vid_link = content.match(threespeak_link);
    }
    return vid_link;
  }

  public getLinkToPreviewNoMedia(str) {
    var urls = /((\(|\)?)\b(https?|ftp):\/\/[(\(|\)?)A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_(\)|\)?)](\)|\)?))/gim;
    var youtube_link = /(\b(http(s)?:\/\/)?((w){3}.)?(m.)?youtu(be|.be)?(\.com)?\/[^\s]+)/gim;
    var steemit_images = /(\b(http(s)?:\/\/)?((w){3}.)?steemitimages?(\.com)?\/[^\s]+)/gim;
    let link_to_preview = '';
    let has_media = false;
    if (str.match(urls)) {
      let imgs = str.match(urls);
      if (imgs.length > 0) {
        let no_image = false;
        imgs.forEach(img => {
          let img_link = img.toLocaleLowerCase();
          if ((img_link.indexOf(".jpg") > 0) || (img_link.indexOf(".jpeg") > 0) || (img_link.indexOf(".png") > 0) || (img_link.indexOf(".gif") > 0)) {
            no_image = true;
          }
        });
        has_media = no_image;
      }
      // check if has steemit images
      if (str.match(steemit_images)) {
        let steemit_imgs = str.match(steemit_images);
        if (steemit_imgs.length > 0) {
          has_media = true;
        }
      }
      // check if has youtube link
      if (str.match(youtube_link)) {
        let yt_link = str.match(youtube_link);
        if (yt_link.length > 0) {
          has_media = true;
        }
      }
    }

    if(!has_media){
      let _links = str.match(urls);
      if(_links){
        link_to_preview = _links[0];
      }
    }
    return link_to_preview;
  }

  public replaceImageHost(content){
    let me = this;
    content = content.replace(/(!\[.*?\]\()(.+?)(\))/g, function(whole, a, b, c) {
      return a + me.replaceHTTP(b) + c;
    });
    content = content.replace(/<img.*?src=['"](.*?)['"]/g, function(whole) {
      return me.replaceHTTP(whole)
    });
    return content;
  }

  public replaceHTTP(content: any) {
    var find = 'http://';
    var re = new RegExp(find, 'g');
    content = content.replace(re, 'https://');
    return content;
  }
  
  public toastFire(msg: string, icon) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: icon,
      title: msg
    })
  }

  public publicGetMethod(url) {
    return this._imports.HTTP.get(this.api_host + url, { withCredentials: true })
  }

  public publicPostMethod(url: string, data: any = {}) {
    data.access_token = this._cookieService.get('access_token') || localStorage.getItem('access_token');
    data.steemconnect = localStorage.getItem('steemconnect');
    return this._imports.HTTP.post(this.api_host + url, data, { withCredentials: true });
  }
}
