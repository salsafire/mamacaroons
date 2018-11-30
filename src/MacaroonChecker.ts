import Macaroon from './Macaroon';
import { CaveatVerifierInterface } from './caveat/CaveatInterface';

const MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;

export default class MacaroonChecker {
    private checks: (string | Function)[] = [];

    constructor() {
    }

    addExactCheck(key: string, value: string) {
        return this.addVerifier(`${key} = ${value}`);
    }

    addVerifier(fn: ((caveat: string) => boolean) | CaveatVerifierInterface | string) {
        if (typeof fn === 'string') {
            this.checks.push(fn);
        } else if (typeof fn === 'function') {
            this.checks.push(fn);
        } else {
            this.checks.push(fn.verify.bind(fn));
        }

        return this;
    }

    isMacaroonValid(macaroon: Macaroon, secret: any) {
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
