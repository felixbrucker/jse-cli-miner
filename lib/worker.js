const crypto = require('crypto');

module.exports = ([preHash, diff], done) => {
  let nonce = Math.floor(9999999999 * Math.random());
  let hash = '';
  do {
    nonce += 1;
    hash = crypto.createHash('sha256').update(`${preHash},${nonce}`).digest('hex');
  } while (hash.substr(0, diff) !== '0'.repeat(diff));

  return done([hash, nonce]);
};
