import Macaroon from './Macaroon';
import MacaroonChecker from './MacaroonChecker';
import { AssignValueCaveat, AssignValueCaveatVerifier } from './caveat/AssignValueCaveat';
import { ExchangeCaveat, ExchangeCaveatVerifier } from './caveat/ExchangeCaveat';
import { TimeCaveat, TimeCaveatVerifier } from './caveat/TimeCaveat';
import { AssignReadOnlyValueCaveat, AssignReadOnlyValueCaveatVerifier } from './caveat/AssignReadOnlyValueCaveat';
import { AssignArrayMergeCaveat, AssignArrayMergeCaveatVerifier } from './caveat/AssignArrayMergeCaveat';
import { AssignArrayIntersectCaveat, AssignArrayIntersectCaveatVerifier } from './caveat/AssignArrayIntersectCaveat';

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


const easyMac = Macaroon.create(location, 'publicSecretId1', secrets.get('publicSecretId1'));

const valid = easyMac.verify(secrets.get('publicSecretId1'));
console.log(valid);


//
//
console.log();
console.log('------');
console.log();

const easySafeMac = easyMac
    .addExactCaveat('account', '3735928559')
    .addCaveat(new TimeCaveat(new Date('2042-01-01T00:00')))
    .addCaveat(new AssignValueCaveat('userId', '1234'))
    .addCaveat(new AssignReadOnlyValueCaveat('email', 'first@email.com'))
    .addCaveat(new AssignArrayMergeCaveat('servers', ['server1']))
    .addCaveat(new AssignArrayMergeCaveat('servers', ['server2']))
    .addCaveat(new AssignArrayMergeCaveat('ips', ['127.0.0.1']))
    .addCaveat(new AssignArrayIntersectCaveat('serversC', ['server1', 'server2']))
    .addCaveat(new AssignArrayIntersectCaveat('serversC', ['server2']))
    .addCaveat(new AssignArrayIntersectCaveat('ipsC', ['127.0.0.1','127.0.1.1']))
    .addCaveat(new AssignArrayIntersectCaveat('ipsC', []))
    .addCaveat(new AssignArrayIntersectCaveat('ipsC', ['127.0.0.1','127.0.1.1']))
    .addCaveat(new AssignArrayIntersectCaveat('oC', ['hello']))
    // .addCaveat(new AssignReadOnlyValueCaveat('email', 'throw-error@email.com'))
    .addCaveat(new ExchangeCaveat(['kraken:write', 'kraken:read', 'bitstamp:read']));

const caveatAssignValueVerifier = new AssignValueCaveatVerifier();
const assignReadOnlyValueCaveatVerifier = new AssignReadOnlyValueCaveatVerifier();
const assignArrayMergeCaveatVerifier = new AssignArrayMergeCaveatVerifier();
const assignArrayIntersectCaveatVerifier = new AssignArrayIntersectCaveatVerifier();

const checker = new MacaroonChecker()
    .addExactCheck('account', '3735928559')
    .addVerifier(caveatAssignValueVerifier)
    .addVerifier(assignReadOnlyValueCaveatVerifier)
    .addVerifier(assignArrayMergeCaveatVerifier)
    .addVerifier(assignArrayIntersectCaveatVerifier)
    .addVerifier(TimeCaveatVerifier.getVerifyer())
    .addVerifier(new ExchangeCaveatVerifier('kraken', 'write'));

console.log(easySafeMac.macaroon.inspect());
console.log('Serialized: ' + easySafeMac.macaroon.serialize());
console.log('identifier: ' + easySafeMac.macaroon.identifier);
console.log('Valid: ' + checker.isMacaroonValid(easySafeMac, secrets.get(easyMac.macaroon.identifier)));

console.log('values assigned => ', caveatAssignValueVerifier.values);
console.log('RO values assigned => ', assignReadOnlyValueCaveatVerifier.values);
console.log('Array/merge values assigned => ', assignArrayMergeCaveatVerifier.values);
console.log('Array/intersect values assigned => ', assignArrayIntersectCaveatVerifier.values);

//
//
console.log();
console.log('------');
console.log();


export {};
