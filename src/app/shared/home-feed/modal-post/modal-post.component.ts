import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal , NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from 'src/app/globals/global.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { PostService } from 'src/app/globals/post.service';
import { PlatformLocation } from '@angular/common';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
  selector: 'app-modal-post',
  templateUrl: './modal-post.component.html',
  styleUrls: ['./modal-post.component.scss']
})
export class ModalPostComponent implements OnInit {
  @Input() feed;
  steemModalForm: FormGroup;
  counter: number = 0;
  char_limit: number = 0;
  submitting: boolean = false;
  twitter_verification_enable : boolean = false;

  constructor(private modalService: NgbModal, public activeModal: NgbActiveModal, private _globals: GlobalService, 
    private _post: PostService, private platformLocation: PlatformLocation, private embedService: EmbedVideoService) {
    this.char_limit = this._globals.ENV.CHAR_LIMIT;
    this.counter = this.char_limit;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
    this.platformLocation.onPopState(() => this.modalService.dismissAll());
  }

  ngOnInit() {
    this.steemModalForm = new FormGroup({
      post: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(this.char_limit)]),
    });
  }

  updateCounter() {
    let post = this.steemModalForm.value.post;
    let counter = this.char_limit - post.length;
    this.counter = counter;
    let el = document.getElementById('counterm_lbl');
    if (this.counter < 0) {
      el.style.cssText = 'color:#FF0000';
    } else {
      el.style.cssText = 'color:#000000';
    }
  }

  autosize(event) {
    var el = event.target;
    if (el.value !== '') {
      setTimeout(function () {
        el.style.cssText = 'height:' + el.scrollHeight + 'px';
      }, 0);
    } else {
      el.style.cssText = 'height:2.5em;';
    }
  }

  postComment() {
    let message = this.steemModalForm.value.post;
    let param = {
      parentTitle: 'RE:' + message.substr(0,100),
      parentPermlink: this.feed.permlink,
      parentAuthor: this.feed.author,
      message: message,
      post_has_rewards: this.feed.post_has_rewards
    };
    
    this.submitting = true;
    this._post.comment(param).subscribe((res: any) => {
      if (res.status === 200) {
        if(document.getElementById('replies_count_'+this.feed.cur_index) !== undefined && document.getElementById('replies_count_'+this.feed.cur_index) !== null){
          document.getElementById('replies_count_'+this.feed.cur_index).innerText = this.feed.replies_count + 1;
        }
        this.clearForm();
        this.activeModal.close('true');
        this._globals.toastFire(res.data, 'success');
      } else {
        this._globals.toastFire(res.data, 'error');
      }
      this.submitting = false;
    });
  }

  clearForm() {
    this.steemModalForm.reset();
  }

  playVideo(feed){
    let checker = this._globals.getYoutubeLink(feed.body);
    var video_id = checker[0].split('v=')[1];    
    if (video_id) {
        if(video_id.indexOf('&') != -1){
            var ampersandPosition = video_id.indexOf('&');
            video_id = video_id.substring(0, ampersandPosition);
        }
        feed.video_html = this.embedService.embed_youtube(video_id, {
            query: { autoplay: 1 },
            attr: { class: 'yt-video' }
        });
    } else {
        feed.video_html = this.embedService.embed(checker[0], {
            query: { autoplay: 1 },
            attr: { class: 'yt-video' }
        });
    }
  }

}
