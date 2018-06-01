import BigNumber from 'bignumber.js';

export class Phaseparam {

  static fromObject(id : BigNumber, object: any): Phaseparam {
    let param =  new Phaseparam ();
    param.participationStartTreshold = object.participationStartTreshold;
    param.participationEndValue = object.participationEndValue;
    param.cashoutEndValue = object.cashoutEndValue;
    param.throwEndValue = object.throwEndValue;
    param.participationEndMode = object.participationEndMode;
    param.cashoutEndMode = object.cashoutEndMode;
    param.throwEndMode = object.throwEndMode;
    param.id = id;
    return param;
  }
 
    id : BigNumber;
      participationStartTreshold : BigNumber;
      participationEndValue : BigNumber;
      cashoutEndValue : BigNumber;
      throwEndValue : BigNumber;
      participationEndMode : number; // uint8;
      cashoutEndMode : number; //uint8;
      throwEndMode : number; //uint8;
}
