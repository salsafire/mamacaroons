import Macaroon = require('macaroons.js/lib/Macaroon');

const MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder;
const MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;
const TimestampCaveatVerifier = require('macaroons.js').verifier.TimestampCaveatVerifier;

const secrets = new Map()
    .set('publicSecretId1', 'you will not find me')
    .set('publicSecretId2', 'you will not find me neither');


const location = 'http://localhost';

enum ExchangeAction {
    read = 'r',
    write = 'w'
}

function ExchangeCaveatVerifier(caveat: string, exchange: string, action: ExchangeAction): boolean {
    const CAVEAT_PREFIX = 'exchange = ';
    const CAVEAT_PREFIX_LEN = CAVEAT_PREFIX.length;


    if (caveat.startsWith(CAVEAT_PREFIX)) {
        const listAsString = caveat.substr(CAVEAT_PREFIX_LEN).trim();
        const list = listAsString.split(',');
        return list.findIndex(s => {
            return s.includes(`${exchange}:${action}`);
        }) > -1;
    }
    return false;
}

function ExchangeCaveatVerifierFor(exchange: string, action: ExchangeAction) {
    return (caveat: string) => {
        return ExchangeCaveatVerifier(caveat, exchange, action);
    };
}


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

class EasyMacaroon {
    static create(location: string, secretHint: string, secret: string) {
        return new EasyMacaroon(
            MacaroonsBuilder.create(location, secretHint, secret)
        );
    }

    constructor(private _macaroon: Macaroon) {

    }

    get macaroon() {
        return this._macaroon;
    }

    verifiy(secret: string) {
        const verifier = new MacaroonsVerifier(this.macaroon);
        return verifier.isValid(secret);
    }

    addExactCaveat(key: string, value: string) {
        return this.addCaveat(key, value);
    }


    addAssignCaveat(key: string, value: string) {
        return this.addCaveat(key, value, '->');
    }

    addCaveat(key: string, value: string, sign = '=') {
        return new EasyMacaroon(
            MacaroonsBuilder.modify(this.macaroon).add_first_party_caveat(`${key} ${sign} ${value}`).getMacaroon()
        );
    }

    serialize() {
        return this.macaroon.serialize();
    }

    toJSON() {
        return this.serialize();
    }
}

class EasyMacaroonInspecter {
    private checks: (string | Function)[] = [];

    constructor() {

    }

    addExactCheck(key: string, value: string) {
        this.checks.push(`${key} = ${value}`);

        return this;
    }

    addVerifier(fn: ((caveat: string) => boolean) | CaveatAssignVerifier) {
        if (fn instanceof CaveatAssignVerifier) {
            this.checks.push(fn.asFunction());
        } else {
            this.checks.push(fn);
        }

        return this;
    }


    isValid(macaroon: EasyMacaroon, secret: any) {
        const verifier = new MacaroonsVerifier(macaroon.macaroon);
        for (const check of this.checks) {
            if (typeof check === 'string') {
                verifier.satisfyExact(check);
            } else {
                verifier.satisfyGeneral(check);
            }
        }

        return verifier.isValid(secret);
    }
}

class CaveatAssignVerifier {
    public values: any = {};

    private verify(caveat: string) {
        const isAssign = caveat.indexOf('->') > -1;

        if (isAssign) {
            const [key, value] = caveat.split('->', 2);
            this.values[key.trim()] = value.trim();
        }

        return isAssign;
    }

    asFunction() {
        return this.verify.bind(this);
    }
}


const easyMac = EasyMacaroon.create(location, secrets.get('publicSecretId1'), 'publicSecretId1');

const valid = easyMac.verifiy(secrets.get('publicSecretId1'));
console.log(valid);


//
//
console.log();
console.log('------');
console.log();


const easySafeMac = easyMac
    .addExactCaveat('account', '3735928559')
    .addCaveat('time', '2042-01-01T00:00', '<')
    .addExactCaveat('exchange', 'kraken:w, kraken:r,bitstamp:r')
    .addAssignCaveat('userId', '1234');

const caveatAssignVerifier = new CaveatAssignVerifier();

const inspecter = new EasyMacaroonInspecter()
    .addExactCheck('account', '3735928559')
    .addVerifier(caveatAssignVerifier)
    .addVerifier(TimestampCaveatVerifier)
    .addVerifier(ExchangeCaveatVerifierFor('kraken', ExchangeAction.write));

console.log(easySafeMac.macaroon.inspect());
console.log('Serialized: ' + easySafeMac.macaroon.serialize());
console.log('identifier: ' + easySafeMac.macaroon.identifier);
console.log('Valid: ' + inspecter.isValid(easySafeMac, secrets.get(easyMac.macaroon.identifier)));

console.log('values assigned => ', caveatAssignVerifier.values);

//
//
console.log();
console.log('------');
console.log();


export {};
