import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../storage.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Athrow } from '../athrow';

@Component({
  selector: 'app-my-favorites',
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.css']
})
export class MyFavoritesComponent implements OnInit {

  constructor(
    private lotterieService : LotterieService,
    private storageService : StorageService,
  ) { }

  public favorites : [string,Observable<Athrow>][];
  ngOnInit() {
    this.favorites = this.storageService.allFavorites().map((thrId) => 
      [thrId,Athrow.initAthrow(thrId,this.lotterieService)] as [string,Observable<Athrow>]);
  }
}
