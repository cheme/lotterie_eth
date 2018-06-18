import { EthComponentsModule } from './eth-components.module';
import { EthValue, EthUnits } from './eth-value';
import { Bignumber } from './bignumber';
describe('EthComponentsModule', () => {
  let ethComponentsModule: EthComponentsModule;

  beforeEach(() => {
    ethComponentsModule = new EthComponentsModule();
  });

  it('should create an instance', () => {
    expect(ethComponentsModule).toBeTruthy();
  });

  fdescribe('EthValue', () => {
    fit('should build same values', () => {
      let bigval = "123456789012345678901234567890";
      let bn = new Bignumber(bigval);
      let v1 = EthValue.fromString(bigval);
      let v2 = EthValue.fromBN(bn);
      expect(v1.unit).toBe(v2.unit); 
      expect(v1.count).toBe(v2.count); 
      let v3 = new EthValue(v1.count,v1.unit);
      expect(v3.fullrepr).toBe(bigval);// some rounding with bn (very bad)
      expect(v3.value).toBe(bn);// some rounding with bn (very bad)
    });
    fit('should should fail on invalid string', () => {
      let hexval = "0x12g3";
      expect(() => EthValue.fromString(hexval)).toThrow();
    });
    fit('right units', () => {
      expect(EthValue.fromString("0").unit).toBe("WEI");
      expect(EthValue.fromString("1").unit).toBe("WEI");
      expect(EthValue.fromString("123").unit).toBe("WEI");
      expect(EthValue.fromString("1000").unit).toBe("KWEI");
      expect(EthValue.fromString("751000").unit).toBe("KWEI");
      expect(EthValue.fromString("900000").unit).toBe("KWEI");
      expect(EthValue.fromString("1000000").unit).toBe("MWEI");
      expect(EthValue.fromString("991000000").unit).toBe("MWEI");
      expect(EthValue.fromString("1000000000").unit).toBe("GWEI");
      expect(EthValue.fromString("341000000000").unit).toBe("GWEI");
      expect(EthValue.fromString("1000000000000").unit).toBe("MICROE");
      expect(EthValue.fromString("941000000000000").unit).toBe("MICROE");
      expect(EthValue.fromString("1000000000000000").unit).toBe("MILLIE");
      expect(EthValue.fromString("891000000000000000").unit).toBe("MILLIE");
      expect(EthValue.fromString("1000000000000000000").unit).toBe("ETHER");
      expect(EthValue.fromString("1000000000000000000000").unit).toBe("KETHER");
      expect(EthValue.fromString("1000000000000000000000000").unit).toBe("METHER");
      expect(EthValue.fromString("1000000000000000000000000000").unit).toBe("GETHER");
      expect(EthValue.fromString("1000000000000000000000000000000").unit).toBe("TETHER");
    });
  });
});
