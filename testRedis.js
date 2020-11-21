const redis = require('redis');

const client = redis.createClient();

client.on("error", (error) => {
    console.error("error encountered: ", error);
});

client.on("connect", (error) => {
    console.log("redis connetion establised");
});