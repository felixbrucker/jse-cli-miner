const EventEmitter = require('events');
const crypto = require('crypto');
const IoClient = require('socket.io-client');

module.exports = class Miner extends EventEmitter {
  constructor(user) {
    super();
    this.user = user;
    this.socketEndpoint = 'https://load.jsecoin.com';
    this.stats = {
      submittedHashes: 0,
      blockRewards: 0,
    };
    this.init();
  }

  init() {
    this.socket = IoClient(this.socketEndpoint);

    this.socket.on('connect', () => {
      this.emit('connected');
      this.socket.emit('startComs', 2, (authResponse) => {
        switch (authResponse) {
          case 'badIP':
            this.emit('badIP');
            return;
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
          // not sure what update data is, emit it just in case
          this.emit(updateReason, updateData);
      }
    });
  }

  findHashAndSubmit(preHash) {
    const nonce = Math.floor(99999999999 * Math.random());
    const hash = crypto.createHash('sha256').update(`${preHash},${nonce}`).digest('hex');
    this.socket.emit('submitHash', `${preHash},${hash},${nonce},${this.user.uid},${this.user.jseUnique},Platform Mining,0`);
    this.stats.submittedHashes += 1;
    this.emit('hashSubmitted', hash);
  }
};
