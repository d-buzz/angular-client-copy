import { Pipe, PipeTransform } from '@angular/core';
import { environment } from './../../../environments/environment';
import { trim } from 'jquery';
import { GlobalService } from 'src/app/globals/global.service';

@Pipe({
  name: 'stripHTML'
})
export class MarkdownPipe implements PipeTransform {
  private ENV: any = environment;
  constructor(private _global: GlobalService) {

  }
  transform(value: string): any {
    let strip = this.parseUrl(value);
    return strip;
  }

  private parseUrl(str?: string) {
    var urls = /(\b(https?|ftp):\/\/[(A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_])/gim;
    var img_url = /((\(|\)?)\b(http(s)?:\/\/[(\(|\)?)A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_(\)|\)?)])*[^\s]\.(?:jpg|jpeg|gif|png)(\)|\))?)/gim;
    var tags = /((?:\s|\(|^)@[A-Za-z0-9+._-]+)/gim;
    var hashtags = /((?:\s|^)#[A-Za-z0-9_-]+)/gim;
    var image_name = /\![[A-Z0-9+&@#\/%?=~_|!:,.;-\s]*[-A-Z0-9]?]/gim;
    var youtube_link = /(\b(http(s)?:\/\/)?((w){3}.)?(m.)?youtu(be|.be)?(\.com)?\/[^\s]+)/gim;
    var steemit_images = /(\b(http(s)?:\/\/)?((w){3}.)?steemitimages?(\.com)?\/[^\s]+)/gim;
    var img_tag = /<img.*?src="(.*?)"[^\>]+>/gim;
    var other_img_link = /(\!\[\]\s?)*(\(\s|\(?)(http(s)?:\/\/.*format=(?:png|jpg|jpeg)*[^\s]+)/gim;

    if (str.match(img_url)) {
      let images = str.match(img_url);
      if(images && images.length > 0){
        images.forEach(img => {
          let image_src = img.replace('(', '');
          image_src = image_src.replace(')', '');
          str = str.replace(img, " <div class=\"image-wrapper pr-4 mb-2\"><img src='" + image_src + "' class=\"img-fluid mb-2 rounded-lg\"></div>");
        });
      }
    }
    
    if (str.match(steemit_images)) {
      let steemit_imgs = str.match(steemit_images);
      if (steemit_imgs.length > 0) {
        steemit_imgs.forEach(steemit_img => {
          str = str.replace(steemit_img, " <div class=\"image-wrapper pr-4 mb-2\"><img src='" + steemit_img + "' class=\"img-fluid mb-2 rounded-lg\"></div>");
        });
      }
    }

    if (str.match(image_name)) {
      let image_ = str.match(image_name);
      if (image_.length > 0) {
        image_.forEach(img_nme => {
          str = str.replace(img_nme, "");
        });
      }
    }

    if (str.match(youtube_link)) {
      let yt_link = str.match(youtube_link);
      if (yt_link.length > 0) {
        yt_link.forEach(yt => {
          let link_split = yt.split('/');
          if (link_split && link_split.length > 0) {
            str = str.replace(yt, '');
          }
        });
      }
    }

    if(str.match(img_tag)){
      let _img_tag = str.match(img_tag);
      if(_img_tag && _img_tag.length > 0){
        _img_tag.forEach(tag => {
          if(tag.match(urls)){
            let img_url = tag.match(urls);
            str = str.replace(tag,img_url[0]);
          }
        });
      }
    }

    
    if (str.match(other_img_link)) {
      let other_imgs = str.match(other_img_link);
      if (other_imgs.length > 0) {
        other_imgs.forEach(other => {
          let image_src = other.replace('(', '');
          image_src = image_src.replace(')', '');
          image_src = image_src.replace('![]','');
          str = str.replace(other, " <div class=\"image-wrapper pr-4 mb-2\"><img src='" + image_src + "' class=\"img-fluid mb-2 rounded-lg\"></div>");
        });
      }
    }


    if (str.match(urls)) {
      let _urls = str.match(urls);
      if(_urls && _urls.length > 0){
        _urls.forEach(url => {
          if(!url.match(img_url) && !url.match(steemit_images) && !url.match(other_img_link)){
            str = str.replace(url, " <a href='"+url+"' target=\"_blank\">"+url+"</a>");
          }
        });
      }
    }


    if (str.match(hashtags)) {
      str = str.replace(hashtags, ' <a href="#">$1</a>');
    }

    if (str.match(tags)) {
      let users = str.match(tags);
      if (users.length > 0) {
        users.forEach(user => {
            let _user = trim(user.replace('(', ''));
            str = str.replace(_user, " <a href=" + this.ENV.APP_HOST + "/profile/" + _user + ">" + _user + "</a>");
        });
      }
    }

    str = this._global.replaceImageHost(str);
    return str;
  }

  private strip2(str?: string) {
    str = (str) ? str : '';
    var tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }
}
