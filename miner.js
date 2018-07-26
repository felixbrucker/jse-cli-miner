#!/usr/bin/env node

const fs = require('fs');
const Miner = require('./lib');
const version = require('./lib/version');

const configFile = 'config.json';
const verbose = false;

console.log(`
     ***********  JSE CLI MINER ${version}  ************
     A very simple cli cpu miner for JSECoin's platform mining.
     Optimized for maximum rewards with as little cpu usage as possible.
`);

let user = {
  uid: 0,
  session: '',
  jseUnique: '',
};

if (fs.existsSync(configFile)) {
  user = JSON.parse(fs.readFileSync(configFile));
} else {
  fs.writeFileSync(configFile, JSON.stringify(user, null, 2));
}

if (user.uid === 0 || user.session === '' || user.jseUnique === '') {
  log('Please fill out your config. For more info see https://github.com/felixbrucker/jse-cli-miner#configuration');
  process.exit(0);
}

const miner = new Miner(user);

miner.on('badIP', () => log('badIP: You seem to be using a vpn, vps, proxy, tor or similar which is not supported.'));
miner.on('registerSessionFailed', () => log('Error 551 socket.io registration problem'));
miner.on('registerSessionSuccess', () => log('Successfully registered socket.io session'));
miner.on('miningStart', () => {
  log('Started mining');
  printStats();
});
miner.on('connected', () => log('Connected to server'));
miner.on('disconnected', () => log('Disconnected from server'));
miner.on('connect_error', err => log(`JSE internal socket error: ${JSON.stringify(err)}`));
miner.on('blockReward', () => log('Received a block reward!'));
if (verbose) {
  miner.on('hashSubmitted', hash => log(`New Block, submitted Hash: ${hash}`));
}

function log(text) {
  console.log(`${(new Date()).toISOString()} | ${text}`);
}

function printStats() {
  log(`Rewarded Hashes: ${miner.stats.blockRewards}/${miner.stats.submittedHashes} (${((miner.stats.blockRewards / (miner.stats.submittedHashes || 1)) * 100).toFixed(2)}%)`);
}

setInterval(printStats, 2 * 60 * 1000);
