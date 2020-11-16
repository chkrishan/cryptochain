const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timeStamp = 2000;
    const lasthash = 'last-hash';
    const hash = 'hash';
    const data = 'data';
    const nonce = 1;
    const difficulty = 1;

    const block = new Block({ timeStamp, lasthash, hash, data, nonce, difficulty });

    it('has a timeStamp,lastHah,hash,data', () => {
        expect(block.timeStamp).toEqual(timeStamp);
        expect(block.lasthash).toEqual(lasthash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
        //console.log("genesis Block :", genesisBlock);

        it('return a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('return the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        })
    });

    describe('mineBlock()', () => {

        const lastBlock = Block.genesis();
        const data = 'mine data';
        const mineBlock = Block.mineBlock({ lastBlock, data });

        it('return a Block instance', () => {
            expect(mineBlock instanceof Block).toBe(true);
        });

        it('sets the `lasthash` to be the `hash` of the lastBlock', () => {
            expect(mineBlock.lasthash).toEqual(lastBlock.hash);
        });

        it('sets the data', () => {
            expect(mineBlock.data).toEqual(data);
        });

        it('SETS THE `timeStamp` ', () => {
            expect(mineBlock.timeStamp).not.toEqual(undefined);
        });

        it('creates the SHA256 hash based on the proper inputs', () => {
            expect(mineBlock.hash)
                .toEqual(cryptoHash(
                    mineBlock.timeStamp,
                    mineBlock.nonce,
                    mineBlock.difficulty,
                    lastBlock.hash,
                    data));
        });

        it('sets the `hash` that matches the difficulty criteria ', () => {
            expect(hexToBinary(mineBlock.hash).substring(0, mineBlock.difficulty))
                .toEqual('0'.repeat(mineBlock.difficulty));
        })


        it('adjust the difficulty', () => {
            const possibleResults = [lastBlock.difficulty - 1, lastBlock.difficulty + 1];

            expect(possibleResults.includes(mineBlock.difficulty)).toBe(true);
        })
    })


    describe('adjustDifficulty()', () => {
        it('lower the dificulty for a qucickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timeStamp: block.timeStamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('raises the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timeStamp: block.timeStamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({ originalBlock: block }))
                .toEqual(1);
        })

    })
})