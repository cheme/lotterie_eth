use parity_hash::{H256, Address};
use pwasm_ethereum;
use bigint::U256;
use bincode;
use pwasm_abi::eth::Bytes;
use core::mem;
// eth_abi is a procedural macros https://doc.rust-lang.org/book/first-edition/procedural-macros.html
use pwasm_abi_derive::eth_abi;
use alloc::Vec;

static ZERO_WORD: [u8;32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
static PARAMS_KEY: H256 = H256(
  [105,126,85,156,88,221,159,30,132,164,117,86,201,219,117,16,226,1,201,53,96,85,157,232,75,80,97,14,97,133,21,142]
);
static PHASE_PARAMS_KEY: H256 = H256(
  [174,161,160,188,227,3,129,249,91,249,191,4,222,1,207,230,242,103,130,138,252,71,107,240,87,202,132,66,35,67,74,43]
);

static WINNINGS_PARAMS_KEY: H256 = H256(
  [97,93,151,149,245,12,191,72,139,162,204,35,60,180,59,172,25,46,99,222,39,52,194,151,225,17,174,241,118,147,57,248]
);

// TODO remove (just for testing)
static WINNINGS_PARAMS_KEY_BIS: H256 = H256(
  [97,93,151,149,245,12,191,73,139,162,204,35,0,180,59,172,25,6,99,22,39,52,194,151,225,17,174,241,118,147,57,248]
);


#[derive(Serialize,Deserialize)]
#[repr(u8)]
pub enum WinningDistribution {
  Equal = 0
}

#[derive(Serialize,Deserialize)]
pub struct WinningParams {
  // Hard limit to 256 winners due to cost of accessing 256 position in linked storage
  nbWinners : u16,
  // Percentage, If not enough participant to reach this ratio of , round down but one if result 0
  nbWinnerMinRatio : u16,
  distribution : WinningDistribution,
}



#[eth_abi(ParamsEndpoint, ParamsClient)]
pub trait ParamsInterface {
  /// The constructor
  fn constructor(&mut self);

  #[constant]
  fn getWiningParamsCount(&mut self) -> U256;
  #[constant]
  //fn getWinningParams(&mut self, _index: U256) -> (u16, u16, u8);
  fn getWinningParams(&mut self, _index: U256) -> (u16, u16, u8);
  #[constant]
  fn getWinningParamsBis(&mut self, _index: U256) -> (u16, u16, u8);

/*
  fn addParams(&mut self,
    _winningParamsId: U256,
    _doSalt: bool,
    _authorDapp: Address,
    _minBidValue: U256,
    _biddingTreshold: U256,
    _maxParticipant: u64);
  fn addPhaseParams(&mut self,
    _participationStartTreshold: U256,
    _participationEndMode: u8,
    _participationEndValue: U256,
    _cashoutEndMode: u8,
    _cashoutEndValue: U256,
    _throwEndMode: u8,
    _throwEndValue: U256);
 
*/ 
/*  fn addWinningParams(&mut self,
    _nbWinners: u16,
    _nbWinnerMinRatio: u16,
    _distribution: u8);*/
  fn addWinningParams(&mut self,
    _nbWinners: u32,
    _nbWinnerMinRatio: u32,
    _distribution: u32);
  fn addWinningParamsBis(&mut self,
    _nbWinners: u32,
    _nbWinnerMinRatio: u32,
    _distribution: u32);


}

pub struct ParamsContract;

impl ParamsInterface for ParamsContract {
  fn constructor(&mut self) {
  }
 
  #[inline]
  fn getWiningParamsCount(&mut self) -> U256 {
    U256::from(pwasm_ethereum::read(&(WINNINGS_PARAMS_KEY)))
  }

  fn getWinningParams(&mut self, index: U256) -> (u16, u16, u8) {
  //fn getWinningParams(&mut self, index: U256) -> (u16, u16, u8) {
    // fix length array resolution (serialize to size 1), if not fix size, key becomes has of
    // wining paramskey and index then use read_from and write_into with stored 32 bit buffer
    let key = index + WINNINGS_PARAMS_KEY.into() + 1.into();
    let stored : [u8;32] = pwasm_ethereum::read(&H256::from(key));
    // TODO wrapper which revert on error!!
    let p : WinningParams = bincode::deserialize(&stored[..]).unwrap();
    (p.nbWinners,p.nbWinnerMinRatio, p.distribution as u8)
  }
  fn getWinningParamsBis(&mut self, index: U256) -> (u16, u16, u8) {
  //fn getWinningParams(&mut self, index: U256) -> (u16, u16, u8) {
    // fix length array resolution (serialize to size 1), if not fix size, key becomes has of
    // wining paramskey and index then use read_from and write_into with stored 32 bit buffer
    let key = index + WINNINGS_PARAMS_KEY_BIS.into() + 1.into();
    let stored : [u8;32] = pwasm_ethereum::read(&H256::from(key));
    // TODO wrapper which revert on error!!
    let nbWinners = read_u16(&stored[..2]);
    let nbWinnerMinRatio = read_u16(&stored[2..4]);
    let distribution = read_u8(&stored[5..6]);
    (nbWinners,nbWinnerMinRatio,distribution)
  }

  fn addWinningParams(&mut self,
    nbWinners: u32,
    nbWinnerMinRatio: u32,
    distribution: u32) {
    // Type cast before adding u16 and u8 into parity clinet
    let nbWinners = nbWinners as u16;
    let nbWinnerMinRatio = nbWinnerMinRatio as u16;
    let distribution = distribution as u8;
    let p = WinningParams {
      nbWinners,
      nbWinnerMinRatio,
      distribution : cast_winning_distribution(distribution)
    };

    let ser = bincode::serialize(&p).unwrap();
    // TODO test if revert in other condition
    // less than one word size
    assert!(ser.len() <= 32);
    let mut dest : [u8;32] = ZERO_WORD.clone(); 
    dest[..ser.len()].copy_from_slice(&ser[..]);

    // TODO fix array struct with length
    let ix = self.getWiningParamsCount();
    let key = ix + 1.into() + WINNINGS_PARAMS_KEY.into();
    pwasm_ethereum::write(&H256::from(WINNINGS_PARAMS_KEY), &H256::from(ix + 1.into()).0);
    pwasm_ethereum::write(&H256::from(key),&dest);

  }

  fn addWinningParamsBis(&mut self,
    nbWinners: u32,
    nbWinnerMinRatio: u32,
    distribution: u32) {
    // Type cast before adding u16 and u8 into parity clinet
    let nbWinners = nbWinners as u16;
    let nbWinnerMinRatio = nbWinnerMinRatio as u16;
    let distribution = distribution as u8;
    let p = WinningParams {
      nbWinners,
      nbWinnerMinRatio,
      distribution : cast_winning_distribution(distribution)
    };

    let mut dest : [u8;32] = ZERO_WORD.clone(); 
    put_u16(p.nbWinners, &mut dest[..2]);
    put_u16(p.nbWinnerMinRatio, &mut dest[2..4]);
    put_u8(p.distribution as u8, &mut dest[5..6]);

    // TODO fix array struct with length
    let ix = self.getWiningParamsCount();
    let key = ix + 1.into() + WINNINGS_PARAMS_KEY.into();
    pwasm_ethereum::write(&H256::from(WINNINGS_PARAMS_KEY), &H256::from(ix + 1.into()).0);
    pwasm_ethereum::write(&H256::from(key),&dest);

  }

}

#[inline]
fn cast_winning_distribution( src : u8) -> WinningDistribution {
  unsafe { mem::transmute(src) }
}

#[inline]
fn cast_64_8 ( src : &[u64;4]) -> &[u8;32] {
  unsafe { mem::transmute(src) }
}

#[inline]
fn cast_8_64 ( src : &[u64;4]) -> &[u8;32] {
  unsafe { mem::transmute(src) }
}

// should use byteorder crate just here for test purpose
// ort at least a stream like in derive
#[inline]
fn read_u16 ( src : &[u8]) -> u16 {
  let mut res = 0;
  res += src[1] as u16;
  res = res << 8;
  res += src[0] as u16;
  res
}
#[inline]
fn put_u16 ( src : u16, dest : &mut [u8]) {
  dest[1] = (src >> 8) as u8;
  dest[0] = src as u8; 
}
#[inline]
fn read_u8 ( src : &[u8]) -> u8 {
  src[0]
}
#[inline]
fn put_u8 ( src : u8, dest : &mut [u8]) {
  dest[0] = src as u8; 
}



#[test]
fn test_pr() {
  let test : u16 = 178;
  let mut arr = [0,0];
  put_u16(test, &mut arr);
  assert_eq!(test, read_u16(&arr));
}


#[test]
fn cast_test() {
  let zero = U256::from(ZERO_WORD);
  //let zero64 = cast_64_8(&zero.0);
  let zero64 = H256::from(zero).0;
  assert_eq!(zero, U256::from(0));
  let zero2 = U256::from(zero64);
  assert_eq!(zero2, U256::from(0));
  let un = zero + 1.into();
  let un64 : H256 = un.into();
  let un64 : [u8;32] = un64.0;
  assert_eq!(un, U256::from(1));
  let un2 = U256::from(un64);
  assert_eq!(un2,U256::from(1));

}
