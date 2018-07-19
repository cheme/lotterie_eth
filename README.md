
lotterie-eth
============

A toy contract to run some lotterie (pseudo-random choice of a winner) on ethereum.

Warning there is probably multiple ways to mess with those contracts (the more obvious one being the miner selecting the transactions in order to win).

In 'solidity2' is the contracts and a small npm lib.

In 'lotterie-hub' is an angular Dapp (me trying angular, not really a good web app, probably a lot of leaking subscribtion, very inconsistent, still a basic sample interface).

In 'pwasm', some initial testing of parity wasm contract, totally incomplete and unmaintained.

Note also that switch between phase is done at the first action of the phase to have a more determinist behavior in term of contract cost.

Status
------

The currently deployed contract on ropsten is at '0xAB6967bA23b49F19B5ED694b2aCaEA9283C81A98'.

Access to the Dapp could be done through [boot_site_torrent](https://cheme.github.io/boot_site_torrent/?4b50d817b7c058db153766ecb10efd9ad5d23a5a977843debe28b6087b09b9f9&magnet:?xt=urn:btih:0ff7df91d3c4166d33a3d9a5082eee56c40ae15e&dn=lhub0.0.1.zip&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com) (the environment is configured to point on prev ropsten address). But it is likely to have no seed, but you should simply build the angular dapp and use it from localhost.

I do not plan to deploy it on mainnet as it could be a liability (legally speaking), if I see that someone did deploy it I may publish the contract address (tools like etherscan for finding similarity in contract can be use).

Please note that after a long period the owner of the contract can have access to lost founds or token : so if the contract start to be use you should probably chose one where the owner is well known.

There is 4 kind of margin so you can use my addresses for dapp or contract author. One of my addresses is 0x8d52c034ac92c8ea552a68044ce73c7a8058c8ad, if the host environment of this readme is not hacked :)

Currently it needs some solid testing, and you are more than welcome for experimenting on ropsten .

The angular Dapp is also not something I really enjoy doing, and any PR are really welcome (a lot of obvious validation are missing : I focused on the usage from a participant point of view, I think that initiating a throw should be done with web3.js after having read the contract).
I am also thinking about trying that a webgl visualization of the throw current seed value would be very nice.

Overview
--------

The main contract is a hub for instantiating Throw contracts.

The design is mainly done for cost reason for targetting large number of votant (still it does not have constant cost for withdrawing winning prizes  so I put a limit to 255 winners and advise to put as less as possible winners).
The design try to reduce participant cost on individual operations TODO blog post link.

Throw contracts are a single occurance of a lotterie process, it is done in several phases:

### Construct

A technical phase to finish contract instantiation : for instance when using an initial amount of token (223 or 20) as a prize it is done in this step through the throw detail screen. Similarily if we want to put ERC721 as prize it is done during this phase.

If you are launching a simple ether lotterie or a token lotterie without an initial bidding prize, this phase is skipped.

### Bidding

The pariticipants chose to participate, they can put any bid (ether or token depending of the type of the throw) and they also publish a commitment (simple hash) of their seed.
The bid could be any value as long as it is above the minimum bid value.

Here there is an issue : if the next phase triggers on the number of participant or the totalbidvalue, your transaction could possibly be rejected (and some gas lost). I should implement an optional configuration to allow any number of participant while we are still on the last block.

Note that bidding ERC20 is done in two transactions (a first that allow the contract to withdraw and a second for the throw to start), thus the good point for using a ERC223.

### Participation

The participant reveal their seed value (the seed value hash must match the previously published commitment).

From those value and possibly some block related salt value the throw seed value is updated (simple xor).

At the end of this phase the throw seed value is the final throw seed value and the winner is the participant that got the seed that is the closest with this final throw seed.

Note that it is difficult to cheat (when using multiple participation you can wait till the last moment and not reveal some participation (but as long as another votant vote in the last block you would need help from the miner so it is really not that easy), other strategies should be describe here TODO link to blog). If you want to discuss it you are very welcome to open an issue on the project.

### Register win

This phase is a bit redundant with the next one and is here to lower the cost and allowing to scale to big number of participant (we never check with a transaction the order of every participant).

Any participant that see that their seed is in the n closest seed to the final throw seed value, should register as a winner.

Other participant can also try to register as a winner if they believe that for any reason some of the winners will miss the registration.

Note that the cost depending on the number of winners is not realy constant so it could be a good idea to put a bigger gas margin than what is proposed. Also this cost is highest than in the two previous phase but the operation is only for winners.


### Withdraw win

Here registered winners that are still in the nth winners position, just withdrow their prizes.
We could not withdraw in previous phase because the contract would have to check every users scores (and it does not scale).

### End of life

After a fix period (rather long if the throw is correctly configured), the contract die and the owner can get a hold of everything that was not withdrawned.

This is to avoid locked token or ether, the big issue is if the owner is not here anymore (it is possible to switch owner but if owner key is lost it is ko).

Configuration
-------------

Configuring is done :
- in angular : a local storage store is use and a menu to edit it (there is the contract address information, so that is the place to switch the main lotterie contract).
- when starting a lotterie throw by referencing existing configuration stored in the main contract (the main contract allow to create new configuration but you can reuse some if you know what you are doing (main point should be to avoid reusing phase param with absolute date as that is very likely to not be what you wanted)) :

