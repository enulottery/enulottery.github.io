'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */
var assert = require('assert');
var fs = require('fs');

var Enu = require('.');
var ecc = Enu.modules.ecc;

var _require = require('enujs-keygen'),
    Keystore = _require.Keystore;

var wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

describe('version', function () {
  it('exposes a version number', function () {
    assert.ok(Enu.version);
  });
});

describe('offline', function () {
  var headers = {
    expiration: new Date().toISOString().split('.')[0], // Don't use `new Date` in production
    ref_block_num: 1,
    ref_block_prefix: 452435776,
    net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    transaction_extensions: []
  };

  it('multi-signature', function _callee() {
    var transactionHeaders, enu, trx;
    return _regenerator2.default.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            transactionHeaders = function transactionHeaders(expireInSeconds, callback) {
              callback(null /*error*/, headers);
            };

            enu = Enu({
              keyProvider: [ecc.seedPrivate('key1'), ecc.seedPrivate('key2')],
              httpEndpoint: null,
              transactionHeaders: transactionHeaders
            });
            _context.next = 4;
            return _regenerator2.default.awrap(enu.nonce(1, { authorization: 'inita' }));

          case 4:
            trx = _context.sent;


            assert.equal(trx.transaction.signatures.length, 2, 'signature count');

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, null, this);
  });

  it('transaction', function _callee2() {
    var enu, trx;
    return _regenerator2.default.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            enu = Enu({
              keyProvider: wif,
              httpEndpoint: null
            });
            _context2.next = 3;
            return _regenerator2.default.awrap(enu.transaction({
              expiration: new Date().toISOString().split('.')[0], // Don't use `new Date` in production
              ref_block_num: 1,
              ref_block_prefix: 452435776,
              actions: [{
                account: 'enu.null',
                name: 'nonce',
                authorization: [{
                  actor: 'inita',
                  permission: 'active'
                }],
                data: '0131' //hex
              }]
            }));

          case 3:
            trx = _context2.sent;


            assert.equal(trx.transaction.signatures.length, 1, 'signature count');

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, this);
  });

  it('transactionHeaders object', function _callee3() {
    var enu, memo, trx;
    return _regenerator2.default.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            enu = Enu({
              keyProvider: wif,
              httpEndpoint: null,
              transactionHeaders: headers
            });
            memo = '';
            _context3.next = 4;
            return _regenerator2.default.awrap(enu.transfer('few', 'many', '100.0000 ENU', memo));

          case 4:
            trx = _context3.sent;


            assert.deepEqual({
              expiration: trx.transaction.transaction.expiration,
              ref_block_num: trx.transaction.transaction.ref_block_num,
              ref_block_prefix: trx.transaction.transaction.ref_block_prefix,
              net_usage_words: 0,
              max_cpu_usage_ms: 0,
              delay_sec: 0,
              context_free_actions: [],
              transaction_extensions: []
            }, headers);

            assert.equal(trx.transaction.signatures.length, 1, 'signature count');

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, null, this);
  });

  /*
  it('abi', async function() {
    const enu = Enu({httpEndpoint: null})
      const abiBuffer = fs.readFileSync(`docker/contracts/enu.bios/enu.bios.abi`)
    const abiObject = JSON.parse(abiBuffer)
      assert.deepEqual(abiObject, enu.fc.abiCache.abi('enu.bios', abiBuffer).abi)
    assert.deepEqual(abiObject, enu.fc.abiCache.abi('enu.bios', abiObject).abi)
      const bios = await enu.contract('enu.bios')
    assert(typeof bios.newaccount === 'function', 'unrecognized contract')
  })
  */
});

