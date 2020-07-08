import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { GlobalService } from 'src/app/globals/global.service';
import { PostService } from 'src/app/globals/post.service';
import { FeedService } from 'src/app/globals/feed.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WalletComponent } from './wallet/wallet.component';
import Swal from 'sweetalert2';
import { ClipboardService } from 'ngx-clipboard';
import { TwitterService } from 'src/app/globals/twitter.service';
import { EmbedVideoService } from 'ngx-embed-video';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit {
  @Input() profile : any = {};
  @Input() fetching : boolean = false;
  
  username: any = '';
  auth_username: any = '';
  following: boolean = false;
  fetching_says: boolean = false;
  fetching_replies: boolean = false;
  fetching_followers: boolean = false;
  fetching_following: boolean = false;
  fetchedall: boolean = false;
  fetchedall_replies: boolean = false;
  fetchedall_followers:boolean = false;
  fetchedall_following:boolean = false;
  feed_list: any = [];
  feed_and_replies: any = []
  limit: number = 10;
  offset: number = 0;
  says_arr = [];
  replies_arr = [];
  followers_arr = [];
  following_arr = [];
  blog_count: number = 0;
  replies_count: number = 0;
  following_count: number = 0;
  follower_count: number = 0;
  follower_limit: number = 10
  following_limit: number = 10;
  replies_limit: number = 10;
  follower_list : any = [];
  following_list: any = [];
  steemimgurl: any = '';
  follower_new: any = [];
  following_new: any = [];
  about_string_limit: number = 80;
  wallet_info: any = {};
  is_verified: boolean = false;
  is_subscribed: boolean = false; 
  twitter_verification_enable : boolean = false;

  constructor(private _auth: AuthService, private _globals: GlobalService, private _post: PostService, 
    private _feeds: FeedService, private _modal: NgbModal, private _clipboard: ClipboardService, 
    private _twitter: TwitterService, private embedService: EmbedVideoService, private sanitizer: DomSanitizer) {
    this.auth_username = this._auth.authorName;
    this.is_subscribed = this._auth.isMember;
    this.steemimgurl = this._globals.ENV.STEEMIT_IMAGE_URL;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
  }
  ngOnInit() {
    if(this.profile){
      this.follower_count = this.profile.follower_count;
      this.following_count = this.profile.following_count;
      this.blog_count = this.profile.post_count;
      this.replies_count = this.profile.comment_count;
      this._auth.setWalletInfo();
      this.checkIfVerified();
      this.initializeBlogs();
      this.initializeReplies();
      this.initializeFollowing();
      this.initializeFollowers();
    }
  }
  
  follow(profile){
    let param = { author: profile.username };
    this.following = true;
    if(!profile.is_following){
      this._post.followAuthor(param).subscribe((res:any) => {
        if(res.status === 200){
          this.following = false;
          profile.is_following = 1;
          this._globals.toastFire('Followed successfully','success');
        }else{
          this.following = false;
          this._globals.toastFire(res.data,'error');
        }
      });
    }else{
      this._post.unfollowAuthor(param).subscribe((res:any) => {
        if(res.status === 200){
          profile.is_following = 0;
          this.following = false;
          this._globals.toastFire('Unfollowed successfully','success');
        }else{
          this.following = false;
          this._globals.toastFire(res.data,'error');
        }
      });
    }
  }

  showMoreFeed(event){
    if (event) {
      if(this.blog_count === undefined){
        this.blog_count = this.profile.post_count;
      }
      this.limit += 10;
      this.initializeBlogs();
    }
  }

  initializeBlogs() {
    if(this.says_arr && this.says_arr.length >= this.blog_count){
      this.fetchedall = true;
      this.fetching_says = false;
    }else{
      this.getBlogs();
    }
  }

  showMoreReplies(event){
    if (event) {
      if(this.replies_count === undefined){
        this.replies_count = this.profile.comment_count;
      }
      this.replies_limit += 10;
      this.initializeReplies();
    }
  }

  initializeReplies() {
    if(this.replies_arr && this.replies_arr.length >= this.replies_count){
      this.fetchedall_replies = true;
      this.fetching_replies = false;
    }else{
      this.getBlogReplyFeeds();
    }
  }

  getBlogs(){
    this.fetching_says = true;
    this._feeds.getBlogPost(this.profile.username,this.limit,this.offset).subscribe((res: any) => {
      if (res.status == 200) {
        if(res.count > 0){
          this.feed_list = res.data;
          this.mapFeedList();
        }else{
          this.fetching_says = false;
        }
      }else{
        this.fetching_says = false;
      }
    });
  }

  mapFeedList() {
    let ind = 0;
    this.feed_list.forEach((feed, index) => {
      feed.total_replies = 0;
      if(feed.total_replies === 0){
        // this.getTotalComments(feed.replies, feed);
      }
      this.checkIfHasVideo(feed);
      this.checkIfVoter(feed, index);
      this.checkIfReblogger(feed);
      ind++;
      if(ind === this.feed_list.length){
        this.fetching_says = false;
        this.says_arr = this.feed_list;
      }
    });
  }

  getTotalComments(replies, feed){
    if(replies.length > 0){
        replies.forEach(reply => {
            feed.total_replies += 1;
            this.getSubreplies(reply, feed);
        });
    }
}

  getSubreplies(parent_link: any, feed) {
    let link = parent_link.split('/');
    let replies = [];
    if (link[0] !== '' && link[1] !== '') {
        this._feeds.getContentReplies(link[0], link[1]).subscribe((res: any) => {
            if (res.status === 200 && res.data) {
                if (res.data.length > 0) {
                    res.data.forEach(reply => {
                        replies.push(reply.url);
                    });
                    this.getTotalComments(replies, feed);
                }
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


  checkIfReblogger(feed: any){
    if(feed){
        feed.is_reblogged = 0;
        feed.reblogging = false;
        let rebloggers = feed.rebloggers;
        if(rebloggers.length > 0){
            rebloggers.forEach(reblogger => {
                if(reblogger === this.auth_username){
                    feed.is_reblogged = 1;
                }
            });
        }
    }
  }
  
  checkIfVoter(feed: any, i: number) {
    if (feed) {
      feed.user_is_voter = 0;
      feed.voting = false;
      feed.voting_weight = 0;
      let voters = feed.voters;
      if (voters.length > 0) {
        voters.forEach(element => {
          if (parseInt(element.rshares) > 0) {
            if (element.voter === this.auth_username) {
              feed.voting_weight = element.percent;
              feed.user_is_voter = 1;
            }
          }
        });
      }
    }
  }

  // says and replies 
  getBlogReplyFeeds() {
    this.fetching_replies = true;
    this._feeds.getAllReplies(this.profile.username,this.replies_limit).subscribe((res: any) => {
      this.fetching_replies = false;
      if (res.status == 200) {
        this.feed_and_replies = res.data;
        this.mapReplies();
      } 
    });
  }

  mapReplies(){
    let ind = 0;
    this.feed_and_replies.forEach((feed, index) => {
      this.checkIfVoter(feed, index);
      this.checkIfReblogger(feed);
      ind++;
      if(ind === this.feed_and_replies.length){
        this.replies_arr = this.feed_and_replies;
        if(this.replies_arr.length < this.replies_limit ){
          this.fetchedall_replies = true; 
        }
      }
    });
  }

  showMoreFollowers(event){
    if (event) {
      if(this.follower_count === undefined){
        this.follower_count = this.profile.follower_count;
        this.following_count = this.profile.following_count;
      }
      this.follower_limit += 10;
      this.initializeFollowers();
    }
  }

  showMoreFollowing(event){
    if (event) {
      if(this.following_count === undefined){
        this.following_count = this.profile.following_count;
      }
      this.following_limit += 10;
      this.initializeFollowing();
    }
  }

  initializeFollowers(){
    if(this.follower_list && this.follower_list.length >= this.follower_count){
      this.fetchedall_followers = true;
      this.fetching_followers = false;
    }else{
      this.getFollowers();
    }
  }

  initializeFollowing(){
    if(this.following_count === 0){
      this._auth.getFollowCounter(this.profile.username).subscribe((res: any) => {
        if (res.status === 200) {
          this.following_count = res.data.following_count;
          this.follower_count = res.data.follower_count;
        }
        if(this.following_list && this.following_list.length >= this.following_count){
          this.fetchedall_following = true;
          this.fetching_following = false;
        }else{
          this.getFollowing();
        }
      });
    }else{
      if(this.following_list && this.following_list.length >= this.following_count){
        this.fetchedall_following = true;
        this.fetching_following = false;
      }else{
        this.getFollowing();
      }
    }
  }
  
  getFollowers(){
    this.follower_new = [];
    this.fetching_followers = true;
    this._auth.getFollowers(this.profile.username,this.follower_limit).subscribe((res:any) => {
      if(res.status === 200){
        let load_data = false;
        let followers = res.data;
        if(followers.length > 0){
          this.followers_arr = followers;
          if(this.follower_limit === 10){
            this.follower_new = followers;
            load_data = true;
          }else{
            if(this.follower_limit > this.follower_list.length){
              this.follower_limit = this.follower_list.length + 10;
              this.follower_new = this.followers_arr.slice(this.follower_limit-10,this.follower_limit);
              load_data = true;
            }
          }
          if(load_data){
            if(res.data[0].user_id === undefined){
              this.mapFollowers();
            }else{
              this.follower_new.forEach((follow,i) => {
                let profile_pic = '';
                if(follow.metadata){
                  if(follow.metadata.profile_image !== undefined){
                    profile_pic = this.steemimgurl +''+ follow.metadata.profile_image;
                  }
                  if(follow.metadata.about){
                    follow.metadata.about = this._globals.limitString(follow.metadata.about,this.about_string_limit);
                  }
                }
                this.follower_new[i].profile_pic = profile_pic;
                this.checkIfAuthorFollowedMe(this.follower_new,i);
                this.checkIfAuthorIsFollowedByMe(this.follower_new,i);
                this.follower_list.push(this.follower_new[i]);
              });
              const unique = (value, index, self) => {
                return self.indexOf(value) === index;
              }
              this.follower_list = this.follower_list.filter(unique);
            }
          }
        }else{
          this.follower_list = [];
        }
        this.fetching_followers = false;
      }else{
        this.fetching_followers = false;
      }
    });
  }

  mapFollowers(){
    this.follower_new.forEach((follow,i) => {
      let follower = follow.follower;
      this._auth.getAuthorMetadata(follower).subscribe((res:any) => {
        if(res.status === 200){
          let data = res.data[0];
          let follower_data:any = {};
          follower_data.user_id = data.id;
          follower_data.username = data.name;
          follower_data.created = data.created;
          follower_data.post_count = data.post_count;
          follower_data.metadata = data.json_metadata ? JSON.parse(data.json_metadata).profile : {};
          follower_data.is_verified = data.is_verified;
          let profile_pic = '';
          if(follower_data.metadata){
            if(follower_data.metadata.profile_image !== undefined){
              profile_pic = this.steemimgurl +''+  follower_data.metadata.profile_image;
            }
            if(follower_data.metadata.about){
              follower_data.metadata.about = this._globals.limitString(follower_data.metadata.about,this.about_string_limit);
            }
          }
          follower_data.profile_pic = profile_pic;
          this.follower_new[i] = follower_data;
          this.checkIfAuthorFollowedMe(this.follower_new,i);
          this.checkIfAuthorIsFollowedByMe(this.follower_new,i);
          this.follower_list.push(this.follower_new[i]);
        }else{
          this.follower_limit -= 10;
        }
      });
    });
    const unique = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.follower_list = this.follower_list.filter(unique);
  }

  getFollowing(){
    this.following_new = [];
    this.fetching_following = true;
    this._auth.getFollowing(this.profile.username,this.following_limit).subscribe((res:any) => {
      if(res.status === 200){
        let load_data = false;
        let followers = res.data;
        if(followers.length > 0){
          this.following_arr = followers;
          if(this.following_limit === 10){
            this.following_new = followers;
            load_data = true;
          }else{
            if(this.following_limit > this.following_list.length){
              this.following_limit = this.following_list.length + 10;
              this.following_new = this.following_arr.slice(this.following_limit-10,this.following_limit);
              load_data = true;
            }
          }
          if(load_data){
            if(res.data[0].user_id === undefined){
              this.mapFollowing();
            }else{
              this.following_new.forEach((follow,i) => {
                let profile_pic = '';
                if(follow.metadata){
                  if(follow.metadata.profile_image !== undefined){
                    profile_pic = this.steemimgurl +''+ follow.metadata.profile_image;
                  }
                  if(follow.metadata.about){
                    follow.metadata.about = this._globals.limitString(follow.metadata.about,this.about_string_limit);
                  }
                }
                this.following_new[i].profile_pic = profile_pic;
                this.checkIfAuthorFollowedMe(this.following_new,i);
                this.checkIfAuthorIsFollowedByMe(this.following_new,i);
                this.following_list.push(this.following_new[i]);
              });
              const unique = (value, index, self) => {
                return self.indexOf(value) === index;
              }
              this.following_list = this.following_list.filter(unique);
            }
          }
        }else{
          this.following_list = [];
        }

        this.fetching_following = false;
      }else{
        this.fetching_following = false;
      }
    });
  }

  mapFollowing(){
    this.following_new.forEach((follow,i) => {
      let following = follow.following;
      this._auth.getAuthorMetadata(following).subscribe((res:any) => {
        if(res.status === 200){
          let data = res.data[0];
          let following_data:any = {};
          following_data.user_id = data.id;
          following_data.username = data.name;
          following_data.created = data.created;
          following_data.post_count = data.post_count;
          following_data.metadata = data.json_metadata ? JSON.parse(data.json_metadata).profile : {};
          following_data.is_verified = data.is_verified;
          let profile_pic = '';
          if(following_data.metadata){
            if(following_data.metadata.profile_image !== undefined){
              profile_pic = this.steemimgurl +''+  following_data.metadata.profile_image;
            }
            if(following_data.metadata.about !== undefined){
              following_data.metadata.about = this._globals.limitString(following_data.metadata.about,this.about_string_limit);
            }
          }
          
          following_data.profile_pic = profile_pic;
          this.following_new[i] = following_data;
          this.checkIfAuthorFollowedMe(this.following_new,i);
          this.checkIfAuthorIsFollowedByMe(this.following_new,i);
          this.following_list.push(this.following_new[i]);
        }else{
          this.following_limit -= 10;
        }
      });
    });
    const unique = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.following_list = this.following_list.filter(unique);
  }

  checkIfAuthorFollowedMe(data, i) {
    data[i].is_followed = false;
    if (data[i].username !== this.auth_username) {
      this._auth.isFollowing(this.auth_username, data[i].username).subscribe((res: any) => {
        if (res.status == 200) {
          data[i].is_followed = res.data;
        }
      });
    }
  }

  checkIfAuthorIsFollowedByMe(data, i) {
    data[i].is_following = false;
    if (data[i].username !== this.auth_username) {
      this._auth.isFollowing(data[i].username, this.auth_username).subscribe((res: any) => {
        if (res.status == 200) {
          data[i].is_following = res.data;
        }
      });
    }
  }


  openViewWallet() {
    let modalRef = this._modal.open(WalletComponent);
    modalRef.componentInstance.wallet_info = this.wallet_info;
  }

  checkIfVerified() {
    this._twitter.checkIfVerified(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.is_verified = res.data;
      }
    });
  }

  checkIfSubscribed() {
    this._auth.isSubscribed(this.auth_username).subscribe((res: any) => {
      if (res.status === 200) {
        this.is_subscribed = res.data;
        let is_subscribed: any = res.data ? 1 : 0;
        localStorage.setItem('is_subscribed', is_subscribed);
      }
    });
  }

  verifyAccount() {
    this.checkIfVerified();
    if (this.is_verified) {
      Swal.fire('Your account was already verified');
    } else {
      this._twitter.getGeneratedId(this.auth_username).subscribe((res: any) => {
        if (res.status === 200 && res.data) {
          this._twitter.checkIfHasDuplicate(res.data).subscribe((res2: any) => {
            let has_duplicate = false;
            let dups = res2.data;
            if(res2.status === 200 && dups){
              if((dups.twitter_id !== "" && dups.twitter_id !== null) && dups.is_verified === 0){
                has_duplicate = true;
              }
            }
            if(has_duplicate){
              Swal.fire({
                icon: 'info',
                title: 'Your Account Verification is on progress',
                html: 'This twitter Account: <b>@' + dups.duplicate.screenname + '</b> has been used to verify dBuzz account of <b>('+dups.duplicate.username+').</b> Please use another twitter account. Discover the Buzz on @dbuzzAPP <br/> #Hive: <b>' + res.data + '</b>',
                footer: '<small>To verify your account, copy the generated text/code and Tweet it to your followers on Twitter.</small>',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Copy',
              }).then((result) => {
                if (result.value) {
                  if (this.copyText(res.data)) {
                    Swal.fire('Copied to clipboard')
                  }
                }
              });
            }else{
              Swal.fire({
                icon: 'info',
                title: 'Your Account Verification is on progress',
                html: 'Discover the Buzz on @dbuzzAPP #Hive: <b> ' + res.data + '</b>',
                footer: '<small>To verify your account, copy the generated text/code and Tweet it to your followers on Twitter.</small>',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Copy',
              }).then((result) => {
                if (result.value) {
                  if (this.copyText(res.data)) {
                    Swal.fire('Copied to clipboard')
                  }
                }
              });
            }
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Account verification',
            text: 'dBuzz offers verified accounts the ability to publish content from Twitter to the Hive Blockchain automatically. Copy the generated text/code and Tweet it to your followers on Twitter',
            footer: '<small><i> DISCLAIMER: dBuzz is a 3rd-party application and is not in any way affiliated with Twitter, Inc. <i></small>',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Generate now',
          }).then((result) => {
            if (result.value) {
              this._twitter.generateIdForTwitter().subscribe((res: any) => {
                if (res.status === 200) {
                  Swal.fire({
                    icon: 'info',
                    title: 'Generated ID:',
                    text: res.data.generated_id,
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Copy',
                  }).then((result) => {
                    if (result.value) {
                      if (this.copyText(res.data.generated_id)) {
                        Swal.fire('Copied to clipboard')
                      }
                    }
                  });
                }else{
                  Swal.fire(res.msg);
                }
              });
            }
          })
        }
      });
    }
  }

  copyText(text) {
    return this._clipboard.copyFromContent(text);
  }
}
