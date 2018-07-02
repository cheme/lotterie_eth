import { EthId } from "../eth-components/eth-id";

export class Phaseparam {

  static fromObject(id : EthId, object: any): Phaseparam {
    let param =  {...object};
    param.id = id;
    param.participationStartMode = parseInt(param.participationStartMode);
    param.participationEndMode = parseInt(param.participationEndMode);
    param.cashoutEndMode = parseInt(param.cashoutEndMode);
    param.throwEndMode = parseInt(param.throwEndMode);
    return param;
  }
 
  id : EthId;
  participationStartMode : number;
  participationStartTreshold : string;
  participationEndValue : string;
  cashoutEndValue : string;
  throwEndValue : string;
  participationEndMode : number; // uint8;
  cashoutEndMode : number; //uint8;
  throwEndMode : number; //uint8;

}
