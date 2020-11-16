const crypto = require('crypto');

const cryptoHash = (...inputs) => {

    const hash = crypto.createHash('sha256');
    //now this hash object has an update function that takes 
    //string as input and generate the required hash output

    hash.update(inputs.sort().join(' '));
    //digest is term in cryptography which is used to represent the result
    //of hash and we want the result in `hex` form
    return hash.digest('hex');

}

module.exports = cryptoHash;