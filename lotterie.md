TODO block treshold change to time treshold

# lotterie

simple next to random on chain protocol

# Parameters

All those parameters are constant to define when we use contract from this librarie.

This struct (use of struct to pack values) is a const.

struct *LotterieParams*

TODO check if reward distribution algos are all in generated code in solidity and in wasm!!!
## algo

- doSalt : adding salt derive from block number on every reveal could be consider to costy in gas and disable. (we do not use a salt on last only because it will make gas cost prediction inaccurate). It should be on except in low reward cost use.

## participation

- minBidValue : in most case all user use the min value, but in some usage winners can have an incentive to bid more (example hall of fame usecase).
  TODO implement as u256 (for full range of values), than change as u8 unit and range of unit vals
- maxParticipant : u64, 0 for unlimited -> Same as number of votant strat treshold
- biddingTreshold : u256, 0 for unlimited

## Reward

- owner margin : *ownerMargin* a margin for address of owner, 0 to 2^32 : u32 (apply by mult total * margin then div by 2^32)
-> need rust test case for overflow control
- author margin : *authorMargin* a margin for another address : u32 
- thrower margin : *throwerMargin* a margin for another address : u32 
-> need assert on const to check both margin sum does not overflow
- Number of reward : *numWinners* (default=1) : u8
- Reward distribution mode : u8
  - even : winning = rewardBase / numWinners
  - constantRatio50 : unimplemented
  - constantRatio75
  - constantRatio25
  - TODO

- nbWinnerRatio : when the maxNbWinner is less or equal NbParticipant * nbWinnerRatio then nbWinner becams nbWinnerRatio * NbPaticipant (avoid not enouth participant).

### Issue

- first person to get its reward will have a higher cost for calculating the reward base (total - owner and author margin)


## End of periods 

### bid

- Number of votant start treshold : use maxParticipant instead
- Biding start treshold : use biddingTreshold instead
- Block start treshold : *participationStartTreshold* TODO check unit for block number, 0 for no start treshold


### Participation

- participationEndMode :
  - eagerAbsolute : when all participation occurs : can cashout
  - eagerRelative : when all participation occurs : can cashout
  - Absolute : when block end
  - Relative : end of bid period plus block end participation value
- Block end participation : participationEndTime  0 if unlimited (only if eager), absolute block value.

### cashout

- cashout max period : u32 : nb block to cashout after participation period, after this limit we run the n additionnal cashout and then we can restart : no infinite (but consider more than u32)
- additional cashout period : u32 : during this period previous winner can see their state changed to offperiod and others can cashout // TODO unimplemented for now (can be tricky and is wrong : need a counter of triggerable cashout state (each new period can be reinit to nb winner))
- additional cashout : u8 : nb of additional cashout : after that bid becomes round value
Note that cashout triggering period is absolute (calculated from blockEndParticipation)


# State


## StoredState

During each lotterie throw the contract manage a loterie state

struct LotterieThrow
- currentPhase : bidding = 0, participation = 1, cashout = 2
- rewardBase : calculated for first
- totalBidValue : TODO scenario where it is calculated and impacts
- totalClaimedValue : keep trace of claim value (easier to get round vals) TODO scenario where it is calculated and impacts TODO consider removing to (claiming round val could be as costy as possible)
- currentSeed
- blockStart : use to calculate block tresholds for periods
- numberOfBid : (use participant array size at least for wasm) : reduce size to u64
- numberOfRevealParticipation : TODO scenario where it is only calculated (only if block nb treshold (incompatible with eagermode))
- participant : array of 
  - throwId
  - from (address)
  - bid : Actually not use by contract (TODO might change so I keep this line), so only visible in event log
  - commitmentSeed (commitment of hiddenSeed (hash))
  - state : 0 has bid, 1 has revealed, 2 has checkedout, 3 checkout expired
  - bidNumber (position in array)


## CalculatedState 

