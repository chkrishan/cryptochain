const redis = require('redis');

// TEST && BLOCKCHAIN are the channels through which the messages  (blocks or chains)
// will publish or received
const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub {
    constructor({ blockchain }) {
        //console.log(blockchain);
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannels();

        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }

    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

        const parsedMessage = JSON.parse(message);
        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
        }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({ channel, message }) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });

    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }


}

// const testPubSub = new PubSub();

// setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);
module.exports = PubSub;