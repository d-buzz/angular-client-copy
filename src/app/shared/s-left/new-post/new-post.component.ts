import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from 'src/app/globals/post.service';
import { GlobalService } from 'src/app/globals/global.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/authentication/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit {

  copyFormValues: any;
  submitting: boolean = false;
  steemForm: FormGroup;
  counter: number = 0;
  char_limit: number = 0;
  hide_tags: boolean = true;
  auth_username: string = '';
  profile_pic: any;
  tags_ok: boolean = false;
  tags: any = [];
  env: any;
  auth_is_verified: boolean = false;
  twitter_verification_enable : boolean = false;

  constructor( public activeModal: NgbActiveModal, private _posts: PostService, private _globals: GlobalService, private _auth: AuthService,) { 

    this.char_limit = this._globals.ENV.CHAR_LIMIT;
    this.counter = this.char_limit;
    this.auth_username = this._auth.authorName;
    if(this._auth.authorName === ''){
      this._globals.ACTV_ROUTE.queryParams.subscribe(params => {
        if(params.username){
          this.auth_username = params.username; 
        }
      });
    }
    this.profile_pic = this._auth.getProfileImage(this.auth_username);
    this.env = this._globals.ENV;
    this.auth_is_verified = this._auth.isVerified;
    this.twitter_verification_enable = this.env.TWITTER_VERIFICATON_ENABLE;
  }

  ngOnInit() {
    this.steemForm = new FormGroup({
      post: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(this.char_limit)]),
      tags: new FormControl(''),
    });
  }

  createPost() {
    this.copyFormValues = { ... this.steemForm.value };
    this.copyFormValues.tags = JSON.stringify(this.tags);
    this.submitting = true;
    this._posts.createPost(this.copyFormValues).subscribe((res: any) => {
      if (res.status == 200) {
        this.activeModal.close('true');
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
        //   this.activeModal.close('true');
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
    this.steemForm.reset();
    this.counter = this.char_limit;
    this.hide_tags = true;
    this.tags = [];
  }

  updateCounter() {
    let total = 0;
    let post = this.steemForm.value.post;
    if(post!==null){
      total += post.length;
    }
    // if(this.tags.length > 0){
    //   this.tags.forEach(tag => {
    //     total += tag.length;
    //   });
    // }
    let counter = this.char_limit - total;
    this.counter = counter;
    let el = document.getElementById('counter_lbl1');
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
      el.style.cssText = 'height:5em;';
    }
  }

  
  addTags(){
    let post = this.steemForm.value.post;
    if(post !== ''){
      if(this.hide_tags){
        this.hide_tags = false;
      }
    }else{
      this.tags = [];
      this.hide_tags = true;
      this.steemForm.patchValue({ tags: '' });
    }
  }

  validateTags(){
    let tags = this.steemForm.value.tags;
    if(tags !== ''){
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
    }else{
      this.tags_ok = false;
    }

    if(this.tags.length > 0){
      this.tags_ok = true;
    }else{
      this.tags_ok = false;
    }

    this.updateCounter();
  }

  removeTag(index){
    if(this.tags.length > 0){
      this.tags.splice(index,1);
      this.tags_ok = true;
    }else{
      this.tags_ok = false;
    }

    if(this.tags.length === 0){
      this.tags_ok = false;
    }

    this.updateCounter();
  }

  gotoProfile(){
    this.activeModal.close();
    this._globals.ROUTER.navigate(['/profile']);
  }

  
  pushTagsOnKeyUp(){
    let tags = this.steemForm.value.tags;
    if (tags !== '') {
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
      this.activeModal.close('true');
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
}
