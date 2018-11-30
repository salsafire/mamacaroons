import MacaroonFromLib = require('macaroons.js/lib/Macaroon');
import MacaroonsVerifier = require('macaroons.js/lib/MacaroonsVerifier');
import { CaveatInterface } from './caveat/CaveatInterface';

const MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder;


export default class Macaroon {
    static create(location: string, secretIdentifier: string, secret: string) {
        return new Macaroon(
            MacaroonsBuilder.create(location, secret, secretIdentifier)
        );
    }

    constructor(private _macaroon: MacaroonFromLib) {

    }

    get macaroon() {
        return this._macaroon;
    }

    verify(secret: string) {
        const verifier = new MacaroonsVerifier(this.macaroon);
        return verifier.isValid(secret);
    }

    addExactCaveat(key: string, value: string) {
        return new Macaroon(
            MacaroonsBuilder.modify(this.macaroon).add_first_party_caveat(`${key} = ${value}`).getMacaroon()
        );
    }

    addCaveat(caveat: CaveatInterface): Macaroon {
        return new Macaroon(
            MacaroonsBuilder.modify(this.macaroon).add_first_party_caveat(caveat.asString()).getMacaroon()
        );
    }

    serialize() {
        return this.macaroon.serialize();
    }

    toJSON() {
        return this.serialize();
    }
}
