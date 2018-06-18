import * as bigInt from 'big-integer';

export class Bignumber {
    static zero = new Bignumber("0");
    static one = new Bignumber("1");
  private inner : any;
  constructor(i : string | number,inner? : any) {
      if (inner) {
        this.inner = inner;
      } else {
        this.inner = bigInt(i as any);
      }
  }
  toString() : string {
      return this.inner.toString();
  }
  div(d : Bignumber) : Bignumber {
      return new Bignumber(0,this.inner.divide(d.inner));
  }
  times(d : Bignumber) : Bignumber {
      return new Bignumber(0,this.inner.multiply(d.inner));
  }
  plus(d : Bignumber) : Bignumber {
      return new Bignumber(0,this.inner.add(d.inner));
  }
  minus(d : Bignumber) : Bignumber {
      return new Bignumber(0,this.inner.minus(d.inner));
  }

  toNumber() : number {
      return this.inner.toJSNumber();
  }
  isGreaterThan(d : Bignumber) : boolean {
      return this.inner.greater(d.inner);
  }
  isLessThan(d : Bignumber) : boolean {
      return this.inner.lesser(d.inner);
  }


}
