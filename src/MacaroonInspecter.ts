import Macaroon from './Macaroon';
import { CaveatVerifierInterface } from './caveat/CaveatInterface';

const MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;

export default class MacaroonInspecter {
    private checks: (string | Function)[] = [];

    constructor() {

    }

    addExactCheck(key: string, value: string) {
        this.checks.push(`${key} = ${value}`);

        return this;
    }

    addVerifier(fn: ((caveat: string) => boolean) | CaveatVerifierInterface) {
        if (typeof fn === 'function') {
            this.checks.push(fn);
        } else {
            this.checks.push(fn.verify.bind(fn));
        }

        return this;
    }

    isValid(macaroon: Macaroon, secret: any) {
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
