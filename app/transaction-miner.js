const Transaction = require('../wallet/transaction');

class TransactionMiner {

    constructor({ blockchain, transactionPool, wallet, pubsub }) {

        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        //get the transaction pool's valid transactions
        const validTransaction = this.transactionPool.validTransactions();


        //generate the miner reward
        validTransaction.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));

        //add a block consisting of these transaction to blockchain
        this.blockchain.addBlock({ data: validTransaction })

        //broadcast and upadted blockchain
        this.pubsub.broadcastChain();

        //clear the transaction pool
        this.transactionPool.clear();
    }


}

module.exports = TransactionMiner;