import { Component, OnInit, Input, EventEmitter, Output, HostListener, Renderer } from '@angular/core';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { PostService } from 'src/app/globals/post.service';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {
  @Input() profile: any;
  @Input() data: any;
  @Input() fetching: boolean = false;
  @Input() fetchedall: boolean = false;
  @Output() fetchNewFollowing = new EventEmitter();
  steemimgurl: any = '';
  auth_username: any = '';
  twitter_verification_enable : boolean = false;

  constructor(private _globals: GlobalService, private _auth: AuthService, private _post: PostService, private renderer : Renderer) {
    this.steemimgurl = this._globals.ENV.STEEMIT_IMAGE_URL;
    this.auth_username = this._auth.authorName;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE
  }

  @HostListener('window:scroll', ['$event'])
  ngOnInit() {
    let that = this;
    this.renderer.listen('window', 'scroll', (event) => {
        if(document.getElementById('profilefeed')){
          let scrollContainer = document.getElementById('profilefeed');
          const threshold = 150;
          const position = window.innerHeight + window.scrollY;
          const height = scrollContainer.scrollHeight;
          if (position >= (height - threshold)) {
              if(!that.fetching){
                that.fetchNewList()  
              }
          }
        }
    });
  }

  fetchNewList(){
    this.fetchNewFollowing.emit(true)
  }

  follow(row) {
    row.following = true;
    let param = { author: row.username };
    if (!row.is_following) {
      this._post.followAuthor(param).subscribe((res: any) => {
        row.following = false;
        if (res.status === 200) {
          row.is_following = true;
          this._globals.toastFire('Followed successfully', 'success');
        } else {
          this._globals.toastFire(res.data, 'error');
        }
      });
    } else {
      this._post.unfollowAuthor(param).subscribe((res: any) => {
        row.following = false;
        if (res.status === 200) {
          row.is_following = false;
          this._globals.toastFire('Unfollowed successfully', 'success');
        } else {
          this._globals.toastFire(res.data, 'error');
        }
      });
    }
  }
}
