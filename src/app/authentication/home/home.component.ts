import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd } from '@angular/router';
import { FeedService } from 'src/app/globals/feed.service';
import Swal from 'sweetalert2';
import { PostService } from 'src/app/globals/post.service';
import { EmbedVideoService } from 'ngx-embed-video';
import { NgxSpinnerService } from "ngx-spinner";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
    model = {
        left: true,
        middle: false,
        right: false
    };

    focus;
    focus1;
    navigationSubscription: any;
    fetchedall: boolean = false;
    loading: boolean = false;
    offset: number = 0;
    limit: number = 10;
    feed_list: any = [];
    data: any = {};
    auth: any = {};
    token: any = '';
    feed: string = 'user-feed';

    user_feed: any = [];
    trending: any = [];
    latest: any = [];

    is_subscribed: boolean = true;
    first_load: boolean = false;

    
    constructor(private _globals: GlobalService, private _auth: AuthService, private _routingState: RoutingStateService,
        private _cookieService: CookieService, private _feeds: FeedService, private _post: PostService, 
        private embedService: EmbedVideoService, private spinner: NgxSpinnerService, private sanitizer: DomSanitizer) {
        this._globals.ACTV_ROUTE.queryParams.subscribe(params => {
            if (params.access_token !== undefined) {
                this.token = params.access_token + '&username=' + params.username + '&expires_in=' + params.expires_in;
                this._auth.setAccessToken(this.token);
            }

            if (params.username) {
                this.auth.auth_username = params.username;
            }
        });

        if (!this.auth.auth_username) {
            this.auth.auth_username = this._auth.authorName;
        }


        if (!this.token) {
            this.token = this._auth.accessToken;
        }
        let steemdata = localStorage.getItem('steemconnect');
        if (this.token) {
            if (!steemdata) {
                this.spinner.show();
                this.first_load = true;
                this._auth.checkAuthToken(this.token).subscribe((res: any) => {
                    if (res.status === 200 && res.data) {
                        let voting_power: any = res.data.steemconnect.voting_power;
                        if (voting_power === null) {
                            voting_power = 0;
                        }
                        localStorage.setItem('voting_power', voting_power);
                        let metadatas = this._auth.metaData;
                        if (!metadatas) {
                            let info = res.data.steemconnect;
                            this.auth.profile_pic = info.profile_image;
                            this.auth.auth_is_verified = info.is_verified == 1;
                            let steemconnectd: any = JSON.stringify(info)
                            sessionStorage.setItem('steemconnect', steemconnectd);
                            localStorage.setItem('steemconnect', steemconnectd);
                            localStorage.setItem('is_subscribed', info.is_member);
                            this._auth.setWalletInfo();
                            this._cookieService.set('steemconnect_name', info.name);
                            this._cookieService.set('steemconnect_id', info.id);
                            this.is_subscribed = info.is_member == 1;
                            if (info.is_member == 0) {
                                this.showSubscribeSwal();
                            }
                        }
                        this.spinner.hide();
                    } else {
                        this.spinner.hide();
                        this._globals.toastFire('Something went wrong in fetching user data from HIVE API. You will be redirected to login...', 'error');
                        setTimeout(() => {
                            this._globals.ROUTER.navigate(['/login']);
                        }, 3000);
                    }
                });
            } else {
                this.auth.profile_pic = this._auth.getProfileImage(this.auth.auth_username);
                this.auth.auth_is_verified = this._auth.isVerified;
                this._auth.getVotingPower(this.auth.auth_username).subscribe((res: any) => {
                    if (res.status === 200) {
                        let voting_power: any = res.data;
                        if (voting_power == null) {
                            voting_power = 0;
                        }
                        localStorage.setItem('voting_power', voting_power);
                    }
                });
            }
            this.navigationSubscription = this._globals.ROUTER.events.filter(e => e instanceof NavigationEnd).subscribe((e: any) => {
                this._routingState.loadRouting();
                let getUrl = this._globals.ROUTER_STATE;
                if (getUrl) {
                    this.feed = getUrl[2];
                    if (this.feed === 'user-feed') {
                        this.feed = 'home';
                    }
                    if (this.auth.auth_username) {
                        this.offset = 0;
                        this.fetchedall = false;
                        this.initialize();
                        if (!this.first_load) {
                            this.is_subscribed = this._auth.isMember;
                            let local_sub = localStorage.getItem('local_subscribed');
                            if (!local_sub) {
                                this.checkIfSubscribed();
                            }
                            this.showSubscribeSwal();
                        }
                    }
                }
            });
            this.data.auth = this.auth;

        } else {
            if (!steemdata) {
                this._globals.ROUTER.navigate(['/login']);
            }
        }
    }
    
    ngOnInit() {}

    ngOnDestroy() {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }


    refreshList($event) {
        if ($event) {
            this.initialize();
        }
    }

    showSubscribeSwal() {
        let local_sub = localStorage.getItem('local_subscribed');
        if (!this.is_subscribed && !local_sub) {
            Swal.fire({
                icon: 'info',
                title: 'Subscribe to dBuzz to Discover the Buzz.',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Subscribe Now',
            }).then((result) => {
                if (result.value) {
                    Swal.fire({
                        title: 'Subscribing...',
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                        showLoaderOnConfirm: true,
                        onOpen: () => {
                            Swal.showLoading();
                            this._post.subscribeCommunity().subscribe((res: any) => {
                                if (res.status === 200) {
                                    localStorage.setItem('is_subscribed', "1");
                                    localStorage.setItem('local_subscribed', "1");
                                    this.is_subscribed = true;
                                    Swal.stopTimer();
                                    Swal.fire({
                                        title: 'Subscribed!',
                                        icon: 'success',
                                        timer: 2000,
                                        showConfirmButton: false,
                                    })
                                    location.reload();
                                } else {
                                    Swal.stopTimer();
                                    this._globals.toastFire(res.data, 'error');
                                }
                            });
                        }
                    });
                }
            })
        }
    }

    checkIfSubscribed() {
        this._auth.isSubscribed(this.auth.auth_username).subscribe((res: any) => {
            if (res.status === 200) {
                let is_subscribed: any = res.data ? 1 : 0;
                this.is_subscribed = res.data;
                localStorage.setItem('is_subscribed', is_subscribed);
            }
        });
    }

    initialize() {
        // let emptyit = false;
        // let backurl = this._routingState.getPreviousUrl();
        // if(backurl){
        //     let _back_url = backurl.split('/');
        //     if(_back_url[1] !== 'post'){
        //         emptyit = true;
        //     }
        // }else{
        //     emptyit = true;
        // }
        this.limit = 10;
        this.data.feeds = [];
        if (this.feed == 'trending') {
            this._feeds.trendingFeedResponse = null;
        } else if (this.feed == 'latest') {
            this._feeds.latestFeedResponse = null;
        } else {
            this._feeds.userFeedResponse = null;
        }
      
        if (this.feed == 'trending') {
            this.trending = this._feeds.trendingFeedResponse;
            if (!this.trending) {
                this.getFeeds();
            } else {
                this.data.feeds = this.trending;
            }
        } else if (this.feed == 'latest') {
            this.latest = this._feeds.latestFeedResponse;
            if (!this.latest) {
                this.getFeeds();
            } else {
                this.data.feeds = this.latest;
            }
        } else {
            this.user_feed = this._feeds.userFeedResponse;
            if (!this.user_feed) {
                this.getFeeds();
            } else {
                this.data.feeds = this.user_feed;
            }
        }
    }

    getFeeds() {
        this.feed_list = [];
        this.loading = true;
        if (this.feed == 'trending') {
            this._feeds.getTrendingPost(this.limit, this.offset).subscribe((res: any) => {
                if (res.status == 200) {
                    if (res.count > 0) {
                        if (this.trending && this.trending.length >= res.count) {
                            this.fetchedall = true;
                        } else {
                            this.feed_list = res.data;
                            this.mapFeedList();
                        }
                    } else {
                        this.loading = false;
                    }
                } else {
                    this._globals.toastFire('Failed to fetch data from HIVE API', 'error');
                    this.data.feeds = [];
                    this.loading = false;
                }
            });
        } else if (this.feed === 'latest') {
            this._feeds.getLatestPost(this.limit, this.offset).subscribe((res: any) => {
                if (res.status == 200) {
                    if (res.count > 0) {
                        if (this.latest && this.latest.length >= res.count) {
                            this.fetchedall = true;
                        } else {
                            this.feed_list = res.data;
                            this.mapFeedList();
                        }
                    } else {
                        this.loading = false;
                    }
                } else {
                    this._globals.toastFire('Failed to fetch data from HIVE API', 'error');
                    this.data.feeds = [];
                    this.loading = false;
                }
            });
        } else {
            this._feeds.getUserFeed(this.auth.auth_username, this.limit, this.offset).subscribe((res: any) => {
                if (res.status == 200) {
                    if (res.count > 0) {
                        if (this.user_feed && this.user_feed.length >= res.count) {
                            this.fetchedall = true;
                        } else {
                            this.feed_list = res.data;
                            this.mapFeedList();
                        }
                    } else {
                        this.loading = false;
                    }
                } else {
                    this._globals.toastFire('Failed to fetch data from HIVE API', 'error');
                    this.data.feeds = [];
                    this.loading = false;
                }
            });
        }
    }

    mapFeedList() {
        let ind = 0;
        this.feed_list.forEach((feed, i) => {
            feed.user_is_voter = 0;
            feed.voting = false;
            feed.voting_weight = 0;
            feed.is_reblogged = 0;
            feed.total_replies = 0;
            feed.reblogging = false;
            this.checkIfHasVideo(feed);
            this.checkIfVoter(feed);
            this.checkIfReblogger(feed);
            ind++;
            if (ind === this.feed_list.length) {
                this.setFeedList(this.feed_list);
            }
        });
    }

    getTotalComments(replies, feed) {
        if (replies.length > 0) {
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
            let yt_link = checker[0].replace('feature=emb_rel_end&', '');
            feed.has_video = true;
            feed.is_youtube_vid = true;
            var video_id = checker[0].split('v=')[1];
            if (video_id) {
                if (video_id.indexOf('&') != -1) {
                    var ampersandPosition = video_id.indexOf('&');
                    video_id = video_id.substring(0, ampersandPosition);
                }
                yt_link = 'http://www.youtube.com/watch?v=' + video_id
            }
            this.embedService
                .embed_image(
                    yt_link,
                    { image: 'mqdefault' }
                )
                .then(res => {
                    if (res.link) {
                        feed.video_html = "<img src='" + res.link + "' class='yt-video'><div class='play'></div>";
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

    checkIfVoter(feed: any) {
        if (feed.active_votes.length > 0) {
            feed.active_votes.forEach(votes => {
                if (parseInt(votes.rshares) > 0 && parseInt(votes.percent) > 0) {
                    if (votes.voter === this.auth.auth_username) {
                        feed.user_is_voter = 1;
                        feed.voting_weight = votes.percent;
                    }
                }
            });
        }
    }

    checkIfReblogger(feed: any) {
        if (feed.rebloggers.length > 0) {
            feed.rebloggers.forEach(reblogger => {
                if (reblogger === this.auth.auth_username) {
                    feed.is_reblogged = 1;
                }
            });
        }
    }

    setFeedList(feeds) {
        if (this.feed == 'trending') {
            this.trending = feeds;
            this._feeds.trendingFeedResponse = feeds;
        } else if (this.feed == 'latest') {
            this.latest = feeds;
            this._feeds.latestFeedResponse = feeds;
        } else {
            this.user_feed = feeds
            this._feeds.userFeedResponse = feeds;
        }
        
        this.data.feeds = feeds;
        this.loading = false;
    }

    showMoreFeed(event) {
        if (event) {
            this.limit += 10;
            this.getFeeds();
        }
    }
}