// some transactions that don't broadcast may require Api lookups
if (process.env['NODE_ENV'] === 'development') {

  // describe('networks', () => {
  //   it('testnet', (done) => {
  //     const enu = Enu()
  //     enu.getBlock(1, (err, block) => {
  //       if(err) {
  //         throw err
  //       }
  //       done()
  //     })
  //   })
  // })

  describe('Contracts', function () {
    it('Messages do not sort', function _callee4() {
      var local, opts, tx;
      return _regenerator2.default.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              local = Enu();
              opts = { sign: false, broadcast: false };
              _context4.next = 4;
              return _regenerator2.default.awrap(local.transaction(['currency', 'enu.token'], function (_ref) {
                var currency = _ref.currency,
                    enu_token = _ref.enu_token;

                // make sure {account: 'enu.token', ..} remains first
                enu_token.transfer('inita', 'initd', '1.1000 ENU', '');

                // {account: 'currency', ..} remains second (reverse sort)
                currency.transfer('inita', 'initd', '1.2000 CUR', '');
              }, opts));

            case 4:
              tx = _context4.sent;

              assert.equal(tx.transaction.transaction.actions[0].account, 'enu.token');
              assert.equal(tx.transaction.transaction.actions[1].account, 'currency');

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    });
  });

  describe('Contract', function () {
    function deploy(contract) {
      var account = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'inita';

      it('deploy ' + contract + '@' + account, function _callee5() {
        var config, enu, wasm, abi, code, diskAbi;
        return _regenerator2.default.async(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.timeout(4000);
                // console.log('todo, skipping deploy ' + `${contract}@${account}`)
                config = { binaryen: require("binaryen"), keyProvider: wif };
                enu = Enu(config);
                wasm = fs.readFileSync('docker/contracts/' + contract + '/' + contract + '.wasm');
                abi = fs.readFileSync('docker/contracts/' + contract + '/' + contract + '.abi');
                _context5.next = 7;
                return _regenerator2.default.awrap(enu.setcode(account, 0, 0, wasm));

              case 7:
                _context5.next = 9;
                return _regenerator2.default.awrap(enu.setabi(account, JSON.parse(abi)));

              case 9:
                _context5.next = 11;
                return _regenerator2.default.awrap(enu.getAbi(account));

              case 11:
                code = _context5.sent;
                diskAbi = JSON.parse(abi);

                delete diskAbi.____comment;
                if (!diskAbi.error_messages) {
                  diskAbi.error_messages = [];
                }

                assert.deepEqual(diskAbi, code.abi);

              case 16:
              case 'end':
                return _context5.stop();
            }
          }
        }, null, this);
      });
    }

    // When ran multiple times, deploying to the same account
    // avoids a same contract version deploy error.
    // TODO: undeploy contract instead (when API allows this)

    deploy('enu.msig');
    deploy('enu.token');
    deploy('enu.bios');
    deploy('enu.system');
  });

  describe('Contracts Load', function () {
    function load(name) {
      it(name, function _callee6() {
        var enu, contract;
        return _regenerator2.default.async(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                enu = Enu();
                _context6.next = 3;
                return _regenerator2.default.awrap(enu.contract(name));

              case 3:
                contract = _context6.sent;

                assert(contract, 'contract');

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, null, this);
      });
    }
    load('enumivo');
    load('enu.token');
  });

  describe('transactions', function () {
    var signProvider = function signProvider(_ref2) {
      var sign = _ref2.sign,
          buf = _ref2.buf;
      return sign(buf, wif);
    };
    var promiseSigner = function promiseSigner(args) {
      return Promise.resolve(signProvider(args));
    };

    it('usage', function () {
      var enu = Enu({ signProvider: signProvider });
      enu.transfer();
    });

    // A keyProvider can return private keys directly..
    it('keyProvider private key', function () {

      // keyProvider should return an array of keys
      var keyProvider = function keyProvider() {
        return [wif];
      };

      var enu = Enu({ keyProvider: keyProvider });

      return enu.transfer('inita', 'initb', '1.0000 ENU', '', false).then(function (tr) {
        assert.equal(tr.transaction.signatures.length, 1);
        assert.equal((0, _typeof3.default)(tr.transaction.signatures[0]), 'string');
      });
    });

    it('keyProvider multiple private keys (get_required_keys)', function () {

      // keyProvider should return an array of keys
      var keyProvider = function keyProvider() {
        return ['5K84n2nzRpHMBdJf95mKnPrsqhZq7bhUvrzHyvoGwceBHq8FEPZ', wif];
      };

      var enu = Enu({ keyProvider: keyProvider });

      return enu.transfer('inita', 'initb', '1.2740 ENU', '', false).then(function (tr) {
        assert.equal(tr.transaction.signatures.length, 1);
        assert.equal((0, _typeof3.default)(tr.transaction.signatures[0]), 'string');
      });
    });

    // If a keystore is used, the keyProvider should return available
    // public keys first then respond with private keys next.
    it('keyProvider public keys then private key', function () {
      var pubkey = ecc.privateToPublic(wif);

      // keyProvider should return a string or array of keys.
      var keyProvider = function keyProvider(_ref3) {
        var transaction = _ref3.transaction,
            pubkeys = _ref3.pubkeys;

        if (!pubkeys) {
          assert.equal(transaction.actions[0].name, 'transfer');
          return [pubkey];
        }

        if (pubkeys) {
          assert.deepEqual(pubkeys, [pubkey]);
          return [wif];
        }
        assert(false, 'unexpected keyProvider callback');
      };

      var enu = Enu({ keyProvider: keyProvider });

      return enu.transfer('inita', 'initb', '9.0000 ENU', '', false).then(function (tr) {
        assert.equal(tr.transaction.signatures.length, 1);
        assert.equal((0, _typeof3.default)(tr.transaction.signatures[0]), 'string');
      });
    });

    it('keyProvider from enujs-keygen', function () {
      var keystore = Keystore('uid');
      keystore.deriveKeys({ parent: wif });
      var enu = Enu({ keyProvider: keystore.keyProvider });
      return enu.transfer('inita', 'initb', '12.0000 ENU', '', true);
    });

    it('keyProvider return Promise', function () {
      var enu = Enu({ keyProvider: new Promise(function (resolve) {
          resolve(wif);
        }) });
      return enu.transfer('inita', 'initb', '1.6180 ENU', '', true);
    });

    it('signProvider', function () {
      var customSignProvider = function customSignProvider(_ref4) {
        var buf = _ref4.buf,
            sign = _ref4.sign,
            transaction = _ref4.transaction;


        // All potential keys (ENU6MRy.. is the pubkey for 'wif')
        var pubkeys = ['ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'];

        return enu.getRequiredKeys(transaction, pubkeys).then(function (res) {
          // Just the required_keys need to sign
          assert.deepEqual(res.required_keys, pubkeys);
          return sign(buf, wif); // return hex string signature or array of signatures
        });
      };
      var enu = Enu({ signProvider: customSignProvider });
      return enu.transfer('inita', 'initb', '2.0000 ENU', '', false);
    });

    it('create asset', function _callee7() {
      var enu, pubkey, auth;
      return _regenerator2.default.async(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              enu = Enu({ signProvider: signProvider });
              pubkey = 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
              auth = { authorization: 'enu.token' };
              _context7.next = 5;
              return _regenerator2.default.awrap(enu.create('enu.token', '10000 ' + randomAsset(), auth));

            case 5:
              _context7.next = 7;
              return _regenerator2.default.awrap(enu.create('enu.token', '10000.00 ' + randomAsset(), auth));

            case 7:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    });

    it('newaccount (broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      var pubkey = 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
      var name = randomName();

      return enu.transaction(function (tr) {
        tr.newaccount({
          creator: 'enumivo',
          name: name,
          owner: pubkey,
          active: pubkey
        });

        tr.buyrambytes({
          payer: 'enumivo',
          receiver: name,
          bytes: 8192
        });

        tr.delegatebw({
          from: 'enumivo',
          receiver: name,
          stake_net_quantity: '10.0000 ENU',
          stake_cpu_quantity: '10.0000 ENU',
          transfer: 0
        });
      });
    });

    it('mockTransactions pass', function () {
      var enu = Enu({ signProvider: signProvider, mockTransactions: 'pass' });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '').then(function (transfer) {
        assert(transfer.mockTransaction, 'transfer.mockTransaction');
      });
    });

    it('mockTransactions fail', function () {
      var logger = { error: null };
      var enu = Enu({ signProvider: signProvider, mockTransactions: 'fail', logger: logger });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '').catch(function (error) {
        assert(error.indexOf('fake error') !== -1, 'expecting: fake error');
      });
    });

    it('transfer (broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '');
    });

    it('transfer custom token precision (broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transfer('inita', 'initb', '1.618 PHI', '');
    });

    it('transfer custom authorization (broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '', { authorization: 'inita@owner' });
    });

    it('transfer custom authorization sorting (no broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '', { authorization: ['initb@owner', 'inita@owner'], broadcast: false }).then(function (_ref5) {
        var transaction = _ref5.transaction;

        var ans = [{ actor: 'inita', permission: 'owner' }, { actor: 'initb', permission: 'owner' }];
        assert.deepEqual(transaction.transaction.actions[0].authorization, ans);
      });
    });

    it('transfer (no broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '', { broadcast: false });
    });

    it('transfer (no broadcast, no sign)', function () {
      var enu = Enu({ signProvider: signProvider });
      var opts = { broadcast: false, sign: false };
      return enu.transfer('inita', 'initb', '1.0000 ENU', '', opts).then(function (tr) {
        return assert.deepEqual(tr.transaction.signatures, []);
      });
    });

    it('transfer sign promise (no broadcast)', function () {
      var enu = Enu({ signProvider: promiseSigner });
      return enu.transfer('inita', 'initb', '1.0000 ENU', '', false);
    });

    it('action to unknown contract', function (done) {
      var logger = { error: null };
      Enu({ signProvider: signProvider, logger: logger }).contract('unknown432').then(function () {
        throw 'expecting error';
      }).catch(function (error) {
        done();
      });
    });

    it('action to contract', function () {
      return Enu({ signProvider: signProvider }).contract('enu.token').then(function (token) {
        return token.transfer('inita', 'initb', '1.0000 ENU', '')
        // transaction sent on each command
        .then(function (tr) {
          assert.equal(1, tr.transaction.transaction.actions.length);

          return token.transfer('initb', 'inita', '1.0000 ENU', '').then(function (tr) {
            assert.equal(1, tr.transaction.transaction.actions.length);
          });
        });
      }).then(function (r) {
        assert(r == undefined);
      });
    });

    it('action to contract atomic', function _callee8() {
      var amt, enu, trTest, assertTr;
      return _regenerator2.default.async(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              amt = 1; // for unique transactions

              enu = Enu({ signProvider: signProvider });

              trTest = function trTest(enu_token) {
                assert(enu_token.transfer('inita', 'initb', amt + '.0000 ENU', '') == null);
                assert(enu_token.transfer('initb', 'inita', amt++ + '.0000 ENU', '') == null);
              };

              assertTr = function assertTr(tr) {
                assert.equal(2, tr.transaction.transaction.actions.length);
              };

              //  contracts can be a string or array


              _context8.t0 = _regenerator2.default;
              _context8.t1 = assertTr;
              _context8.next = 8;
              return _regenerator2.default.awrap(enu.transaction(['enu.token'], function (_ref6) {
                var enu_token = _ref6.enu_token;
                return trTest(enu_token);
              }));

            case 8:
              _context8.t2 = _context8.sent;
              _context8.t3 = (0, _context8.t1)(_context8.t2);
              _context8.next = 12;
              return _context8.t0.awrap.call(_context8.t0, _context8.t3);

            case 12:
              _context8.t4 = _regenerator2.default;
              _context8.t5 = assertTr;
              _context8.next = 16;
              return _regenerator2.default.awrap(enu.transaction('enu.token', function (enu_token) {
                return trTest(enu_token);
              }));

            case 16:
              _context8.t6 = _context8.sent;
              _context8.t7 = (0, _context8.t5)(_context8.t6);
              _context8.next = 20;
              return _context8.t4.awrap.call(_context8.t4, _context8.t7);

            case 20:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this);
    });

    it('action to contract (contract tr nesting)', function () {
      this.timeout(4000);
      var tn = Enu({ signProvider: signProvider });
      return tn.contract('enu.token').then(function (enu_token) {
        return enu_token.transaction(function (tr) {
          tr.transfer('inita', 'initb', '1.0000 ENU', '');
          tr.transfer('inita', 'initc', '2.0000 ENU', '');
        }).then(function () {
          return enu_token.transfer('inita', 'initb', '3.0000 ENU', '');
        });
      });
    });

    it('multi-action transaction (broadcast)', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transaction(function (tr) {
        assert(tr.transfer('inita', 'initb', '1.0000 ENU', '') == null);
        assert(tr.transfer({ from: 'inita', to: 'initc', quantity: '1.0000 ENU', memo: '' }) == null);
      }).then(function (tr) {
        assert.equal(2, tr.transaction.transaction.actions.length);
      });
    });

    it('multi-action transaction no inner callback', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transaction(function (tr) {
        tr.transfer('inita', 'inita', '1.0000 ENU', '', function (cb) {});
      }).then(function () {
        throw 'expecting rollback';
      }).catch(function (error) {
        assert(/Callback during a transaction/.test(error), error);
      });
    });

    it('multi-action transaction error rollback', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transaction(function (tr) {
        throw 'rollback';
      }).then(function () {
        throw 'expecting rollback';
      }).catch(function (error) {
        assert(/rollback/.test(error), error);
      });
    });

    it('multi-action transaction Promise.reject rollback', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transaction(function (tr) {
        return Promise.reject('rollback');
      }).then(function () {
        throw 'expecting rollback';
      }).catch(function (error) {
        assert(/rollback/.test(error), error);
      });
    });

    it('custom transfer', function () {
      var enu = Enu({ signProvider: signProvider });
      return enu.transaction({
        actions: [{
          account: 'enumivo',
          name: 'transfer',
          data: {
            from: 'inita',
            to: 'initb',
            quantity: '13.0000 ENU',
            memo: '爱'
          },
          authorization: [{
            actor: 'inita',
            permission: 'active'
          }]
        }]
      }, { broadcast: false });
    });

    it('custom contract transfer', function _callee9() {
      var enu;
      return _regenerator2.default.async(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              enu = Enu({ signProvider: signProvider });
              _context9.next = 3;
              return _regenerator2.default.awrap(enu.contract('currency').then(function (currency) {
                return currency.transfer('currency', 'inita', '1.0000 CUR', '');
              }));

            case 3:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    });
  });

  it('Transaction ABI cache', function _callee10() {
    var enu, abi;
    return _regenerator2.default.async(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            enu = Enu();

            assert.throws(function () {
              return enu.fc.abiCache.abi('enumivo');
            }, /not cached/);
            _context10.next = 4;
            return _regenerator2.default.awrap(enu.fc.abiCache.abiAsync('enumivo'));

          case 4:
            abi = _context10.sent;
            _context10.t0 = assert;
            _context10.t1 = abi;
            _context10.next = 9;
            return _regenerator2.default.awrap(enu.fc.abiCache.abiAsync('enumivo', false /*force*/));

          case 9:
            _context10.t2 = _context10.sent;

            _context10.t0.deepEqual.call(_context10.t0, _context10.t1, _context10.t2);

            assert.deepEqual(abi, enu.fc.abiCache.abi('enumivo'));

          case 12:
          case 'end':
            return _context10.stop();
        }
      }
    }, null, this);
  });

  it('Transaction ABI lookup', function _callee11() {
    var enu, tx;
    return _regenerator2.default.async(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            enu = Enu();
            _context11.next = 3;
            return _regenerator2.default.awrap(enu.transaction({
              actions: [{
                account: 'currency',
                name: 'transfer',
                data: {
                  from: 'inita',
                  to: 'initb',
                  quantity: '13.0000 CUR',
                  memo: ''
                },
                authorization: [{
                  actor: 'inita',
                  permission: 'active'
                }]
              }]
            }, { sign: false, broadcast: false }));

          case 3:
            tx = _context11.sent;

            assert.equal(tx.transaction.transaction.actions[0].account, 'currency');

          case 5:
          case 'end':
            return _context11.stop();
        }
      }
    }, null, this);
  });
} // if development

var randomName = function randomName() {
  var name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '');
  return 'a' + name + '111222333444'.substring(0, 11 - name.length); // always 12 in length
};

var randomAsset = function randomAsset() {
  return ecc.sha256(String(Math.random())).toUpperCase().replace(/[^A-Z]/g, '').substring(0, 7);
};