# jse-cli-miner

[![Software License](https://img.shields.io/badge/license-GPL--3.0-brightgreen.svg?style=flat-square)](LICENSE) [![Build Status](https://img.shields.io/travis/felixbrucker/jse-cli-miner.svg?style=flat-square)](https://travis-ci.org/felixbrucker/jse-cli-miner) [![npm](https://img.shields.io/npm/v/jse-cli-miner.svg?style=flat-square)](https://www.npmjs.com/package/jse-cli-miner)

A very simple and lightweight cli cpu miner for JSECoin's platform mining.

## Install

`npm install -g jse-cli-miner`

### Without installing nodejs

Check https://github.com/felixbrucker/jse-cli-miner/releases for pre-built binaries.

## Configuration

The miner will create a config.json in the current directory. You will need to input your account number in the config field `uid` and your jseUnique key in the config field `jseUnique`. The jseUnique key can be obtained via the browsers Developer Tools (F12 on most browsers) and entering `user` or `user.jseUnique` in the console tab into the commandline at the bottom. This should be done after logging in.

![Console-Browser](/screens/console-browser.png?raw=true "Console-Browser")

## Usage

`jse-cli-miner`

## License

GNU GPLv3 (see LICENSE)
