import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { FeedService } from 'src/app/globals/feed.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { RoutingStateService } from 'src/app/globals/routing-state.service';
import { EmbedVideoService } from 'ngx-embed-video';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchResultComponent implements OnInit {
  search_key: any = null;
  auth_username: string = null;
  searching_witnesses: boolean = false;
  searching_people: boolean = false;
  searching_latest: boolean = false;

  offset: number = 0;
  witness_limit: number = 100;
  people_limit: number = 100;
  latest_limit: number = 20;

  witnesses: any = [];
  people: any = [];
  latest: any = [];

  constructor(private _feeds: FeedService, private _routingState: RoutingStateService,
    private _auth: AuthService, private _globals: GlobalService, 
    private embedService: EmbedVideoService, private sanitizer: DomSanitizer) {
    this.search_key = this._routingState.getSearchKey();
    this.auth_username = this._auth.authorName;
  }

  ngOnInit() {
    if (this.search_key !== null) {
      this.lookupWitnesses(this.search_key);
      this.lookupPeople(this.search_key);
      this.lookupLatest(this.search_key);
    }
  }

  startSearch(ev) {
    if (ev) {
      this.lookupWitnesses(ev);
      this.lookupPeople(ev);
      this.lookupLatest(ev);
    } else {
      this.witnesses = [];
      this.people = [];
      this.latest = [];
    }
  }

  lookupWitnesses(q: any) {
    this.searching_witnesses = true;
    this._feeds.lookupWitness(q, this.witness_limit, this.offset).subscribe((res: any) => {
      this.searching_witnesses = false;
      if (res.status === 200) {
        this.witnesses = res.data;
        this.witnesses.forEach(wit => {
          wit.witness_info = JSON.parse(wit.witness_info);
          wit.author_accounts = JSON.parse(wit.metadata);
        });
      }
    });
  }

  lookupPeople(q: any) {
    this.searching_people = true;
    this._feeds.lookupPeople(q, this.people_limit, this.offset).subscribe((res: any) => {
      this.searching_people = false;
      if (res.status === 200) {
        this.people = res.data;
        this.people.forEach(data => {
          data.author_accounts = JSON.parse(data.metadata);
          data.is_following = false;
          data.following = false;
          data.is_followed = false;
          if (this.auth_username) {
            this._auth.isFollowing(data.author_accounts.author, this.auth_username).subscribe((res1: any) => {
              if (res1.status == 200) {
                data.is_following = res1.data;
              }
            });

            this._auth.isFollowing(this.auth_username, data.author_accounts.author).subscribe((res2: any) => {
              if (res2.status == 200) {
                data.is_followed = res2.data;
              }
            });
          }
        });
      }
    });
  }

  lookupLatest(q: any) {
    this.searching_latest = true;
    this.latest = [];
    this._feeds.lookupLatest(q, this.latest_limit, this.offset).subscribe((res: any) => {
      this.searching_latest = false;
      if (res.status === 200 && res.data) {
        this.latest = res.data;
        this.latest.forEach(content => {
          content.user_is_voter = 0;
          content.voting_weight = 0;
          content.is_reblogged = 0;
          content.total_replies = 0;
          if (content.active_votes && content.active_votes.length > 0) {
            content.active_votes.forEach(votes => {
              if (parseInt(votes.rshares) > 0 && parseInt(votes.percent) > 0) {
                if (votes.voter === this.auth_username) {
                  content.user_is_voter = 1;
                  content.voting_weight = votes.percent;
                }
              }
            });
          }

          if (content.rebloggers && content.rebloggers.length > 0) {
            content.rebloggers.forEach(reblogger => {
              if (reblogger === this.auth_username) {
                content.is_reblogged = 1;
              }
            });
          }

          if (content.total_replies === 0) {
            // this.getTotalComments(content.replies, content);
          }
          this.checkIfHasVideo(content);
        });
      }
    });
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
}
