const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util/index');
const Transaction = require('./transaction');


class Wallet {

    constructor() {

        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {

        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }) {
        let outputTotal = 0;
        let hasConductedTransaction = false;

        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i];

            for (let transaction of block.data) {

                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }

                const addressTotal = transaction.outputMap[address];

                if (addressTotal) {
                    outputTotal += addressTotal;
                }

            }
            if (hasConductedTransaction)
                break;

        }


        return hasConductedTransaction ? outputTotal : STARTING_BALANCE + outputTotal;
    }

}

module.exports = Wallet;