import { Component, Input, Inject } from '@angular/core';
import { ThrowComponentBase } from '../throw-component-base';
import { ActivatedRoute } from '@angular/router';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { Location } from '@angular/common';
import { Athrow } from '../athrow';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ThrowNewComponent } from '../throw-new/throw-new.component';

@Component({
  selector: 'app-throw-details-small',
  templateUrl: './throw-details-small.component.html',
  styleUrls: ['./throw-details-small.component.css']
})
export class ThrowDetailsSmallComponent extends ThrowComponentBase {

  onInitExtend() : void { }
  
  constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    location: Location,
    public dialog: MatDialog,
  ) {
    super(route,lotterieService,messageService,location);
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogNPart, {
      width: '250px',
      data: { thr: this.thr }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'dialog-npart',
  templateUrl: 'dialog-npart.html',
})
export class DialogNPart {

  constructor(
    public dialogRef: MatDialogRef<DialogNPart>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}