
lotterie-eth
============

A toy contract to run some lotterie (pseudo-random choice of a winner) on ethereum.

In 'solidity2' is the contracts and a small npm lib.

In 'lotterie-hub' is an angular Dapp (me trying angular, not really a good web app, still a basic sample interface).

In 'pwasm', some initial testing of parity wasm contract, totally incomplete and unmaintained.

Status
------

I am going to deploy the Dapp on kovan, the address of the main hub is : TODO

Access to the Dapp could be done through [boot_site_torrent](https://cheme.github.io/boot_site_torrent/?8172f5d05cd813bdcc52377aa1cd8595b8456485d048fd9f8bcae0f7cc3ac72e&magnet:?xt=urn:btih:0636580de3f886de7a563d724ac9b80b20e8c1b0&dn=dist.zip&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com) (the environment is configured to point on prev kovan address). But it is likely to have no seed, but you should simply build the angular dapp and use it from localhost.

I do not plan to deploy it on mainnet as it could be a liability (legally speaking), if I see that someone did deploy it I may publish the contract address (tools like etherscan for finding similarity in contract can be use).

Please note that after a long period the owner of the contract can have access to lost founds or token : so if the contract start to be use you should probably chose one where the owner is well known.

There is 4 kind of margin so you can use my addresses for dapp or contract author. My addresse is TODO, if the host environment is not hacked :)

Currently it needs some solid testing, and you are more than welcome for experimenting on kovan.

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

### Winning params

### Phase params

### Throw related info
