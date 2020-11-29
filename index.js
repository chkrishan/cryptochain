const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const request = require('request');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/index');
const TransactionMiner = require('./app/transaction-miner');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const transactionMiner = new TransactionMiner({
    blockchain,
    transactionPool,
    wallet,
    pubsub
});


setTimeout(() => pubsub.broadcastChain(), 1000);



app.get('/api/blocks', (req, res) => {

    res.json(blockchain.chain);
});



app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address
        })
    })
})

app.post('/api/transact', (req, res) => {
    const { recipient, amount } = req.body;
    //here we will chech if the transaction is already exists or not 
    // if it exist the update and if not then create new transaction
    let transaction = transactionPool
        .existingTransaction({ inputAddress: wallet.publicKey });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain
            });

        }

    } catch (error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    //add transaction into transaction pool
    transactionPool.setTransaction(transaction);

    // here transacyion will broadcast to all peers
    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
})



app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
})



app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
})


// syncChain() method will allow new peers to get the longest chain at 
// that moment 

const syncWithRootState = () => {

    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log("replace chain on a sync with ", rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log("replace transcation pool map on a sync with ", rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

let PEER_PORT;
//to generate the random port no. for new peers 
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;


app.listen(PORT, () => {
    console.log(`server is starting at http://localhost:${PORT}`);
    if (PORT !== DEFAULT_PORT)
        syncWithRootState();
})