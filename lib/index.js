const EventEmitter = require('events');
const crypto = require('crypto');
const IoClient = require('socket.io-client');

module.exports = class Miner extends EventEmitter {
  static getHashAndNonceForDiff(preHash, diff) {
    let nonce = Math.floor(9999999999 * Math.random());
    let hash = '';
    do {
      nonce += 1;
      hash = crypto.createHash('sha256').update(`${preHash},${nonce}`).digest('hex');
    } while (hash.substr(0, diff) !== '0'.repeat(diff));

    return [hash, nonce];
  }

  constructor(user, opts = null) {
    super();
    this.user = user;
    this.socketEndpoint = 'https://load.jsecoin.com';
    this.difficulty = 4;
    this.opts = opts;
    this.stats = {
      submittedHashes: 0,
      blockRewards: 0,
    };
    this.init();
  }

  init() {
    this.socket = IoClient(this.socketEndpoint, this.opts);

    this.socket.on('connect', () => {
      this.emit('connected');
      this.socket.emit('startComs', 2, (authResponse) => {
        switch (authResponse) {
          case 'badIP':
            this.emit('badIP');
            return;
          case 'goodIP':
            this.emit('goodIP');
            break;
          default:
            this.emit(authResponse);
        }
        this.socket.emit('registerSession', this.user.uid, this.user.session, (response) => {
          if (response !== true) {
            this.emit('registerSessionFailed');
            return;
          }
          this.emit('registerSessionSuccess');
          this.socket.emit('requestFirstPreHash', '2');
          this.emit('miningStart');
        });
      });
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (err) => {
      this.emit('connect_error', err);
      this.socket.close();
    });

    this.socket.on('firstPreHash', this.findHashAndSubmit.bind(this));
    this.socket.on('blockPreHash', this.findHashAndSubmit.bind(this));

    this.socket.on('userUpdate', (updateReason, updateData) => {
      switch (updateReason) {
        case 'blockUpdate':
          this.stats.blockRewards += 1;
          this.emit('blockReward');
          break;
        default:
          // not used yet, keep it here just in case
          this.emit(updateReason, updateData);
      }
    });
  }

  findHashAndSubmit(preHash) {
    const [hash, nonce] = Miner.getHashAndNonceForDiff(preHash, this.difficulty);
    this.socket.emit('submitHash', `${preHash},${hash},${nonce},${this.user.uid},${this.user.jseUnique},Platform Mining,0`);
    this.stats.submittedHashes += 1;
    this.emit('hashSubmitted', hash);
  }
};
