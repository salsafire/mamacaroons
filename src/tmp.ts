import Macaroon from './Macaroon';
import MacaroonChecker from './MacaroonChecker';
import { AssignCaveat, AssignCaveatVerifier } from './caveat/AssignCaveat';
import { ExchangeCaveat, ExchangeCaveatVerifier } from './caveat/ExchangeCaveat';

const secrets = new Map()
    .set('publicSecretId1', 'you will not find me')
    .set('publicSecretId2', 'you will not find me neither');


const location = 'http://localhost';


// username:kid:nonce
//This public portion, known as the macaroon's identifier, can be anything that
// enables us to remember our secret.  In this example, we know that the string 'we
// used our secret key' always refers to this secret.  We could just as easily keep
// a database mapping public macaroon identities to private secrets, or encrypt the
// public portion using a key known only to us.  The only requirement here is that
// our application be able to remember the secret given the public portion, and
// that no one else is able to guess the secret.

// The first message in a macaroon is required
// to be a public, opaque key identifier that maps to a secret root
// key known only to the target service. (Such key identifiers
// can be implemented, e.g., using random nonces, indices into a
// database at the target service, keyed HMACs, or using publickey
// or secret-key encryption; s


const easyMac = Macaroon.create(location, secrets.get('publicSecretId1'), 'publicSecretId1');

const valid = easyMac.verifiy(secrets.get('publicSecretId1'));
console.log(valid);


//
//
console.log();
console.log('------');
console.log();

const easySafeMac = easyMac
    .addExactCaveat('account', '3735928559')
    .addSignedCaveat('time', '<', '2042-01-01T00:00')
    .addCaveat(new AssignCaveat('userId', '1234'))
    .addCaveat(new ExchangeCaveat(['kraken:write', 'kraken:read', 'bitstamp:read']));

const caveatAssignVerifier = new AssignCaveatVerifier();

const checker = new MacaroonChecker()
    .addExactCheck('account', '3735928559')
    .addVerifier(caveatAssignVerifier)
    .addVerifier(require('macaroons.js').verifier.TimestampCaveatVerifier)
    .addVerifier(new ExchangeCaveatVerifier('kraken', 'write'));

console.log(easySafeMac.macaroon.inspect());
console.log('Serialized: ' + easySafeMac.macaroon.serialize());
console.log('identifier: ' + easySafeMac.macaroon.identifier);
console.log('Valid: ' + checker.isValid(easySafeMac, secrets.get(easyMac.macaroon.identifier)));

console.log('values assigned => ', caveatAssignVerifier.values);

//
//
console.log();
console.log('------');
console.log();


export {};
