import BigNumber from "bignumber.js";

export class Participation {

  throwAddress : string;
  participationId : number;

  // seed from contract
  seed : string;
  from : string;
  state : number;

  hiddenSeed : string = undefined;
  revealedSeed : string = undefined;
  score : number[];

  wintowithdraw : boolean = false;

  static fromObject(throwAdd : string, partId : number, object: any): Participation {
    let participation = {...object};
    participation.throwAddress = throwAdd;
    participation.participationId = partId;
    if (participation.state == 0) {
      participation.hiddenSeed = participation.seed;
    } else {
      participation.revealedSeed = participation.seed;
    }
    return participation;
  }

 
}
