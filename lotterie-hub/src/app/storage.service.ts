import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public environment : any = null;
  constructor() { 
    if (this.db == null) {
      this.instantiateDb().then(db => this.db = db);
    }
    if (this.participations == null) {
      this.allParticipations();
    }
    if (this.favorites == null) {
      this.allFavorites();
    }
    if (this.environment == null) {
      this.loadEnvironment();
    }

  }

  private db : IDBDatabase;
  private participations : [string,number][];
  private favorites : string[];

  private instantiateDb() : Promise<IDBDatabase> {
    return new Promise(function(resolve,reject) {
    var request = window.indexedDB.open(environment.dbName, 1);
   
    request.onerror = function(event) {
      console.error("error instantiating db");
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
  public addFavorite(thrId : string) {
    if (!this.hasFavorite(thrId)) {
      this.favorites.push(thrId);
      localStorage.setItem('myFavorites',JSON.stringify(this.favorites));
    }
  }
  public removeFavorite(thrId: string) {
    let ix = this.favorites.findIndex((el) => el === thrId);
    if (ix >= 0) {
      this.favorites.splice(ix,1);
      localStorage.setItem('myFavorites',JSON.stringify(this.favorites));
    }
  }
  public allFavorites() : string[] {
    let v = localStorage.getItem('myFavorites');
    if (v == null) {
      this.favorites = [];
    } else {
      this.favorites = JSON.parse(v);
    }
    return this.favorites;
  }
 
  public hasFavorite(thrId : string) : boolean {
    let ix = this.favorites.findIndex((el) => el === thrId);
    return ix != -1;
  }
   
  public loadEnvironment() : any {
    let v = localStorage.getItem('environment');
    if (v == null) {
      this.environment = Object.assign(environment);
    } else {
      this.environment = JSON.parse(v);
    }
  }
  static staticGetEnvt(): any {
    let v = localStorage.getItem('environment');
    let r;
    if (v == null) {
      r = environment;
    } else {
      r = JSON.parse(v);
    }
    return r;
  }


  public resetEnvironment() : any {
    localStorage.removeItem('environment');
    this.loadEnvironment();
  }

  public saveEnvironment() : any {
    localStorage.setItem('environment', JSON.stringify(this.environment));
  }
}
