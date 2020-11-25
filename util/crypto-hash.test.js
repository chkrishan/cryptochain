const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {

    it('generate the SHA256 hshed output', () => {
        expect(cryptoHash('foo'))
            .toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });

    it('produces the same hash with same arguments with any order', () => {
        expect(cryptoHash('one', 'two', 'three'))
            .toEqual(cryptoHash('two', 'three', 'one'));
    });

    it('produces a unique hash when the properties have been changed on an input', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';

        expect(cryptoHash(foo)).not.toEqual(originalHash);
    })
})