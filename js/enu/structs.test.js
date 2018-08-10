'use strict';

/* eslint-env mocha */
var assert = require('assert');
var Fcbuffer = require('fcbuffer');
var ByteBuffer = require('bytebuffer');

var Enu = require('.');

describe('shorthand', function () {

  it('authority', function () {
    var enu = Enu();
    var authority = enu.fc.structs.authority;


    var pubkey = 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
    var auth = { threshold: 1, keys: [{ key: pubkey, weight: 1 }] };

    assert.deepEqual(authority.fromObject(pubkey), auth);
    assert.deepEqual(authority.fromObject(auth), Object.assign({}, auth, { accounts: [], waits: [] }));
  });

  it('PublicKey sorting', function () {
    var enu = Enu();
    var authority = enu.fc.structs.authority;


    var pubkeys = ['ENU7wBGPvBgRVa4wQN2zm5CjgBF6S7tP7R3JavtSa2unHUoVQGhey', 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'];

    var authSorted = { threshold: 1, keys: [{ key: pubkeys[1], weight: 1 }, { key: pubkeys[0], weight: 1 }], accounts: [], waits: [] };

    var authUnsorted = { threshold: 1, keys: [{ key: pubkeys[0], weight: 1 }, { key: pubkeys[1], weight: 1 }], accounts: [], waits: []

      // assert.deepEqual(authority.fromObject(pubkey), auth)
    };assert.deepEqual(authority.fromObject(authUnsorted), authSorted);
  });

  it('public_key', function () {
    var enu = Enu();
    var _enu$fc = enu.fc,
        structs = _enu$fc.structs,
        types = _enu$fc.types;

    var PublicKeyType = types.public_key();
    var pubkey = 'ENU6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
    // 02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf
    assertSerializer(PublicKeyType, pubkey);
  });

  it('symbol', function () {
    var enu = Enu();
    var types = enu.fc.types;

    var _Symbol = types.symbol();
    assertSerializer(_Symbol, '4,ENU', '4,ENU', 'ENU');
  });

  it('extended_symbol', function () {
    var enu = Enu({ defaults: true });
    var esType = enu.fc.types.extended_symbol();
    // const esString = esType.toObject()
    assertSerializer(esType, '4,ENU@contract');
  });

  it('asset', function () {
    var enu = Enu();
    var types = enu.fc.types;

    var aType = types.asset();
    assertSerializer(aType, '1.0001 ENU');
  });

  it('extended_asset', function () {
    var enu = Enu({ defaults: true });
    var eaType = enu.fc.types.extended_asset();
    assertSerializer(eaType, eaType.toObject());
  });

  it('signature', function () {
    var enu = Enu();
    var types = enu.fc.types;

    var SignatureType = types.signature();
    var signatureString = 'SIG_K1_JwxtqesXpPdaZB9fdoVyzmbWkd8tuX742EQfnQNexTBfqryt2nn9PomT5xwsVnUB4m7KqTgTBQKYf2FTYbhkB5c7Kk9EsH';
    //const signatureString = 'SIG_K1_Jzdpi5RCzHLGsQbpGhndXBzcFs8vT5LHAtWLMxPzBdwRHSmJkcCdVu6oqPUQn1hbGUdErHvxtdSTS1YA73BThQFwV1v4G5'
    assertSerializer(SignatureType, signatureString);
  });
});

if (process.env['NODE_ENV'] === 'development') {

  describe('Enumivo Abi', function () {

    it('Enumivo token contract parses', function (done) {
      var enu = Enu();

      enu.contract('enu.token', function (error, enu_token) {
        assert(!error, error);
        assert(enu_token.transfer, 'enu.token contract');
        assert(enu_token.issue, 'enu.token contract');
        done();
      });
    });
  });
}

describe('Action.data', function () {
  it('json', function () {
    var enu = Enu({ forceActionDataHex: false });
    var _enu$fc2 = enu.fc,
        structs = _enu$fc2.structs,
        types = _enu$fc2.types;

    var value = {
      account: 'enu.token',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 ENU',
        memo: ''
      },
      authorization: []
    };
    assertSerializer(structs.action, value);
  });

  it('force hex', function () {
    var enu = Enu({ forceActionDataHex: true });
    var _enu$fc3 = enu.fc,
        structs = _enu$fc3.structs,
        types = _enu$fc3.types;

    var value = {
      account: 'enu.token',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 ENU',
        memo: ''
      },
      authorization: []
    };
    assertSerializer(structs.action, value, value);
  });

  it('unknown type', function () {
    var enu = Enu({ forceActionDataHex: false });
    var _enu$fc4 = enu.fc,
        structs = _enu$fc4.structs,
        types = _enu$fc4.types;

    var value = {
      account: 'enu.token',
      name: 'mytype',
      data: '030a0b0c',
      authorization: []
    };
    assertSerializer(structs.action, value);
  });
});

function assertSerializer(type, value) {
  var fromObjectResult = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var toObjectResult = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : fromObjectResult;

  var obj = type.fromObject(value); // tests fromObject
  var buf = Fcbuffer.toBuffer(type, value); // tests appendByteBuffer
  var obj2 = Fcbuffer.fromBuffer(type, buf); // tests fromByteBuffer
  var obj3 = type.toObject(obj); // tests toObject

  if (!fromObjectResult && !toObjectResult) {
    assert.deepEqual(value, obj3, 'serialize object');
    assert.deepEqual(obj3, obj2, 'serialize buffer');
    return;
  }

  if (fromObjectResult) {
    assert(fromObjectResult, obj, 'fromObjectResult');
    assert(fromObjectResult, obj2, 'fromObjectResult');
  }

  if (toObjectResult) {
    assert(toObjectResult, obj3, 'toObjectResult');
  }
}