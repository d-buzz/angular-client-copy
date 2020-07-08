import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { PostService } from 'src/app/globals/post.service';
import { GlobalService } from 'src/app/globals/global.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {

  @Input() searching: boolean = false;
  @Input() data: any = [];
  auth_username: string = null;
  twitter_verification_enable : boolean = false;

  constructor(private _auth: AuthService, private _post: PostService, private _globals: GlobalService) { 
    this.auth_username = this._auth.authorName;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
  }

  ngOnInit() {
  }

  follow(row) {
    row.following = true;
    let param = { author: row.username };
    if (!row.is_following) {
      this._post.followAuthor(param).subscribe((res: any) => {
        row.following = false;
        if (res.status === 200) {
          row.is_following = 1;
          this._globals.toastFire('Followed successfully', 'success');
        } else {
          this._globals.toastFire(res.data, 'error');
        }
      });
    } else {
      this._post.unfollowAuthor(param).subscribe((res: any) => {
        row.following = false;
        if (res.status === 200) {
          row.is_following = 0;
          this._globals.toastFire('Unfollowed successfully', 'success');
        } else {
          this._globals.toastFire(res.data, 'error');
        }
      });
    }
  }

}
