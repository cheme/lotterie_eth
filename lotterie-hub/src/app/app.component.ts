import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title : String = "my title";
  constructor() {
    this.title = "titdle";
    setTimeout(() => this.title = "btitle", 2000);
  }
}
