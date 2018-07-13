lotterie-eth contracts
======================

## Design

Global design is simple:
 - a central contract : Lotterie.sol is spawning throw contracts of three kinds :
 - LotterieThrowEther.sol : for ether
 - LotterieThrow223.sol : for erc 223 token
 - LotterieThrow20.sol : for erc 20 token
 - LotterieConf.sol : a lib (not that usefull)

The first implementation was even simplier (all on a single contract), but to reduce cost for participant (not for the thrower) the split is good.
A branch with every participation in a single contract could be try in the future to compare costs.

The contract makes use of [https://gist.github.com/GNSPS/ba7b88565c947cfd781d44cf469c2ddb](https://gist.github.com/GNSPS/ba7b88565c947cfd781d44cf469c2ddb) to reduce contract instantiation cost.

Some abstraction in :
 - LotteriePayment.sol : for throw abstract methods
 - LotterieIf.sol : the interface on the central lotterie contract
 - Some Erc interface used here and there : OpenZeppelin derived implementation is mostly use except for erc 223 (see the submodule).

The throw contracts are using a pretty artificial hierarchie :

LotterieParam.sol  : giving access to throw parameter
-> LotterieBase.sol : base structure def and storage (participation and winners).
   + LotterieLib.sol : lib meth inherited 
-> LotteriePhases : Lifecycle (phases) related methods
-> LotterieMargins : Margins management
   + LotteriePayment : Abstract methods (could move to lotterilib), related to payment
   + FromLotterie : keeping trace of main lotterie contract specifics (address, owner...). 
   + Thrower : thrower role (similar to owner except that in a throw context owner is the main contract owner)
-> LotterieThrow.sol : main operation implementation
-> LotterieThrow721.sol : 721 related operation
   + ERC721Receiver.sol : handle 721 transfer
-> the three different throw impls and their related erc interfaces (plus abstract methods implementations)

Same for central contract
LotterieParams.sol : parameters management (to add new throw configuration)
-> Lotterie.sol
   + Ownable : owner mgmt
   + Author : author role mgmt
   + LotterieIf : interface for being call from throw contracts

## Tooling

I use truffle (with old web3 version at the time of writting it), it got a few issues when building, many time its a good idea to delete build dir then truffle compile.

I also use npm to package a very basic building block js lib which uses web3 1.0 beta.

## Test

`truffle test`

Tests are pretty incomplete, but probably the best ressource to see how to use the contract.

There is a lot of parasite system log during test that should be cleaned in the future.

The npm lib do not provide tests, maybe when truffle includes an updated web3 dependency or when I stop to wait for it (running independant test).


