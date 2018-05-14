#!/bin/bash
curl --data '{"jsonrpc":"2.0","method": "eth_getTransactionReceipt", "params": ["0x793ed7081e22976f5d13a71c51db59a8ba506b0a50e445b076afa13bfc18307d"], "id": 1}' -H "Content-Type: application/json" -X POST localhost:8545
#curl --data '{"jsonrpc":"2.0","method": "eth_getTransactionByHash", "params": ["0x793ed7081e22976f5d13a71c51db59a8ba506b0a50e445b076afa13bfc18307d"], "id": 1}' -H "Content-Type: application/json" -X POST localhost:8545
curl --data '{"jsonrpc":"2.0","method": "eth_getStorageAt", "params": ["0xeDFC9c2F4Cfa7495c1A95CfE1cB856F5980D5e18","0x2","latest"], "id": 1}' -H "Content-Type: application/json" -X POST localhost:8545
curl --data '{"jsonrpc":"2.0","method": "eth_getCode", "params": ["0xeDFC9c2F4Cfa7495c1A95CfE1cB856F5980D5e18","0x0"], "id": 1}' -H "Content-Type: application/json" -X POST localhost:8545
curl --data '{"jsonrpc":"2.0","method": "eth_getCode", "params": ["0xeDFC9c2F4Cfa7495c1A95CfE1cB856F5980D5e18","0x1"], "id": 1}' -H "Content-Type: application/json" -X POST localhost:8545
