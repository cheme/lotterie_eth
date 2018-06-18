import { Bignumber } from "./bignumber";

export const EthUnits = Object.freeze({
    WEI : {id : "wei", mult: new Bignumber("1")},
    KWEI : {id : "kwei", mult: new Bignumber("1000")},
    MWEI : {id : "mwei", mult: new Bignumber("1000000")},
    GWEI : {id : "gwei", mult: new Bignumber("1000000000")},
    MICROE : {id : "micro", mult: new Bignumber("1000000000000")},
    MILLIE : {id : "milli", mult: new Bignumber("1000000000000000")},
    ETHER : {id : "ether", mult: new Bignumber("1000000000000000000")},
    KETHER : {id : "kether", mult: new Bignumber("1000000000000000000000")},
    METHER : {id : "mether", mult: new Bignumber("1000000000000000000000000")},
    GETHER : {id : "gether", mult: new Bignumber("1000000000000000000000000000")},
    TETHER : {id : "tether", mult: new Bignumber("1000000000000000000000000000000")},
});

const zeroBN = new Bignumber(0);
const zeroString = "0";

export class EthValue {
    static zeroValue = new EthValue(0,'WEI');
    unit : string;
    count : number;
    _value : Bignumber;
    get value() : Bignumber {
        return this._value;
    }
    set value(v : Bignumber) {
       EthValue.changeBN(this,v);
    }
    fullrepr : string;
    static empty() : EthValue {
        return Object.create(EthValue.zeroValue);
    }
    constructor(c : number, un : string, adjust?: boolean) {
      this._value = EthUnits[un].mult.times(new Bignumber(c));
//      this.fullrepr = this.value.toFixed(0);
      this.fullrepr = this._value.toString();
      if (adjust) {
        this.unit = EthValue.closestUnit(this._value);
        this.count = parseInt(this._value.div(EthUnits[this.unit].mult).toString());
        //this.count = this.value.div(EthUnits[this.unit].mult).toNumber();
      } else {
        this.unit = un;
        this.count = c;
      }
    }

    static fromString(st : string) : EthValue {
      var ret = EthValue.empty();
      ret._value = new Bignumber(st);
      ret.unit = EthValue.closestUnit(ret._value);
      ret.fullrepr = st;
      ret.count = ret._value.div(EthUnits[ret.unit].mult).toNumber();
      return ret;
    }

    static fromBN(st : Bignumber) : EthValue {
      var ret = EthValue.empty();
      EthValue.changeBN(ret,st);
      return ret;
    }
    static changeBN(ret : EthValue, st : Bignumber) {
      ret._value = st;
      ret.unit = EthValue.closestUnit(ret._value);
      //this.fullrepr = this.value.toFixed(0);
      ret.fullrepr = ret._value.toString();
      ret.count = ret._value.div(EthUnits[ret.unit].mult).toNumber();
    }

    public toString() : string {
        return this.count.toString() + " " + EthUnits[this.unit].id;
    }

    static closestUnit(val : Bignumber) : string {
        let ret = "WEI";
        for (let uix in EthUnits) {
            if (EthUnits[uix].mult.isGreaterThan(val)) {
                return ret;
            }
            ret = uix;
        }
        return ret;
    }
}


