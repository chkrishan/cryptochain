//uuid module will create the unique id for the every transaction
const uuid = require('uuid');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Transaction {
    //outputmap field is the details of the amount send to the recipient
    //and how much balance sender will have reamining after the transaction
    constructor({ senderWallet, recipient, amount, outputMap, input }) {
        this.id = uuid.v1();
        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {

        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    //this will update our outputmap and resign the transaction
    update({ senderWallet, recipient, amount }) {

        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] += amount;
        }


        this.outputMap[senderWallet.publicKey] -= amount;

        //here we're trying to resign the trasaction with updated data. but here data will update, but it will not create the 
        // new signature due to some java script limitations(two references of a javascript objects always condidered to be equal)
        //even if the properties have been changed so we will resolve this isssue in 
        //cryptoHash function
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }


    static validTransaction(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction;
        // console.log(transaction);
        // here we are reducing the all the values of outputMap array into a single value
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);
        //console.log(outputTotal + " " + amount);
        if (outputTotal !== amount) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`signature is not valid from ${address} `);
            return false;
        }

        return true;
    }

    static rewardTransaction({ minerWallet }) {

        return new this({
            input: REWARD_INPUT,
            outputMap: {
                [minerWallet.publicKey]: MINING_REWARD }
        });
    }

}

module.exports = Transaction;