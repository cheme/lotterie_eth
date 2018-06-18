import { EthId } from "../eth-components/eth-id";

export class Winningparam {

  static fromObject(id : EthId, object: any): Winningparam {
    //let param =  {...object};
    let param =  {
      id,
      nbWinners : parseInt(object.nbWinners),
      nbWinnerMinRatio : parseInt(object.nbWinnerMinRatio),
      distribution : parseInt(object.distribution),
    };
    return param;
  }
    id : EthId;
  // TODO how to put constraint on type with angular?? -> here positive less than 255
    nbWinners : number;
    // positive less than 101
    nbWinnerMinRatio : number;
    // enum vals
    distribution : number; // u8 mapped to label (aka enum)
}
