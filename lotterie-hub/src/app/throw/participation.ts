import { LotterieService } from "../ethereum/lotterie.service";

export class Participation {
  public static stateLabel(stateid : number, lotterieService : LotterieService) : string {
    let i = 0;
    for (let k in lotterieService.participationStates) {
      if (i === stateid) {
        return k;
      } 
      ++i;
    }
    return "error getting label for phase : " + stateid;
  } 
 
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
    participation.state = parseInt(participation.state);
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
