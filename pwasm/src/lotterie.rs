use parity_hash::{H256, Address};
use pwasm_ethereum;
use bigint::U256;

// eth_abi is a procedural macros https://doc.rust-lang.org/book/first-edition/procedural-macros.html
use pwasm_abi_derive::eth_abi;
use alloc::Vec;

static TOTAL_SUPPLY_KEY: H256 = H256([2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
static OWNER_KEY: H256 = H256([3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);

#[eth_abi(LotterieEndpoint, LotterieClient)]
pub trait LotterieInterface {
  /// The constructor
  fn constructor(&mut self, _author_contract: Address);
}

pub struct LotterieContract;

impl LotterieInterface for LotterieContract {
  fn constructor(&mut self, _author_contract: Address) {
    // TODO ownable constructor
    // TODO author constructor
  }
}
