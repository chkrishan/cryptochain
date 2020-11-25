const EC = require('elliptic').ec;
const cryptoHash = require('../util/crypto-hash');

const ec = new EC('secp256k1');
//sepc  == standard of efficient cryptography ,'p' stands for prime 256 bits 

const verifySignature = ({ publicKey, data, signature }) => {

    //here we will get the public key 
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    //now from this public key we will verify the signature 
    return keyFromPublic.verify(cryptoHash(data), signature);

}

module.exports = { ec, verifySignature, cryptoHash };