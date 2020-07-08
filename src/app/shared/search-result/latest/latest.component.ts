import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Options } from 'ng5-slider';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';
import Swal from 'sweetalert2';
import { PostService } from 'src/app/globals/post.service';
import { ModalPostComponent } from '../../home-feed/modal-post/modal-post.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
  selector: 'app-latest',
  templateUrl: './latest.component.html',
  styleUrls: ['./latest.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LatestComponent implements OnInit {

  @Input() searching: boolean = false;
  @Input() data: any = [];
  sliderControl: FormControl = new FormControl();
  showSlider: any = 'hide';
  auth_voting_weight: number = 0;
  auth_username: string = '';
  auth_is_verified: boolean = false;
  profile_pic: any = null;
  twitter_verification_enable : boolean = false;
  env: any;
  options: Options = {
    floor: 0,
    ceil: 100
  };

  constructor(private _auth: AuthService, private _globals: GlobalService, 
    private _posts: PostService, private _modal: NgbModal, 
    private _routingState: RoutingStateService, private embedService: EmbedVideoService) {
    this.showSlider = 'hide';
    this.auth_username =  this._auth.authorName;
    this.auth_voting_weight = this._auth.votingPower;
    this.auth_is_verified = this._auth.isVerified;
    this.profile_pic = this._auth.getProfileImage(this.auth_username);
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
    this.env = this._globals.ENV;
  }

  ngOnInit(){
    let voting_power = this.auth_voting_weight;
    if (!isNaN(voting_power)) {
      this.options.ceil = voting_power;
      this.sliderControl.setValue(voting_power);
    } else {
      this.getCurrentVotingPower();
    }
  }

  getCurrentVotingPower(){
    if(this.auth_username){
      this._auth.getVotingPower(this.auth_username).subscribe((res: any) => {
        if (res.status === 200) {
          let voting_power:any = res.data;
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

  showSliderPost(feed, i){
    if(this.showSlider === 'hide'){
      if(!feed.user_is_voter){
        if(this.sliderControl.value <= 0){
          this.getCurrentVotingPower();
          this._globals.toastFire('Please add voting power to your account','error');
        }else{
          this.showSlider = i;
        }      
      }else{
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
            this.upvote(feed,i);
          }
        });
      }
    }else{
      this.showSlider = 'hide';
    }
  }

  upvote(feed: any, index: number) {
    let voting_weight = this.sliderControl.value;
    let data:any = { postId: feed.post_id, author: feed.author, permlink: feed.permlink, is_remove: feed.is_remove }
    feed.voting = true;
    this.showSlider = 'hide';
    if (feed.user_is_voter == 1) {
      if(feed.voting_weight <= 0){
        this._globals.toastFire('Invalid voting weight','error');
        feed.voting = false;
      }else{
        data.votingWeight = -parseInt(feed.voting_weight);
        this._posts.downvote(data).subscribe((res: any) => {
          feed.voting = false;
          if (res.status === 200) {
            feed.user_is_voter = 0;
            feed.voter_counter -= 1;
            this._globals.toastFire(res.data, 'success');
          } else {
            this._globals.toastFire(res.data, 'error');
          }
        });
      }
     
    } else {
      if(voting_weight <= 0){
        this._globals.toastFire('Invalid voting weight','error');
        feed.voting = false;
      }else{
        if(voting_weight > this.auth_voting_weight){
          this._globals.toastFire('Voting weight must not be greater than '+this.auth_voting_weight+'%','error');
          feed.voting = false;
        }else{
          data.votingWeight = parseInt(voting_weight) * 100;
          this._posts.upvote(data).subscribe((res: any) => {
            feed.voting = false;
            if (res.status === 200) {
              feed.user_is_voter = 1;
              if(feed.voter_counter == ''){
                feed.voter_counter = 1;
              }else{
                feed.voter_counter += 1;
              }
              this._globals.toastFire(res.data, 'success');
            } else {
              this._globals.toastFire(res.data, 'error');
            }
          });
        }
      }
    }
  }

  resteem(feed:any,index:number) { 
    let data = { author: feed.author, permlink: feed.permlink };
    if(!feed.is_reblogged){
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
          this._posts.reblog(data).subscribe((res:any) => {
            feed.reblogging = false;
            if(res.status === 200){
              feed.is_reblogged = true;
              feed.reblog_count += 1;
              this._globals.toastFire(res.data, 'success');
            }else{
              feed.is_reblogged = false;
              this._globals.toastFire(res.data, 'error');
            }
          });
        }
      })
    }
  }

  comment(feed: any,index:number) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    const modalRef = this._modal.open(ModalPostComponent,ngbModalOptions);
    feed.auth_username = this.auth_username;
    feed.auth_profile_pic = this.profile_pic;
    feed.cur_index = index;
    modalRef.componentInstance.feed = feed;
  }

  viewPost(feed){
    this._routingState.loadData(feed);
    this._globals.ROUTER.navigate(['/post',feed.author,feed.permlink]);
  }

  flagPost(feed){
    let param:any = {
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
        this._posts.flagPost(param).subscribe((res:any) => {
          feed.flagging = false;
          if(res.status === 200){
            feed.flagged = true;
            this._globals.toastFire(res.data, 'success');
          }else{
            this._globals.toastFire(res.data, 'error');
          }
        });
      }else{
        if(!result.dismiss){
          this._globals.toastFire('Note is required. Failed to flag post.','error');
        }
      }
    })
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
