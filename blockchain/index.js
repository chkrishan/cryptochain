const Block = require('./block');
const { cryptoHash } = require('../util');
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

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error("the incoming chain must br longer");
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error("the incoming chain is not valid ");
        }


        this.chain = chain;

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