- winnerPercent(rank)
- winnerReward(rank)
- authorReward
- throwerReward
- ownerReward
- roundValue (if currentPhase = 


## Events (logs)

- RevealSeed 
  - participant ix 
  - hiddenSeed (no need to access it : temporary to recalculate currentSeed)

# Steps

First user to transact on additional step will have a bit of more gas requirement for lazy step state switch...

If users all transact on same block (or multiple users on the first block), their gas cost will be a bit overevaluated.

-> in dapp for cost estimation use max user (or set number of user) and state changer cost. -> that is tricky

TODO validate it with code

TODO evaluate difference between first and others users.

## Init

A user, the thrower must send a transaction to reinit the state and restart a lotterie throw. He can get the round value (two methods : one which get it (costy) and one who do not).


## Bid

Users push their bid plus a commitment of their seed.
Bid value is consumed at this point.
The user pay gas and bid value.

### Do not do

We do not block sending a participation during bid step. (in fact we did due to reusable code TODO allow it with a function ? maybe a very unsafe one).

User may find it smart to send immediatly their participation so they do not have to schedule it, yet it would completly broke their chance to win :
because other user could place bid and check that they will not loose to existing revealed participation (depending on number of user it is easy to find a hiddenSeed to win), and if every next bidder do this checking (and that the last bidder is the only bidder of a block) your chance of winning are reduced : there is a reason why we add a costy transaction step instead of directly publishing our hiddenSeed.

## Participation

Users reveal their seed. The seed must match the commitment (a crypto hash function).
The user paid gas.
Any user knowning a seed matching the commitment can push it (with weak crypto hash it becames a processing game, not a lotterie), but he pay the gas instead of the user.
Users who does not participate can not win (state is checked before distance to random value)

### Calcul algorithm

First assert that for user : cryptohash (hiddenSeed) == commitmentSeed
Then update 
  currentSeed = sha (currentBlockNumber) xor hiddenSeed xor currentSeed
  and also number participation

## Cashout

Cashout can only occurs after participation step.

Method call to know current position in lotterie. If a user doesnot cashout before a certain block

# attack

## ddos when showing seed

You can ddos the seed. So the block for end of showing seed should be far enough.

## lasts participant stay hidden

You can chose to show you random seed at the last time and then lower the probability to mess, it is risky (no transact) and for big lotterie many votant could do the same and it end up with a miner decision.


## low biding to favorize high biding

When using multiple ticket, with large difference of value you can make this : validate high value first then influe with targeted combination of low value. Therefore (even if it is not that easy) a lotterie throw should not allow large difference in value.


To counter such behavior, another strategy will be to use low bidding to mess high bidding by commiting them in last block at low risk (miner is able to influe).

## last participant sell its participation :

If the last participant participe or not will change the winner, therefore he can sell its action to participate or note to the current winner (if not participating) or the new winner (if participationg).

To avoid it we let the participation transaction open to anyone with the hiddenSeed therefore this form of bidding could only be a zk one (zero knowledge), making it a bit less practical.

## collision on hiddenSeed

HiddenSeed is our criterion for winner (closest to currentSeed), therefore we can reuse HiddenSeed value to bid (on low value when changing value make sense), denying a user fair chance.

A first idea would be to forbid use of a hiddenSeed when it already exists. This solution will not be use as it makes placing a bid gas cost dependant on existing bid (need to check every bid to ensure unicity).

Instead we will add to user bidding info the number of its bid for this throw (so me manage a throw bid counter which is already use to check the end of period).


# Evolution

- multiple throw : throw state in a map by thrower -> TODO evaluate change of cost on all actions + contract deployment

- multiple config throw : parameters are not constant -> TODO evaluate change of cost on all actions + contract deployment

- on the dapp concurrent lotterie are sorted by author margin * total value (way to remunerate the author)

- hall of fame : a dapp for a lotterie to give publish space to winners (put margin all to author) with first positions being a ratio of bid value per time (newer winner even if low value will be first in long time) : probably some math to make it interesting.

- rounded withdrow : function to withdraw 

- sellable ownership : extend owner of openzepellin to redefine owner if owner of if proposal (owner can publish a proposal (address of transfer contract, last block to pay) and anyone can take ownership on this value (warn to remove lastblock val on change)) -> this scenario require the owner to publish a contract from which it will be claim (contract where when value is put it call change owner of other contract where the proposal address is matching) TODO look at DelayedOwnable TODO this contract could not be static as we need to be able to sell multiple times.

- currently it does not scale : we get throw info by knowing throw id or querying all throw : would be good to get all throws running : using log event.



# Usage of struct in solidity

This is terrible, my first idea was to use ABIEncoderV2. But it does not integrate with web3 yet and as an experimental feature a breaking change would kill my contract (contract willing to use mine would require to rewrite assembly code from my contract).

Therefore, using a serialize library and manually coding the serialization is my way to go.

Efficiency, the bytecode from ABIEncoderV2 that I read was far from looking really efficient, and using an explicit assembly code (using lib) seems better. Yet I need to expose functions doing serialization and deserialization.

At the end for those who played crypto zombie, it is fairly similar to the dna encoding.

TODO compare contract size with abi fork (remove serializing) + call to get a throw cost

## truffle use

It is really slow, I end up compiling with solc directly.

# comparing cost of function with modifier

My modifier is checking info and also updating state if first to swich phase status.
In fact a function in first line seems more suitable to avoid accessing throw twice.

Modifier bad cost : the throw is access as storage but could not be use in function where it is access again as storage
Function bad cost : the throw is access as memory and return to calling (I would like to use it as storage but could not), and in calling we do a store at end of function.

//1180634
926149
with function
//1180442
937568

Note the comparison is on a non modified throw (code of function do not write throw memory).

So modifier version might be fine (TODO redo test with a transaction estimate, ganache log are a bit unclear). // TODO web3 estimate for gas then send trans with this as gas


## gas compared

- activating abiv2 does generate lot of serialize code (last test from 43 ko constract to 49 on activation plus 500 o for an accessor function).
  TODO compare with lib for returning only
- bid for test
cumulativeGasUsed: 150873 // first init storage I guess (high first cost)
cumulativeGasUsed: 105873
cumulativeGasUsed: 105873
cumulativeGasUsed: 105809
cumulativeGasUsed: 105809
 after switching thrparams to memory (read only anyway)
cumulativeGasUsed: 152125
cumulativeGasUsed: 107125
cumulativeGasUsed: 107125
cumulativeGasUsed: 107061
cumulativeGasUsed: 107061

So clearly using memory for read only access is a bad idea (at least for a single variable access)

### at commit a61a9bcea0a6cbab196a18dfbbe211ad6ed7339e

c2 is second test

// init throw
cumulativeGasUsed: 204393
c2: 204393
// bid
cumulativeGasUsed: 150873
cumulativeGasUsed: 105873
cumulativeGasUsed: 105873
cumulativeGasUsed: 105809
cumulativeGasUsed: 105809
c2: 150873
c2: 105873
c2: 105873
c2: 105809
c2: 105809
// reveal participation
cumulativeGasUsed: 90470
cumulativeGasUsed: 63191
cumulativeGasUsed: 63191
cumulativeGasUsed: 64215
cumulativeGasUsed: 63191
c2: 90470
c2: 63191
c2: 63191
c2: 64215
c2: 63191
// cashout last (first cashout lot of init)
cumulativeGasUsed: 191643
c2: 206707
// cashout
cumulativeGasUsed: 128395
cumulativeGasUsed: 145301
cumulativeGasUsed: 145301
cumulativeGasUsed: 70810
c2: 113331
c2: 145301
c2: 145301
c2: 69961
// withdraw win
cumulativeGasUsed: 101954
cumulativeGasUsed: 78580
cumulativeGasUsed: 77281
cumulativeGasUsed: 75982
c2: 103189
c2: 78580
c2: 77281
c2: 74683
// empty for owner
cumulativeGasUsed: 42934 

Last empty without the phase update status (using getCurrentPhase but no store of phase Off) : 34616
Last empty with direct check of phase (phase switch force in previous tx) : 23855
prev phase switch : 41896

ctr dep ~ 5579495


