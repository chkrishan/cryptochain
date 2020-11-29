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

const STARTING_BALANCE = 1000;

const REWARD_INPUT = { address: '*authorised-reward*' };

const MINING_REWARD = 50;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};