import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { 
    if (this.db == null) {
      this.instantiateDb().then(db => this.db = db);
    }
    if (this.participations == null) {
      this.allParticipations();
    }

  }

  private db : IDBDatabase;
  private participations : [string,number][];

  private instantiateDb() : Promise<IDBDatabase> {
    return new Promise(function(resolve,reject) {
    var request = window.indexedDB.open(environment.dbName, 1);
   
    request.onerror = function(event) {
      console.log("error: ");
      reject(event);
    };
    request.onupgradeneeded = function(event) {
      var db = request.result;
      if (!db.objectStoreNames.contains('default')) {
        db.createObjectStore('default');
      }
    };
    request.onsuccess = function(event) {
      var db = request.result;
      console.log("success: "+ db);
      resolve(db);
    };
    });
  }
  
  public readVal(key) : Promise<any> {
    return new Promise((resolve,reject) => {
    var transaction = this.db.transaction(['default']);
    var objectStore = transaction.objectStore('default');
    var request = objectStore.get(key);
    request.onerror = function(event) {
      console.log("Unable to retrieve data from database, at : " + key);
      reject(event);
    };
    request.onsuccess = function(event) {
      resolve(request.result);
    };
    });
  }
  
  public writeVal(key,val) : Promise<any> {
    return new Promise((resolve,reject) => {
      var request = this.db.transaction(['default'], "readwrite")
                  .objectStore('default')
                  .add(val,key);
                                   
      request.onsuccess = function(event) {
        resolve(event);
      };
           
      request.onerror = function(event) {
        console.error("error writing in indexeddb" + event);
          reject(event);
      }
           
    });
  }

  // TODO switch part storage to indexeddb
  public addParticipation(thrId : string, pId : number) {
    if (!this.hasParticipation(thrId,pId)) {
      this.participations.push([thrId,pId]);
      localStorage.setItem('myBoard',JSON.stringify(this.participations));
    }
  }
  public removeParticipation(thrId: string, pId : number) {
    let ix = this.participations.findIndex((el) => el[1] === pId && el[0] === thrId);
    if (ix >= 0) {
      this.participations.splice(ix,1);
      localStorage.setItem('myBoard',JSON.stringify(this.participations));
    }
  }
  public allParticipations() : [string,number][] {
    let v = localStorage.getItem('myBoard');
    if (v == null) {
      this.participations = [];
    } else {
      this.participations = JSON.parse(v);
    }
    return this.participations;
  }
 
  public hasParticipation(thrId : string, pId : number) : boolean {
    let ix = this.participations.findIndex((el) => el[1] === pId && el[0] === thrId);
    return ix != -1;
  }
   
}
