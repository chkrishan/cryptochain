const Block = require('./block');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
class Blockchain {

    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({

            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error("the incoming chain must be longer");
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error("the incoming chain is not valid ");
        }

        if (validateTransactions && !this.validTransactionData({ chain })) {
            console.error("The incoming chain has invalid data");
            return;
        }

        if (onSuccess) {
            onSuccess();
        }
        this.chain = chain;

    }


    validTransactionData({ chain }) {

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            let rewardTransactionCount = 0;
            const transactionSet = new Set();

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {

                    rewardTransactionCount++;
                    if (rewardTransactionCount > 1) {
                        console.error("miner reward exceed limit");
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error("miner reward amount is invalid");
                        return false;
                    }

                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error("invalid transaction");
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        //here we are passing this.chain not the chain coming in arguments bcoz
                        // we will calculate balance according to original blockchain history and we will 
                        //not follow the fake data passed by a hacker
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error("invalid input amount");
                        return false;
                    }

                    if (transactionSet.has(transaction)) {
                        console.error("An identical transaction appears more than one in the block");
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }
                }
            }

        }

        return true;
    }


    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        //console.log(chain.length);
        for (let i = 1; i < chain.length; i++) {
            // console.log(chain[i]);
            const { timeStamp, lasthash, hash, data, nonce, difficulty } = chain[i];
            const actualLastHash = chain[i - 1].hash;
            const lastDifficulty = chain[i - 1].difficulty;
            if (actualLastHash !== lasthash) return false;

            const validatedHash = cryptoHash(timeStamp, lasthash, data, nonce, difficulty);
            if (validatedHash !== hash) return false;
            //with this check noone can temper with difficulty
            if (Math.abs(lastDifficulty - difficulty) > 1) return false;
        }

        return true;
    }


}

const newChain = new Blockchain();

newChain.addBlock({ data: 'data1' });
newChain.addBlock({ data: 'data2' });
newChain.addBlock({ data: 'data3' });
newChain.addBlock({ data: 'data4' });

//console.log(newChain);
//console.log(Date(Date.now()));

module.exports = Blockchain;