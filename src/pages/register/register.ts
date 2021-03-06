import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController, AlertController } from 'ionic-angular';
import { Account } from '../../models/account.model';
import { AuthService } from '../../providers/auth/auth.service';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { map, take, debounceTime } from 'rxjs/operators';


/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage implements OnInit {

  account = {} as Account;
  loader: Loading;
  myForm: FormGroup;
  passwordConfirm: string;
  DOBType: string = 'text';
  //passwordIcon: string = 'eye-outline';

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private loadingCrtl: LoadingController,
              private auth: AuthService,
              private fb: FormBuilder,
              private afs: AngularFirestore,
              private alertCtrl: AlertController) {
                
  }

  ngOnInit(){
    this.myForm = this.fb.group({
      username: ['',
      Validators.required,
      CustomValidator.username(this.afs)],
      email: '',
      password: ''
      // dob: ''
    })

    this.myForm.valueChanges.subscribe(console.log);
  }

  navigateToLogin(){
    this.navCtrl.pop();
  }

  hideShowPassword() {
    this.DOBType = this.DOBType === 'text' ? 'date' : 'date';
   // this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
}

  get email() {
    return this.myForm.get('email')
  }

  get username() {
    return this.myForm.get('username')
  }



  async register(){
    if (this.myForm.invalid || this.account.password != this.passwordConfirm){
      this.alertCtrl.create({
        title: 'Aaaaand you screwed up.',
        subTitle: 'Fill out the above info with no errors',
        buttons:[
          {text: 'Okay. My B',
          role: 'Cancel'
        }]
      }).present();
    } else {
      this.showLoading();
        this.account.isVendor = false;
        await this.auth.showEmailVerificationDialog(this.account);
        this.loader.dismiss();
        this.navCtrl.push('LoginPage');
    }
  }

  showLoading(){
    this.loader = this.loadingCrtl.create({
      content: `<img src="assets/imgs/loading.gif" />`,
      showBackdrop: false,
      spinner: 'hide'
    })
    this.loader.present();
  }

}

export class CustomValidator {
  static username(afs: AngularFirestore) {
    return (control: AbstractControl) => {
      
      // return an observable here....
      
  
        const username = control.value.toLowerCase();
        
        return afs.collection('accounts', ref => ref.where('username', '==', username) )
                  
          .valueChanges().pipe(
            debounceTime(500),
            take(1),
            map(arr => arr.length ? { usernameAvailable: false } : null ),
          )
      

    }
  }
}
