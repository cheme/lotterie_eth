import BigNumber from 'bignumber.js';

export class Phaseparam {

  static fromObject(id : BigNumber, object: any): Phaseparam {
    let param =  {...object};
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
