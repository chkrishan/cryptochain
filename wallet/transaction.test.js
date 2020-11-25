const Wallet = require('.');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;

        transaction = new Transaction({ senderWallet, recipient, amount });

    });

    it('has a `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the `recipient`', () => {
            expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(senderWallet.balance - amount);
        });
    })

    describe(' `input` ', () => {
        it('has an input', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the `amount` to sender wallet balance', () => {

            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the `senderWalet` publicKey ', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('sign the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true);
        })
    });

    describe('validTransaction()', () => {
        let errorMock;


        beforeEach(() => {
            errorMock = jest.fn();
            global.console.error = errorMock;
        });

        describe('when the transaction is valid ', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction))
                    .toBe(true);
            });
        });

        describe('when the transaction is invalid ', () => {

            describe('and the transaction outputMap value is invalid(changed)', () => {
                it('returns false and logs error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 999999;
                    //console.log(transaction);
                    expect(Transaction.validTransaction(transaction))
                        .toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction input signature is invalid(changed)', () => {
                it('returns false and logs error', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction))
                        .toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

        });


    })


    describe('output()', () => {

        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;


        describe('and the amount is inavalid', () => {
            it('throws the error', () => {

                expect(() => {
                    transaction.update({ senderWallet, recipient: 'foo', amount: 99999 })
                        .toThrow('Amount exceeds balance');
                })
            })
        })


        describe('and the amount is valid', () => {

            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;

                transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount });
            })

            it('outputs the amount to the next recipient,', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('substract the amount from the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput - nextAmount);
            });

            it('maintains the total output that mathes the input amount', () => {
                expect(
                    Object.values(transaction.outputMap)
                    .reduce((total, outputAmount) => total + outputAmount)
                ).toEqual(transaction.input.amount);
            });

            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });


            describe('and another update for the same recipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({ senderWallet, recipient: nextRecipient, amount: addedAmount });
                });

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient])
                        .toEqual(nextAmount + addedAmount);
                });


                it('substract the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                        .toEqual(originalSenderOutput - nextAmount - addedAmount);
                });
            })

        })
    })

});