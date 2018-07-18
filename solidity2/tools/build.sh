#!/bin/bash
compile_toinp () {
  rm -rf ./tmp
  solc --allow-paths . ./contracts/$1/$2.sol --bin -o tmp
  solc --allow-paths . ./contracts/$1/$2.sol --abi -o tmp
  mv ./tmp/$2.abi tools/inp
  mv ./tmp/$2.bin tools/inp
}
cd ..
compile_toinp . LotterieConf
compile_toinp hub Lotterie
compile_toinp throw/ether LotterieThrowEther
compile_toinp throw/20 LotterieThrow20
compile_toinp throw/223 LotterieThrow223

cd tools
npm run br
