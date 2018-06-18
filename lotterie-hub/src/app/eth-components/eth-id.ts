import { throwError } from "rxjs";
import { Bignumber } from "./bignumber";

// encapsulate an ethid as full string
// no leading 0
// TODO new Uint8Array for internal storage
export class EthId {
   private inner : string;
   private val : Bignumber;
   constructor(s : string) {
     var ok = s.length > 0;
   /*  for (let i = 0; i < s.length; ++i) {
        if (s[i] > '9' || s[i] < '0') {
            ok = false;
        }
     }
     if (!ok) {
      throw("Invalid id : " + s);
     }*/
     // no leading 0
     var st = 0;
     for (; st + 1 < s.length && s[st] == '0'; ++st) { }
     this.inner = s.substring(st);
     this.val = new Bignumber(this.inner);
   }
   static fromBN(s : Bignumber) : EthId {
     let res = new EthId("0");
     res.val = s;
     res.inner = s.toString();
     return res;
   }
   toString() : string {
     return this.inner;
   }
}
