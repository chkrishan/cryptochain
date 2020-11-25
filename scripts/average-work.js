//here index.js inside blockchain will automatically  included  after '../blockchain
//
const Blockchain = require('../blockchain');
const blockchain = new Blockchain;

blockchain.addBlock({ data: 'initial-data' });

let prevTimeStamp, nextTimeStamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 100; i++) {

    prevTimeStamp = blockchain.chain[blockchain.chain.length - 1].timeStamp;

    blockchain.addBlock({ data: `data ${i}` });
    nextBlock = blockchain.chain[blockchain.chain.length - 1];

    nextTimeStamp = nextBlock.timeStamp;
    timeDiff = nextTimeStamp - prevTimeStamp;
    times.push(timeDiff);

    average = times.reduce((total, num) => (total + num)) / times.length;
    console.log(`time to mine block: ${timeDiff}ms.  Difficulty: ${nextBlock.difficulty}.  Average time: ${average}ms. `);

}