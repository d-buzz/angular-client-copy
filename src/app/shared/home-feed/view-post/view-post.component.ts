import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { PostService } from 'src/app/globals/post.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { FeedService } from 'src/app/globals/feed.service';
import { ModalPostComponent } from './../modal-post/modal-post.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ViewUpvotesComponent } from '../view-upvotes/view-upvotes.component';
import { ViewResaidsComponent } from '../view-resaids/view-resaids.component';
import { Options } from 'ng5-slider';
import { FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { EmbedVideoService } from 'ngx-embed-video';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewPostComponent implements OnInit {
  username: string = '';
  permlink: string = '';
  content: any;
  content_all: any;
  replies: any;
  accounts: any = [];
  auth_username: string = '';
  auth_is_verified: boolean = false;
  profile_pic: any = '';
  fetching_replies: boolean = false;
  fetching_content: boolean = false;
  content_authors: any = [];
  content_author_info: any = {};
  sliderControl: FormControl = new FormControl();
  showSlider: any = 'hide';
  auth_voting_weight: number = 0;
  url_data: any = [];
  subreply_limit = 1;
  twitter_verification_enable : boolean = false;
  options: Options = {
    floor: 0,
    ceil: 100
  };
  env: any;
  constructor(private _globals: GlobalService, private _post: PostService,
    private _auth: AuthService, private _posts: PostService, private _feeds: FeedService,
    private _modal: NgbModal, private _routingState: RoutingStateService, 
    private embedService: EmbedVideoService, private sanitizer: DomSanitizer) {
    this._routingState.loadRouting();
    let getUrl = this._globals.ROUTER_STATE;
    if (getUrl) {
      this.username = getUrl[2];
      this.permlink = getUrl[3];
    }

    this.auth_username = this._auth.authorName;
    this.profile_pic = this._auth.getProfileImage(this.auth_username);
    this.url_data = this._routingState.getCurrentData();
    this.auth_voting_weight = this._auth.votingPower;
    this.auth_is_verified = this._auth.isVerified;
    this.env = this._globals.ENV;
    this.twitter_verification_enable = this.env.TWITTER_VERIFICATON_ENABLE;
  }

  ngOnInit() {
    this.getContent();
    let voting_power = this.auth_voting_weight;
    if (!isNaN(voting_power)) {
      this.options.ceil = voting_power;
      this.sliderControl.setValue(voting_power);
    } else {
      this.getCurrentVotingPower();
    }
  }

  getContent() {
    if (this.username && this.permlink) {
      this.fetching_content = true;
      this._feeds.getContent(this.username, this.permlink).subscribe((res: any) => {
        if (res.status === 200 && res.data) {
          let content: any = res.data;
          this.content = content;
          this.accounts.author_accounts = content.author_accounts;
          this.getComments();
          this.checkIfHasVideo(content);
          this.checkIfVoter(content);
          this.checkIfReblogger(content);
          this.fetching_content = false;
        } else {
          this.fetching_content = false;
          this._globals.toastFire('No data fetched for this content', 'error');
        }
      });
    }
  }


  checkIfHasVideo(feed: any) {
    feed.is_youtube_vid = false;
    feed.has_video = false;
    feed.video_html = '';
    let checker = this._globals.getYoutubeLink(feed.body);
    if (checker && checker.length > 0) {
        let yt_link = checker[0].replace('feature=emb_rel_end&','');
        feed.has_video = true;
        feed.is_youtube_vid = true;
        var video_id = checker[0].split('v=')[1];    
        if (video_id) {
            if(video_id.indexOf('&') != -1){
                var ampersandPosition = video_id.indexOf('&');
                video_id = video_id.substring(0, ampersandPosition);
            }
            yt_link = 'http://www.youtube.com/watch?v='+video_id
        }
        this.embedService
        .embed_image(
            yt_link, 
            { image: 'mqdefault' }
        )
        .then(res => {
            if(res.link){
                feed.video_html = "<img src='"+res.link+"' class='yt-video'><div class='play'></div>";
            }
        });
    }else{
      let checker = this._globals.getThreeSpeakVidLink(feed.body);
      if (checker && checker.length > 0) {
        var video_id = checker[0].split('v=')[1];
        if(video_id){
          feed.has_video = true;
          let vid_src = "https://3speak.online/embed?v="+video_id;
          let vid_html = '<iframe src="'+vid_src+'" class="yt-video" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
          feed.video_html =  this.sanitizer.bypassSecurityTrustHtml(vid_html);
        }
      }
    }
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
  
  checkIfVoter(feed: any) {
    feed.user_is_voter = 0;
    if (feed.active_votes.length > 0) {
      feed.active_votes.forEach(votes => {
        if (parseInt(votes.rshares) > 0 && parseInt(votes.percent) > 0) {
          if (votes.voter === this.auth_username) {
            feed.user_is_voter = 1;
            feed.voting_weight = votes.percent;
          }
        }
      });
    }
  }

  checkIfReblogger(feed: any) {
    feed.is_reblogged = 0;
    if (feed.rebloggers.length > 0) {
      feed.rebloggers.forEach(reblogger => {
        if (reblogger === this.auth_username) {
          feed.is_reblogged = 1;
        }
      });
    }
  }

  getComments() {
    this.fetching_replies = true;
    this._feeds.getContentReplies(this.username, this.permlink).subscribe((res: any) => {
      this.fetching_replies = false;
      if (res.status === 200 && res.data) {
        this.content.replies = res.data;
        this.mapReplies(this.content.replies);
        this.content.replies_count = res.count;
      }
    });
  }

  mapReplies(replies) {
    replies.forEach((feed) => {
      this.checkIfHasVideo(feed);
      this.checkIfVoter(feed);
      this.checkIfReblogger(feed);
      this.getSubreplies(feed);
    });
  }

  getSubreplies(feed: any) {
    this._feeds.getContentReplies(feed.author, feed.permlink).subscribe((res: any) => {
      if (res.status === 200 && res.data) {
        feed.replies = res.data;
        if(feed.replies.length > 0){
          this.mapReplies(feed.replies);
        }
      }
    });
  }

  viewSubReply(feed: any, parent_reply: any) {
    this._feeds.getContentReplies(feed.author, feed.permlink).subscribe((res: any) => {
      if (res.status === 200 && res.data) {
        if (this.content.replies.length > 0) {
          this.content.replies.forEach(reply => {
            if (reply.permlink === parent_reply.permlink) {
              res.data.forEach(subreply => {
                reply.replies.push(subreply);
              });
              this.mapReplies(reply.replies);
              feed.hide = true;
            }
          });
        }
      }
    });
  }

  backUrl() {
    let backurl = this._routingState.getPreviousUrl();
    this._globals.ROUTER.navigate([backurl]);
  }

  getCurrentVotingPower() {
    this._auth.getVotingPower(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        let voting_power: any = res.data;
        if(!voting_power){
          voting_power = 0;
        }
        localStorage.setItem('voting_power', voting_power);
        this.options.ceil = parseInt(voting_power);
        this.auth_voting_weight = parseInt(voting_power);
        this.sliderControl.setValue(parseInt(voting_power));
      }
    });
  }

  //@todos
  comment(feed: any) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
    };
    const modalRef = this._modal.open(ModalPostComponent, ngbModalOptions);
    feed.auth_profile_pic = this.profile_pic;
    modalRef.componentInstance.feed = feed;
    modalRef.result.then(
      (data: any) => {
        if (data && data == 'true') {
          this.getComments();
        }
      },
      (reason: any) => { });
  }

  resteem(feed: any) {
    let data = { author: feed.author, permlink: feed.permlink };
    if (feed.is_reblogged == 0) {
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
          feed.is_reblogged = 0;
          this._posts.reblog(data).subscribe((res: any) => {
            feed.reblogging = false;
            if (res.status === 200) {
              feed.is_reblogged = 1;
              this._globals.toastFire(res.data, 'success');
            } else {
              this._globals.toastFire(res.data, 'error');
            }
          });
        }
      })
    }
  }

  upvote(feed: any) {
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

  upvoteReply(reply: any, i: number) {
    let voting_weight = this.sliderControl.value;
    let data: any = { postId: reply.id, author: reply.author, permlink: reply.permlink, is_remove: reply.is_remove }
    reply.voting = true;
    this.showSlider = 'hide';
    if (reply.user_is_voter == 1) {
      if (reply.voting_weight <= 0) {
        this._globals.toastFire('Invalid voting weight', 'error');
        reply.voting = false;
      } else {
        data.votingWeight = -parseInt(reply.voting_weight);
        this._posts.downvote(data).subscribe((res: any) => {
          reply.voting = false;
          if (res.status === 200) {
            reply.user_is_voter = 0;
            reply.voter_counter -= 1;
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
        reply.voting = false;
      } else {
        if (voting_weight > this.auth_voting_weight) {
          this._globals.toastFire('Voting weight must not be greater than ' + this.auth_voting_weight + '%', 'error');
          reply.voting = false;
        } else {
          data.votingWeight = parseInt(voting_weight) * 100;
          this._posts.upvote(data).subscribe((res: any) => {
            reply.voting = false;
            if (res.status === 200) {
              reply.user_is_voter = 1;
              if (reply.voter_counter == '') {
                reply.voter_counter = 1;
              } else {
                reply.voter_counter += 1;
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

  openViewUpvotes(data: any) {
    const modalRef = this._modal.open(ViewUpvotesComponent);
    data.active_votes.count = data.voter_counter;
    modalRef.componentInstance.data = data.active_votes;
  }

  openViewResaids(data: any) {
    const modalRef = this._modal.open(ViewResaidsComponent);
    data.rebloggers.count = data.reblog_count;
    modalRef.componentInstance.data = data.rebloggers;
  }

  showSliderPost(content, post_id) {
    if (this.showSlider == 'hide') {
      if (!content.user_is_voter) {
        if (this.sliderControl.value <= 0) {
          this.getCurrentVotingPower();
          this._globals.toastFire('Please add voting power to your account', 'error');
        } else {
          this.showSlider = post_id;
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
            content.is_remove = value;
            this.upvote(content);
          }
        });
      }
    } else {
      this.showSlider = 'hide';
    }
  }

  showSliderPostReply(reply, i) {
    if (this.showSlider == 'hide') {
      if (!reply.user_is_voter) {
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
            reply.is_remove = value;
            this.upvoteReply(reply, i);
          }
        });
      }
    } else {
      this.showSlider = 'hide';
    }
  }

  flagPost(feed, is_reply = 0) {
    let param: any = {
      author: feed.author,
      permlink: feed.permlink
    };
    let type = 'post';
    if (is_reply == 1) {
      type = 'comment';
    }
    Swal.fire({
      title: 'Flag this ' + type + '?',
      text: "Please provide a note regarding your decision to flag this " + type + ", it will be reviewed by community moderators.",
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

  viewPost(feed) {
    this._globals.ROUTER.navigate(['/post', feed.author, feed.permlink]);
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
}
