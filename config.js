const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;

const GENESIS_DATA = {
    lasthash: '000q2w3e4r445ty6u',
    hash: '00022rre556nt98*H$%^sa%^__J',
    timeStamp: '10/11/2020',
    data: ['foo-data'],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
}

module.exports = { GENESIS_DATA, MINE_RATE };