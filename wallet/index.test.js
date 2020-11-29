const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain/index');
const { STARTING_BALANCE } = require('../config');

describe('wallet', () => {
    let wallet;
    //before each test set the wallet instance to new wallet 
    beforeEach(() => {
        wallet = new Wallet();
    });

    //now here we will perform some test like 
    //1. wallets has required keys 
    //2. wallet has balance

    it('has a balance ', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a public key', () => {
        //console.log(wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing the data', () => {
        const data = 'foo-data';

        it('varifies the signature', () => {
            // to varifies signatures we create a generic fucntion in util class
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not varifies the invalid signature', () => {
            //here if we sign with new wallet signature or someone else signature
            //then it will return false
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    })


    describe('createTransaction()', () => {
        describe('and the amount exceeds the sender balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({
                    amount: 999999,
                    recipient: 'foo-recipient'
                })).toThrow('Amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {

            let transaction, amount, recipient;
            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            })

            it('create the instance of `Transaction` object', () => {
                expect(transaction instanceof Transaction).toBe(true)
            });

            it('matches the trandaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount of recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            })
        });


        describe('and the chain is passed', () => {
            it('calls `wallet.calculateBalance()`', () => {
                const calculateBalanceMock = jest.fn();
                const originalCalculateBalance = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            })
        })

    })


    describe('claculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE);
            });
        });


        describe('and there are ouputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });
                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });

                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            it('adds the sum of all ouput to the wallet balance', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(
                    STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                );
            });

            describe('and the wallet is made a trasaction', () => {

                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo-address',
                        amount: 40
                    });
                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('retuns the output amount of the recent transaction', () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });


                describe('and ther are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo-address',
                            amount: 50
                        });
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

                        blockchain.addBlock({ data: [sameBlockTransaction, recentTransaction] });

                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 50
                        });

                        blockchain.addBlock({ data: [nextBlockTransaction] });

                    });

                    it('includes the outputs amounts in the returned balance', () => {
                        expect(
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransaction.outputMap[wallet.publicKey] +
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    })
                })
            });
        })

    })

})