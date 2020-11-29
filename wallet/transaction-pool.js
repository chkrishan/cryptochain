const Transaction = require('./transaction');
class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
        // return this.transactionMap;
    }


    clear() {
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }) {

        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];

            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id]
                }
            }
        }
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);

        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    validTransactions() {

        // filter method checks for every element of array if it returns true then it add that 
        // element to array and if it return false then it'll remove that element from array 
        // Object.values(this.transactionMap) -> it will return an array of transactions
        // so at the end you will ahve array of valid transactons
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        );
    }
}

module.exports = TransactionPool;