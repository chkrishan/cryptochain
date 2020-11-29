const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');


describe('Blockchain', () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        errorMock = jest.fn();
        originalChain = blockchain;
        global.console.error = errorMock;
    })

    it('contains a `chain` Array instance', () => {
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
        let logMock;
        beforeEach(() => {
            logMock = jest.fn();
            global.console.log = logMock;
        })

        describe('when the new chain is not longer', () => {

            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' };
                blockchain.replaceChain(newChain.chain);
            })

            it('does not replace the chain', () => {

                expect(blockchain.chain).toEqual(originalChain.chain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {
            //this beforeEach function runs before each of the below tests
            beforeEach(() => {
                newChain.addBlock({ data: 'data1' });
                newChain.addBlock({ data: '2ata2' });
                newChain.addBlock({ data: 'd3ta3' });
            });


            describe('and the chain is invalid', () => {

                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                })
                it('does not replace the chain', () => {

                    expect(blockchain.chain).toEqual(originalChain.chain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });


            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                })
                it('replaces the chain', () => {

                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                // it('logs about the chain replacement', () => {
                //     expect(logMock).toHaveBeenCalled();
                // })
            })
        })

        describe('and the validatetransaction flag is true', () => {
            it('calls validTransactionData', () => {
                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;

                newChain.addBlock({ data: 'foo' });
                blockchain.replaceChain(newChain, true)
                expect(validTransactionDataMock).toHaveBeenCalled();
            })
        })

    })


    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'foo-recipient', amount: 46 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('and the transaction data is valid', () => {
            it('return true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the trasaction data has multiple rewards', () => {
            it('return false and logs the error', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has atleat one malformed outputmap', () => {

            describe('and the transaction is not a reward transaction', () => {
                it('return false and logs the error', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(
                        blockchain.validTransactionData({ chain: newChain.chain })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction', () => {
                it('return false and logs the error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(
                        blockchain.validTransactionData({ chain: newChain.chain })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the transaction data has atleast one malformed input', () => {
            it('return false and logs the error', () => {

                wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    foorecipient: 100
                };

                const eviltransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                }

                newChain.addBlock({ data: [eviltransaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the block contain multiple identical transactions', () => {
            it('return false and logs the error', () => {
                newChain.addBlock({ data: [transaction, transaction, transaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    })

});