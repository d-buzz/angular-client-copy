import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, HostListener, Renderer } from '@angular/core';
import { NgbPopoverConfig, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { ModalPostComponent } from './modal-post/modal-post.component';
import { PostService } from 'src/app/globals/post.service';
import { Options } from 'ng5-slider';
import Swal from 'sweetalert2';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { TwitterService } from 'src/app/globals/twitter.service';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
  selector: 'app-home-feed',
  templateUrl: './home-feed.component.html',
  styleUrls: ['./home-feed.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class HomeFeedComponent implements OnInit {
  @Input() data: any;
  @Input() loading: boolean = false;
  @Input() fetchedall: boolean = false;
  @Output() fetchNewFeeds = new EventEmitter();
  @Output() refreshList = new EventEmitter();

  steemForm: FormGroup;
  counter: number = 0;
  char_limit: number = 0;
  copyFormValues: any = {};
  submitting: boolean = false;
  profile_pic: any;
  auth_username: string = '';
  auth_is_verified: boolean = false;
  hide_tags: boolean = true;
  tags_ok: boolean = false;
  sliderControl: FormControl = new FormControl();
  showSlider: any = 'hide';
  auth_voting_weight: number = 0;
  tags: any = [];
  post_text: any = '';
  twitter_verification_enable : boolean = false;
  options: Options = {
    floor: 0,
    ceil: 100
  };
  env:any;
  apiRoute: string;
  public imagePath;
  imgURL: any;
  imgUrls: any = [];
  public message: string;
 

  constructor(private _globals: GlobalService, private _posts: PostService,
    private _auth: AuthService, config: NgbPopoverConfig, private _modal: NgbModal, private renderer: Renderer,
    private _routingState: RoutingStateService, private _twitter: TwitterService, private embedService: EmbedVideoService) {
    // customize default values of popovers used by this component tree
    config.placement = 'right';
    config.triggers = 'hover';

    this.char_limit = this._globals.ENV.CHAR_LIMIT;
    this.counter = this.char_limit;
    this.auth_voting_weight = this._auth.votingPower;
    this.env = this._globals.ENV;
    this.twitter_verification_enable = this.env.TWITTER_VERIFICATON_ENABLE;
  }
  @HostListener('window:scroll', ['$event'])

  ngOnInit() {
    this.showSlider = 'hide';
    this.steemForm = new FormGroup({
      post: new FormControl(this.post_text, [Validators.required, Validators.minLength(1), Validators.maxLength(this.char_limit)]),
      tags: new FormControl(''),
    });

    if (this.data) {
      let auth = this.data.auth;
      this.auth_username = auth.auth_username;
      if (auth.profile_pic === undefined) {
        this._auth.getImageLinks(this.auth_username).subscribe((res: any) => {
          if (res.status === 200) {
            this.profile_pic = res.data.profile_image;
          }
        });
      } else {
        this.profile_pic = auth.profile_pic;
      }
      let voting_power = this.auth_voting_weight;
      if (!isNaN(voting_power)) {
        this.options.ceil = voting_power;
        this.sliderControl.setValue(voting_power);
      } else {
        this.getCurrentVotingPower();
      }

      if(auth.auth_is_verified !== undefined){
        this.auth_is_verified = auth.auth_is_verified
      }else{
        this.checkIfVerified();
      }
    }
    

    let that = this;
    this.renderer.listen('window', 'scroll', (event) => {
      if (document.getElementById('feeds')) {
        let scrollContainer = document.getElementById('feeds');
        const threshold = 150;
        const position = window.innerHeight + window.scrollY;
        const height = scrollContainer.scrollHeight;
        if (position >= (height - threshold)) {
          if (!that.loading) {
            that.fetchNewList()
          }
        }
      }
    });
  }


  preview(event) {
    if (event.target.files && event.target.files[0]) {
      var mimeType =  event.target.files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        Swal.fire('Error','Only images are supported.','error');
        return;
      }
      var filesAmount = event.target.files.length;
      let total_images = parseInt(this.imgUrls.length) +  parseInt(filesAmount);
      if(total_images > this.env.IMAGE_UPLOAD_LIMIT){
        Swal.fire('Error',"Maximum of "+this.env.IMAGE_UPLOAD_LIMIT + ' images are allowed.','error');
        return;
      }
      for (let i = 0; i < this.env.IMAGE_UPLOAD_LIMIT; i++) {
        var reader = new FileReader();
        reader.onload = (event:any) => { 
          this.imgUrls.push(event.target.result); 
          this.imgURL = event.target.result; 
        }
        if(event.target.files[i] !== undefined){
          reader.readAsDataURL(event.target.files[i]); 
        }
      }
    }
  }



  fetchNewList() {
    this.fetchNewFeeds.emit(true)
  }

  refreshFeed() {
    this.refreshList.emit(true);
  }

  checkIfVerified() {
    this._twitter.checkIfVerified(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.auth_is_verified = res.data;
      }
    });
  }
  getCurrentVotingPower() {
    if (this.auth_username) {
      this._auth.getVotingPower(this.auth_username).subscribe((res: any) => {
        if (res.status === 200) {
          let voting_power: any = res.data;
          if(!voting_power){
            voting_power = 0;
          }
          localStorage.setItem('voting_power', voting_power);
          this.auth_voting_weight = parseInt(voting_power);
          this.options.ceil = parseInt(voting_power);
          this.sliderControl.setValue(parseInt(voting_power));
        }
      });
    }
  }

  createPost() {
    this.copyFormValues = { ... this.steemForm.value };
    this.copyFormValues.tags = JSON.stringify(this.tags);
    this.submitting = true;
      this._posts.createPost(this.copyFormValues).subscribe((res: any) => {
        if (res.status == 200) {
          this.refreshFeed();
          this.clearForm();
          this._globals.toastFire('Successfully posted to HIVE network', 'success');
          // if(this.twitter_verification_enable && this.auth_is_verified){
          //   let feed = {
          //     author: this.auth_username,
          //     permlink : res.data.permlink,
          //     tags: res.data.tags,
          //     body: this.steemForm.value.post
          //   };
          //   this.promptSharetoTwitter(feed);
          // }else{
          //   this.refreshFeed();
          //   this.clearForm();
          //   this._globals.toastFire('Successfully posted to HIVE network', 'success');
          // }
        } else {
          this._globals.toastFire(res.data, 'error');
        }
        this.submitting = false;
      });
  }

  clearForm() {
    this.copyFormValues = {};
    this.tags = [];
    if (this.steemForm) {
      this.steemForm.reset();
    }
    this.post_text = '';
    this.counter = this.char_limit;
    this.hide_tags = true;
    this.showSlider = 'hide';
  }

  updateCounter() {
    let total = 0;
    let post = this.steemForm.value.post;
    if (post !== null) {
      total += post.length;
    }
    // if (this.tags.length > 0) {
    //   this.tags.forEach(tag => {
    //     total += tag.length;
    //   });
    // }
    let counter = this.char_limit - total;
    this.counter = counter;
    let el = document.getElementById('counter_lbl');
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

  comment(feed: any, index: number) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    const modalRef = this._modal.open(ModalPostComponent, ngbModalOptions);
    feed.auth_username = this.auth_username;
    feed.auth_profile_pic = this.profile_pic;
    feed.cur_index = index;
    modalRef.componentInstance.feed = feed;
  }

  resteem(feed: any, index: number) {
    let data = { author: feed.author, permlink: feed.permlink };
    if (!feed.is_reblogged) {
      Swal.fire({
        title: 'Reblog this post?',
        text: "This post will be added to your blog and shared with your followers.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Reblog'
      }).then((result) => {
        if (result.value) {
          feed.reblogging = true;
          this._posts.reblog(data).subscribe((res: any) => {
            feed.reblogging = false;
            if (res.status === 200) {
              feed.is_reblogged = true;
              feed.reblog_count += 1;
              this._globals.toastFire(res.data, 'success');
            } else {
              feed.is_reblogged = false;
              this._globals.toastFire(res.data, 'error');
            }
          });
        }
      })
    }
  }

  upvote(feed: any, index: number) {
    let voting_weight = this.sliderControl.value;
    let data: any = { postId: feed.post_id, author: feed.author, permlink: feed.permlink, is_remove: feed.is_remove }
    feed.voting = true;
    this.showSlider = 'hide';
    if (feed.user_is_voter == 1) {
      if (feed.voting_weight <= 0) {
        this._globals.toastFire('Invalid voting weight', 'error');
        feed.voting = false;
      } else {
        data.votingWeight = -parseInt(feed.voting_weight);
        this._posts.downvote(data).subscribe((res: any) => {
          feed.voting = false;
          if (res.status === 200) {
            feed.user_is_voter = 0;
            feed.voter_counter -= 1;
            this._globals.toastFire(res.data, 'success');
            this.getCurrentVotingPower();
          } else {
            this._globals.toastFire(res.data, 'error');
          }
        });
      }

    } else {
      if (voting_weight <= 0) {
        this._globals.toastFire('Invalid voting weight', 'error');
        feed.voting = false;
      } else {
        if (voting_weight > this.auth_voting_weight) {
          this._globals.toastFire('Voting weight must not be greater than ' + this.auth_voting_weight + '%', 'error');
          feed.voting = false;
        } else {
          data.votingWeight = parseInt(voting_weight) * 100;
          this._posts.upvote(data).subscribe((res: any) => {
            feed.voting = false;
            if (res.status === 200) {
              feed.user_is_voter = 1;
              if (feed.voter_counter == '') {
                feed.voter_counter = 1;
              } else {
                feed.voter_counter += 1;
              }
              this._globals.toastFire(res.data, 'success');
              this.getCurrentVotingPower();
            } else {
              this._globals.toastFire(res.data, 'error');
            }
          });
        }
      }
    }
  }

  addTags() {
    let post = this.steemForm.value.post;
    this.post_text = post;
    if (post !== '') {
      if (this.hide_tags) {
        this.hide_tags = false;
      }
    } else {
      this.tags = [];
      this.hide_tags = true;
      this.steemForm.patchValue({ tags: '' });
    }
  }

  validateTags() {
    let tags = this.steemForm.value.tags;
    if (tags !== '') {
      if (/\s/.test(tags)) {
        let tagg = tags.replace(' ', '');
        tagg = tagg.replace(/#/g, '');
        if (!tagg) {
          this._globals.toastFire('Invalid tag', 'error');
        } else {
          this.tags.push(tagg);
        }
        this.steemForm.patchValue({ tags: '' })
      }
    } else {
      this.tags_ok = false;
    }

    if (this.tags.length > 0) {
      this.tags_ok = true;
    } else {
      this.tags_ok = false;
    }

    this.updateCounter();
  }

  pushTagsOnKeyUp(){
    let tags = this.steemForm.value.tags;
    if (tags !== '' && tags !== null) {
      let tagg = tags.replace(' ', '');
      tagg = tagg.replace(/#/g, '');
      if (!tagg) {
        this._globals.toastFire('Invalid tag', 'error');
      } else {
        this.tags.push(tagg);
        this.updateCounter();
      }
      this.steemForm.patchValue({ tags: '' })
    }
  } 

  removeTag(index) {
    if (this.tags.length > 0) {
      this.tags.splice(index, 1);
      this.tags_ok = true;
    } else {
      this.tags_ok = false;
    }

    if (this.tags.length === 0) {
      this.tags_ok = false;
    }

    this.updateCounter();
  }


  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    } 

    return value;
  }

  showSliderPost(feed, i) {
    if (this.showSlider === 'hide') {
      if (!feed.user_is_voter) {
        if (this.sliderControl.value <= 0) {
          this.getCurrentVotingPower();
          this._globals.toastFire('Please add voting power to your account', 'error');
        } else {
          this.showSlider = i;
        }
      } else {
        Swal.fire({
          title: 'Choose one',
          input: 'radio',
          showCancelButton: true,
          confirmButtonText: 'Proceed',
          cancelButtonColor: '#d33',
          inputOptions: {
            '0': 'Downvote',
            '1': 'Remove vote',
          },
          inputValidator: (value) => {
            if (!value) {
              return 'You need to choose one'
            }
            feed.is_remove = value;
            this.upvote(feed, i);
          }
        });
      }
    } else {
      this.showSlider = 'hide';
    }
  }

  viewPost(feed) {
    this._routingState.loadData(feed);
    this._globals.ROUTER.navigate(['/post', feed.author, feed.permlink]);
  }

  flagPost(feed) {
    let param: any = {
      author: feed.author,
      permlink: feed.permlink
    };

    Swal.fire({
      title: 'Flag this post?',
      text: "Please provide a note regarding your decision to flag this post, it will be reviewed by community moderators.",
      icon: 'info',
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      allowOutsideClick: () => false
    }).then((result) => {
      if (result.value) {
        param.notes = result.value;
        feed.flagging = true;
        feed.flagged = false;
        this._posts.flagPost(param).subscribe((res: any) => {
          feed.flagging = false;
          if (res.status === 200) {
            feed.flagged = true;
            this._globals.toastFire(res.data, 'success');
          } else {
            this._globals.toastFire(res.data, 'error');
          }
        });
      } else {
        if (!result.dismiss) {
          this._globals.toastFire('Note is required. Failed to flag post.', 'error');
        }
      }
    })
  }

  promptSharetoTwitter(feed){
    Swal.fire({
      title: 'Share this buzz to twitter?',
      text: 'You will be redirected to twitter to tweet this buzz',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Share'
    }).then((result) => {
      if(result.value){
        this.share(feed);
      }
      this.refreshFeed();
      this.clearForm();
    });
  }

  share(feed){
    let hashtags = '';
    if(feed.tags && feed.tags.length > 0){
      feed.tags.forEach((tag,i) => {
        if(feed.tags.length != parseInt(i)+1){
          hashtags += tag + ',';
        }else{
          hashtags += tag
        }
      });
    }
    let dbuzz_post_link = this.env.APP_HOST+'/post/'+feed.author+'/'+feed.permlink;
    let text = encodeURIComponent(decodeURIComponent(escape(feed.body))) + ' — Dbuzz';
    let twitter_url = 'https://twitter.com/intent/tweet?text='+text+'&url='+dbuzz_post_link;
    if(hashtags){
      twitter_url += '&hashtags='+hashtags;
    }
    window.open(twitter_url,"popup","width=600,height=300,left=600,top=200");
  }

  playVideo(feed){
    if(feed.is_youtube_vid){
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
}
