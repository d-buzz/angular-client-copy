import { Component, OnInit, Input, Output, EventEmitter, HostListener, Renderer } from '@angular/core';
import { FeedService } from 'src/app/globals/feed.service';
import { GlobalService } from 'src/app/globals/global.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { PostService } from 'src/app/globals/post.service';
import { NgbPopoverConfig, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ModalPostComponent } from '../../home-feed/modal-post/modal-post.component';
import { FormControl } from '@angular/forms';
import { Options } from 'ng5-slider';
import Swal from 'sweetalert2';
import { RoutingStateService } from 'src/app/globals/routing-state.service';

@Component({
  selector: 'app-replies',
  templateUrl: './replies.component.html',
  styleUrls: ['./replies.component.scss']
})
export class RepliesComponent implements OnInit {

  @Input() profile: any;
  @Input() fetching: boolean = false;
  @Input() fetchedall: boolean = false;
  @Input() feed_and_replies: any = [];
  @Output() fetchNewReplies = new EventEmitter();

  auth_username: any;
  profile_username: any = '';
  resaid_name: any = '';
  sliderControl: FormControl = new FormControl();
  showSlider: any = 'hide';
  auth_voting_weight: number = 0;
  twitter_verification_enable : boolean = false;
  options: Options = {
    floor: 0,
    ceil: 100
  };

  constructor(private _feeds: FeedService, private _globals: GlobalService,
    private _auth: AuthService, private _posts: PostService, private _modal: NgbModal,
    private _routingState: RoutingStateService, private renderer: Renderer) {
    this.auth_username = this._auth.authorName;
    this.auth_voting_weight = this._auth.votingPower;
    this.twitter_verification_enable = this._globals.ENV.TWITTER_VERIFICATON_ENABLE;
  }

  @HostListener('window:scroll', ['$event'])
  ngOnInit() {
    if (this.profile) {
      this.profile_username = this.profile.username;
    }

    if (this.profile_username == this.auth_username) {
      this.resaid_name = 'You';
    } else {
      this.resaid_name = this.profile_username;
    }

    let voting_power = this.auth_voting_weight;
    if (!isNaN(voting_power)) {
      this.options.ceil = voting_power;
      this.sliderControl.setValue(voting_power);
    } else {
      this.getCurrentVotingPower();
    }

    let that = this;
    this.renderer.listen('window', 'scroll', (event) => {
      if (document.getElementById('profilefeed')) {
        let scrollContainer = document.getElementById('profilefeed');
        const threshold = 150;
        const position = window.innerHeight + window.scrollY;
        const height = scrollContainer.scrollHeight;
        if (position >= (height - threshold)) {
          if (!that.fetching) {
            that.fetchNewList()
          }
        }
      }
    });
  }

  fetchNewList() {
    this.fetchNewReplies.emit(true)
  }

  getCurrentVotingPower() {
    if (this.profile) {
      this._auth.getVotingPower(this.auth_username).subscribe((res: any) => {
        if (res.status === 200) {
          let voting_power: any = res.data;
          if(!voting_power){
            voting_power = 0;
          }
          localStorage.setItem('voting_power', voting_power);
          this.auth_voting_weight = parseInt(voting_power);
          this.sliderControl.setValue(parseInt(voting_power));
        }
      });
    }
  }
  //@todos
  comment(feed: any, index: number) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    const modalRef = this._modal.open(ModalPostComponent, ngbModalOptions);
    feed.auth_username = this.auth_username;
    feed.auth_profile_pic = this.profile.profile_image;
    feed.cur_index = index;
    modalRef.componentInstance.feed = feed;
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
        this.showSlider = 'hide';
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
              feed.voter_counter += 1;
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

  showSliderPost(feed, i) {
    if (this.showSlider === 'hide') {
      if (!feed.user_is_voter) {
        if (this.sliderControl.value <= 0) {
          this._globals.toastFire('Failed to fetch user voting weight from HIVE API', 'error');
          this.getCurrentVotingPower();
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
            this.upvote(feed);
          }
        });
      }
    } else {
      this.showSlider = 'hide';
    }

  }

  gotoProfile(author) {
    this._globals.ROUTER.navigate(['/profile/', '@'+author]);
  }

  viewPost(feed) {
    this._routingState.loadData(feed);
    this._globals.ROUTER.navigate(['/post', feed.parent_author, feed.parent_permlink]);
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
}
