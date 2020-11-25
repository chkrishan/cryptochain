const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
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

    })

})