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
export const UTokenUnits = Object.freeze({
    UTOKEN1 : {id : "utoken", mult: new Bignumber("1")},
    UTOKEN3 : {id : "10^3 utoken", mult: new Bignumber("1000")},
    UTOKEN6 : {id : "10^6 utoken", mult: new Bignumber("1000000")},
    UTOKEN9 : {id : "10^9 utoken", mult: new Bignumber("1000000000")},
    UTOKEN12 : {id : "10^12 utoken", mult: new Bignumber("1000000000000")},
    UTOKEN15 : {id : "10^15 utoken", mult: new Bignumber("1000000000000000")},
    UTOKEN18 : {id : "10^18 utoken", mult: new Bignumber("1000000000000000000")},
    UTOKEN21 : {id : "10^21 utoken", mult: new Bignumber("1000000000000000000000")},
    UTOKEN24 : {id : "10^24 utoken", mult: new Bignumber("1000000000000000000000000")},
    UTOKEN27 : {id : "10^27 utoken", mult: new Bignumber("1000000000000000000000000000")},
    UTOKEN30 : {id : "10^30 utoken", mult: new Bignumber("1000000000000000000000000000000")},
});
const zeroBN = new Bignumber(0);
const zeroString = "0";

export class EthValue {
    units : any = EthUnits;
  setTokenInfos(name: string, symbol: string, decs: number) {
      // TODO run as undefined token
      this.units = EthValue.buildUnit(name,decs);
      this.unit = EthValue.closestUnit(this._value,this.units);
      this.count = parseInt(this._value.div(this.units[this.unit].mult).toString());
  }
  undefinedToken(): any {
      this.units = UTokenUnits;
      this.unit = EthValue.closestUnit(this._value,this.units);
      this.count = parseInt(this._value.div(this.units[this.unit].mult).toString());
  }
  static buildUnit(name: string, decs: number) : any {
      var result = {};
      const ntoken : string = "NTOKEN";
      var initdecs = decs;
      if (decs % 3 != 0) {
          result[ntoken + '0'] = {id : "10^-" + decs + " " + name, mult: new Bignumber("1")};
          decs = 3 * Math.floor(decs / 3);
      }
      var mult = '1';
      for (var i = 0; i < (initdecs - decs); ++i) {
          mult += '0';
      }
      var j = 1;
      for (var i = -1 * decs; i < (32 - decs); i += 3) {
          result[ntoken + j] = {id : "10^" + i + " " + name, mult: new Bignumber(mult)};
          mult += "000";
          j += 1;
      }

      return result;
  }
    static zeroValue = new EthValue(EthUnits,0,'WEI');
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
    constructor(units: any, c : number, un : string, adjust?: boolean) {
      this.units = units;
      this._value = this.units[un].mult.times(new Bignumber(c));
//      this.fullrepr = this.value.toFixed(0);
      this.fullrepr = this._value.toString();
      if (adjust) {
        this.unit = EthValue.closestUnit(this._value,this.units);
        this.count = parseInt(this._value.div(this.units[this.unit].mult).toString());
        //this.count = this.value.div(EthUnits[this.unit].mult).toNumber();
      } else {
        this.unit = un;
        this.count = c;
      }
    }

    static fromString(st : string) : EthValue {
      var ret = EthValue.empty();
      ret._value = new Bignumber(st);
      ret.unit = EthValue.closestUnit(ret._value,EthUnits);
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
      ret.unit = EthValue.closestUnit(ret._value,ret.units);
      //this.fullrepr = this.value.toFixed(0);
      ret.fullrepr = ret._value.toString();
      ret.count = ret._value.div(ret.units[ret.unit].mult).toNumber();
    }

    public toString() : string {
        return this.count.toString() + " " + this.units[this.unit].id;
    }

    static closestUnit(val : Bignumber, units : any) : string {
        let ret = Object.keys(units)[0];
        for (let uix in units) {
            if (units[uix].mult.isGreaterThan(val)) {
                return ret;
            }
            ret = uix;
        }
        return ret;
    }
}


