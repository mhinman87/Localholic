import { Injectable } from '@angular/core';
import { FoodTruck } from '../../models/foodtruck.model';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '../../../node_modules/angularfire2/firestore';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Account } from '../../models/account.model';
import { User } from 'firebase/app';
import { AngularFireStorage } from 'angularfire2/storage';
import {sum, values} from 'lodash';



/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {

  foodTruckCollection: AngularFirestoreCollection<FoodTruck>;
  foodTrucks: Observable<FoodTruck[]>;
  accountDocument: AngularFirestoreDocument<Account>;
  myUrl: string;

  constructor(private afs: AngularFirestore,
              private afStorage: AngularFireStorage) {
              
  }

  getItemVotes(itemId): Observable<any>{
    return this.afs.collection(`foodtrucks/${itemId}/votes`).doc('votes').snapshotChanges().map(actions =>{
      return actions.payload.data()
    })
  }

  getUserVotes(userId): Observable<any> {
    return this.afs.collection(`accounts/${userId}/votes`).doc('votes').snapshotChanges().map(actions =>{
      return actions.payload.data()
    })
  }

  updateUserVote(itemId, userId, vote, ownerId): void {
    let data = {}
    data[userId] = vote;
    this.afs.collection(`foodtrucks/${itemId}/votes`).doc('votes').update(data);
    if (userId != ownerId){
        let data2 = {}
        data2[userId] = vote;
        let data3 = {}
        data3[itemId] = data2;
        this.afs.collection(`accounts/${ownerId}/votes`).doc('votes').update(data3);
    }
  }

  userCheckIn(itemId, userId, ownerId, vote, authUserCheckIns){
    let now = new Date().getTime()
    let data = {}
    data['checkIns'] = vote + 1;
    this.afs.collection(`foodtrucks/${itemId}/votes`).doc('votes').update(data)
    let data2 = {}
    data2['checkIns'] = authUserCheckIns + 1;
    let data3 = {}
    data3[userId] = data2 
    this.afs.collection('accounts').doc(userId).update({eventCheckInTimer: now + 300000})
    this.afs.collection(`accounts/${userId}/votes`).doc('votes').update(data3);
    let data5 = {}
    data5[itemId] = data;
    this.afs.collection(`accounts/${ownerId}/votes`).doc('votes').update(data5)
  }


  async saveFoodtruck(foodtruck: FoodTruck){
    let data = {};
    data[foodtruck.ownerId] = 1;
    data['checkIns'] = 0;
    this.foodTruckCollection = this.afs.collection('foodtrucks'); //reference
    let docRef = await this.foodTruckCollection.add(foodtruck);
    this.afs.collection(`foodtrucks/${docRef.id}/votes`).doc('votes').set(data);
    foodtruck.id = docRef.id
    docRef.update(foodtruck);
  }


  getFoodtrucks(){
    this.foodTruckCollection = this.afs.collection('foodtrucks', ref => {
      return ref.where('eventEnd', '>=', Date.now()- 5*3600000);
    }) //reference
    //

    //This filters the returned foodtrucks (whos endTime has not passed - see above query) and returns 
    //only foodtrucks who startTime is also passed (RESULT: Active foodtrucks only)
    //this forEach break is not very elegant and i actually don't know if it helps me
    return this.foodTruckCollection.snapshotChanges().map(actions =>{
      let now = new Date().getTime() - 5*3600000;
      return actions.filter(b => b.payload.doc.data().eventStart < now).map(a => {
            let data = a.payload.doc.data() as FoodTruck;
            data.id = a.payload.doc.id;
            this.getItemVotes(data.id).forEach(allUserVotes => {
              data.aura = sum(values(allUserVotes))
              console.log('ruunnninnnggg')
            })
            return data
          })
    })

    
  }

  getUpcomingEvents(){
    this.foodTruckCollection = this.afs.collection('foodtrucks', ref => {
      return ref.where('eventStart', '>=', Date.now()- 5*3600000);
    }); 

    this.foodTrucks = this.foodTruckCollection.snapshotChanges().map(actions =>{
      return actions.map(a => {
            let data = a.payload.doc.data() as FoodTruck;
            data.id = a.payload.doc.id;
            this.getItemVotes(data.id).forEach(allUserVotes => {
              data.aura = sum(values(allUserVotes))
              console.log('ruunnninnnggg')
            })
            return data
          })
    })
    return this.foodTrucks;
  }

  getAccountInfo(uid: string){
    this.accountDocument = this.afs.collection('accounts').doc(uid)//reference
    return this.accountDocument.valueChanges();
  }

  getFoodtruckFromId(id: number){
    this.foodTruckCollection = this.afs.collection('foodtrucks', ref => {
      return ref.where('eventStart', '==', id);
    }) //reference
    this.foodTrucks = this.foodTruckCollection.valueChanges();
    /*
    this.foodTrucks = this.foodTruckCollection.snapshotChanges().map(actions =>{
      return actions.map(a => {
        const data = a.payload.doc.data() as FoodTruck;
        if (data.id == id){
          return data
        }
      })
    })
    */
    return this.foodTrucks;
  }

  async createProfile(user: User, account: Account){
    let data2 = {}
    data2['checkIns'] = 0;
    let data3 = {}
    data3[user.uid] = data2;
    this.accountDocument = this.afs.collection('accounts').doc(user.uid)//reference
    await this.accountDocument.set(account);
    this.afs.collection(`accounts/${user.uid}/votes`).doc('votes').set(data3);
  }

  async uploadFile(username: string, file, uid) {
    var fileRef = this.afStorage.storage.ref("profilePics/");
    var dbfile = await fileRef.child(`${uid}/` + file.name).put(file);

    this.myUrl = await dbfile.ref.getDownloadURL();
    
    console.log(this.myUrl)
      return this.myUrl;
  }

  async eventUploadFile(username: string, file, eventName: string) {
    var fileRef = this.afStorage.storage.ref("eventPics/");
    var dbfile = await fileRef.child(`${username}/${eventName}/` + file.name).put(file);

    this.myUrl = await dbfile.ref.getDownloadURL();
    
    console.log(this.myUrl)
      return this.myUrl;
  }

  updateAccount(uid: string, account: Account){
    try {
      this.accountDocument = this.afs.collection('accounts').doc(uid);
    this.accountDocument.update(account);
    } catch (e) {
      console.error(e);
    }
  }

  async deleteProfilePic(uid:string, filename: string){
    try {
      await this.afStorage.ref(`profilePics/${uid}/${filename}`).delete();
    } catch(e) {
      console.error(e)
    }
  }

 


}
