 import BigNumber from 'bignumber.js';

export class Winningparam {

  static fromObject(id : BigNumber, object: any): Winningparam {
    let param =  new Winningparam ();
    param.nbWinners = object.nbWinners;
    param.nbWinnerMinRatio = object.nbWinnerMinRatio;
    param.distribution = object.distribution;
    param.id = id;
    return param;
  }
    id : BigNumber;
  // TODO how to put constraint on type with angular?? -> here positive less than 255
    nbWinners : number;
    // positive less than 101
    nbWinnerMinRatio : number;
    // enum vals
    distribution : number; // u8 mapped to label (aka enum)
}
