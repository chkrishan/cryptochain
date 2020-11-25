const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const request = require('request');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => pubsub.broadcastChain(), 1000);

app.get('/api/blocks', (req, res) => {

    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
})

// syncChain() method will allow new peers to get the longest chain at 
// that moment 

const syncChains = () => {

    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log("replace chain on a sync with ", rootChain);
            blockchain.replaceChain(rootChain);
        }
    })
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
        syncChains();
})