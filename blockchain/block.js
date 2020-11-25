const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');

class Block {

    //we put the args of contsructor in object that if we forgot the order when we are creating the block 
    //then this will not create the problem
    constructor({ timeStamp, lasthash, hash, data, nonce, difficulty }) {
        this.timeStamp = timeStamp;
        this.data = data;
        this.hash = hash;
        this.lasthash = lasthash;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {

        const genesisBlock = new Block(GENESIS_DATA);

        return genesisBlock;
    }

    static mineBlock({ lastBlock, data }) {
        let hash, timeStamp;
        const lasthash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timeStamp = Date(Date.now());
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timeStamp });
            hash = cryptoHash(timeStamp, lasthash, nonce, difficulty, data)

        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        //here we are checking  

        return new this({
            timeStamp,
            lasthash,
            data,
            nonce,
            difficulty,
            hash
        });
    }

    static adjustDifficulty({ originalBlock, timeStamp }) {
        const { difficulty } = originalBlock;
        if (difficulty < 1)
            return 1;
        const difference = timeStamp - originalBlock.timeStamp;
        if (difference > MINE_RATE) {
            return difficulty - 1;
        }

        return difficulty + 1;
    }
}

const block1 = new Block({
    data: 'foo-data',
    hash: 'foo-hash',
    lasthash: 'we22434ret',
    timeStamp: '09/11/2020'
});

//console.log("block1 : ", block1);
//Block.genesis();
module.exports = Block;