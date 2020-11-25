const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');


describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain;
    })

    it('contains a `chian` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('can add new block to the chain', () => {
        const newdData = 'foo-data';
        blockchain.addBlock({ data: newdData });
        expect(blockchain.chain[blockchain.chain.length - 1].data)
            .toEqual(newdData);

    });

    describe('isChainValid()', () => {

        describe('when the chain does not starts with genesis block', () => {
            it('return false', () => {
                blockchain.chain[0] = { data: 'fake-genesis-data' };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the geneisis block and it has multiple blocks', () => {

            beforeEach(() => {
                blockchain.addBlock({ data: 'data1' });
                blockchain.addBlock({ data: '2ata2' });
                blockchain.addBlock({ data: 'd3ta3' });
            });

            describe('and the lasthash reference has changed', () => {
                it('return false', () => {
                    blockchain.chain[2].lasthash = 'broken lasthash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contians a block with invlid field', () => {
                it('return false', () => {
                    blockchain.chain[2].data = 'some bad and evil data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });


            describe('and the chain contain a block with jumped difficulty', () => {
                it('return false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lasthash = lastBlock.hash;
                    const nonce = 0;
                    const timeStamp = Date.now();
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timeStamp, lasthash, data, difficulty, nonce);
                    const badBlock = new Block({
                        timeStamp,
                        data,
                        nonce,
                        difficulty,
                        hash,
                        lasthash
                    });
                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                })
            })
            describe('and the chain does not conatian any invalid block', () => {
                it('return true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('repalceChain()', () => {

        describe('when the vhain is not longer', () => {
            it('does not replace the chain', () => {
                newChain.chain[0] = { new: 'chain' };
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain.chain);
            })
        });

        describe('when the new chain is longer', () => {
            //this beforeEach function runs before each of the below tests
            beforeEach(() => {
                newChain.addBlock({ data: 'data1' });
                newChain.addBlock({ data: '2ata2' });
                newChain.addBlock({ data: 'd3ta3' });
            });


            describe('and the chain is invalid', () => {
                it('does not replace the chain', () => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(originalChain.chain);
                });
            });

            describe('and the chain is valid', () => {
                it('replaces the chain', () => {
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain);
                })
            })
        })
    })

});