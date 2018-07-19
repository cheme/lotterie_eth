lotterie-eth contracts
======================

## Design

Global design is simple:
 - a central contract : Lotterie.sol is spawning throw contracts of three kinds :
 - LotterieThrowEther.sol : for ether
 - LotterieThrow223.sol : for erc 223 token
 - LotterieThrow20.sol : for erc 20 token
 - LotterieConf.sol : a lib (not that usefull)
 - ThrowLib.sol : lib to reduce size of phase code (contract code size reduction)

The first implementation was even simplier (all on a single contract), but to reduce cost for participant (not for the thrower) the split is good. It explains why we still have an internal Throw struct in every Throw, it should be remove in future version.

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

### Thought on miners tampering

Obviously the biggest weakness of this system is the possibility for the miner of the last block for the participation revealing to chose which transaction to include.
So a big mining pool just need to check results with every combination until one of its participation does win.

So if that kind of contract start to be a thing, there is high probability that miners pool could let users subcontract in order to favorize their user participation. At the end users should subcontract with every mining pools and the system end up being a bet on the wining pool. This is not viable as pools will margin on it, still this kind of rule shift can be interesting.

There should be some way to try to mitigate it (for instance trying to add some incertainty in the end of revealed block : difficult because miners are the first to see the possible resulting state : on a determinist chain it seems impossible).

Yet, when looking at the size of the address space, the impact of a miners might not be as bad as it seems : doing some math could be a good idea here. It would be interesting to be able to put a number on the miner advantage (100% he dos all participation revealed but in this case he need to be the miner of all blocks for the phase).

There is a lot of other things that could go wrong due to miners, starting with DOSing winning registration.

So as for most of blockchain application centralization of miners is an issue.

Also note that the miner case is the easiest to see but we can also consider pools of participant subcontracting in order to increase their winning probability (the race at the last blocks is way more uncomfortable here).
Participant subcontracting is probably a more realistic attack model.


## Tooling

I use truffle (with old web3 version at the time of writting it), it got a few issues when building, many time its a good idea to delete build dir then truffle compile.

I also use npm to package a very basic building block js lib which uses web3 1.0 beta.

## Test

`truffle test`

Tests are pretty incomplete, but probably the best ressource to see how to use the contract.

There is a lot of parasite system log during test that should be cleaned in the future.

The npm lib do not provide tests, maybe when truffle includes an updated web3 dependency or when I stop to wait for it (running independant test).

## Issue

The proxy code deployed (to avoid big costy contract instantiation) involves assembly : cf [https://gist.github.com/GNSPS/ba7b88565c947cfd781d44cf469c2ddb](https://gist.github.com/GNSPS/ba7b88565c947cfd781d44cf469c2ddb)

The contract do too much things and is too big, plus espacially not great to audit linked list structure.

ThrowLib is extra awkward, just here to reduce size of contracts, there is a lot of storage pointer in parameter and an overall bad looking code organisation (all end up in the library file).


A possible refactor will be to use fallback to delegate to other contract (we have already written all throw logic for a delegate call due to proxy), but it will need to be able to link with the contract (I do not want to use a storage address for it): some testing will be needed before moving to such design (could fallback multiple time for very big contract). Also to test how to call parent contract that way (bidirect link needed here).

