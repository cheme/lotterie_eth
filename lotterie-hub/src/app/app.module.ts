import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TestnbComponent } from './testnb/testnb.component';
import { AccountComponent } from './account/account.component';
import { AppRoutingModule } from './/app-routing.module';
import { ThrowsComponent } from './throws/throws.component';
import { ParamsModule } from './params/params.module';
import { ThrowModule } from './throw/throw.module';
import { MessagesComponent } from './messages/messages.component';

@NgModule({
  declarations: [
    AppComponent,
    TestnbComponent,
    AccountComponent,
    ThrowsComponent,
    MessagesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ThrowModule,
    //ParamsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