### Lotterie params
 - address authorDapp : the dapp author address, it is up to the dapp author to ensure that new throw contract build through his dapp uses the right address. It could be use to define other kind of margins. Note that there is no way to ensure that the right address is use by the thrower.
 -  uint winningParamsId : the id of the wining params to use (see next section).
 -  uint minBidValue : the minimum bid for participating. Min bid at 0 makes sense for case where there is already something to win (an initial bid value or some erc721).
 -  uint biddingTreshold : if not 0, it defines a treshold that will block any new bidding, and trigger a switch to the next phase. It is a maximum sum of bidding value (initial biding is use in this sum).
 -  uint64 maxParticipant : if not 0, it defines a treshould that will block any new bidding and trigger a switch to the next phase. It is a maximum number of participant.
 -  bool doSalt : if false the calculation of the throw final seed does not include block related salt information and only is calculated by doing xor operation with all revealed participant seed. It is a bit less costy but I do not think it is a good idea to deactivate salt; maybe to be closer to a game than a random throw (making it fun to try to 'cheat').
 
### Winning params
 - uint16 nbWinners : the number of winners for the throw. Having many winners involve additional cost for registering a win and for withdrawing a win. Technically for the nth position you have to iterate on a linked list structure which is quite costy (the number 1 winners is not impacted). To make it clear that low number of winners is better, we use uint16 type and there is a hard limit at 254 winners.
 - uint16 nbWinnerMinRatio : a value from 0 to 100 that is a maximal percentage of winners : for instance if 50% and and 5 winners and there is only 6 Participant, we do not have 5 winners but 50% of 6 participant equal 3 winners. If we would have 12 participant we would have 5 winners because 12 * 50% = 6 is bigger than 5.
 - WinningDistribution distribution : an enum for the kind of distribution between winners. Currently the only possible value is 0 and is an even distribution (every winners win the same thing : winning prize = (total bid amount - margins) / nbwinners.

 
### Phase params
Note that absolute dates are a bit awkward because the configuration will certainly be usable only once.

 -  CashoutEndMode participationStartMode : Absolute (0) or Relative (1) : if absolute the treshold defines a fix date in time (unix time in secs from 1970), if relative it is a date calculated from the moment of the previous phase switch plus a duration in secs.
 -  uint participationStartTreshold : value defining at which time participation phase start (bidding phase ends). Please note that if a treshold from lotterie params is reached before, the phase switch earlier.
 -  ParticipationEndModes participationEndMode : mode for switching from participation phase to cashout phase (win registering phase). AbsoluteEager(0), RelativeEager(1), Absolute(2), Relative(3), similar to previous mode defs, but with Eager variant where we can switch to cashout before the date if every participation are revealed (every previously bid chose to participate and reveal their hidden seed).
 -  uint participationEndValue : same as start treshold (absolute time in secs or relative from last phase switch)
 -  CashoutEndMode cashoutEndMode : Absolute(0) or Relative(1), mode to switch to withdraw phase
 -  uint cashoutEndValue : same as for previous phase, but to define the cashout (win registration) phase duration.
 -  CashoutEndMode throwEndMode : final switch mode, indicates the end of the throw (end of the phase for withdrawing win for users). From that point the throw is in Off state and values (token and ether) could be withdrawned by the contract owner to solve some possible issue, or if the contract owner is an evil person to remunerate the owner. There is a hard limit of 4 weeks (may be to short in certain case for absolute defs).
 -  uint throwEndValue : the duration up to the end of the contract. There is a hard limit of 10 weeks (in relative it seems ok but in absolute it may be a bit short depending on the usecases).

Globally there is also a 57 weeks hard limit on construct phase. Also phase switch are really done on the first action, but be aware that if you are the only winner and you wish to use this behaviour to postpone a withdraw (relative next phase end date is calculated from the actual phase switch writing), it is a wrong idea because any user can pay for the phase switch without doing an actual action (there is a public method for that).


### Throw related info

Aka init throw methods parameter (there is 3 different initThrow fn depending on erc20, 223 or ether usage).

  - lotterie params id (quite obvious)
  - Phase params id (same a pointer to the conf to use to initiate my throw
  - uint16 nb721 : if you want to attach erc721 as winning prize (only possible with one erc21 for the first winner, another for the second winner... until nb721 is reached), define the number of prize with this parameters. If this value is more than zero, the construct phase will require additional actions (adding those erc721 (one tx per items)).
  - address token : for erc20 or 223 it is the address of the erc contract.
  - bool waitValue : for erc20 or 223 the value is send in a second phase (in construct state), so putting this to true makes the throw delay until we send some token (there is a way to force start if we change our mind). For ether the initialBidValue is simply the number of ether send in the transaction.
  - uint32 ownerMargin : margin for owner of the hub contract
    uint32 authorContractMargin : margin for the author of the contract (author address set in hub when deploying the hub contract)
  - uint32 authorDappMargin : margin for the dapp author, the dapp author is defined in the associated lotterie param
  - uint32 throwerMargin : margin for the initiator of the throw, it is the account with which we called initThrow on the hub (the traditional 'owner' of the throw contract renamed to 'thrower' because 'owner' is already the 'owner' of the hub).

Warning, all those uint32 values represents a percentage of the totalbid sum (init bid value included), and the percentage is not a number from 0 to 100 but a number from 0 to max(uint32), so we get a good precision. So in the case of a throw were the user mainly bid for the ERC721 prizes, it makes sense give 100% to the thrower : in this case the value to use is not 100 but (2^32 - 1).

Please not that there is no minimal margin value so by default it should be some 0 margin throw. It is up to the participant to favor throw with responsible author and thrower margins (or not).
 
