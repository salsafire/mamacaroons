import { CaveatInterface } from './CaveatInterface';

export class TimeCaveatVerifier {
    static getVerifyer() {
        return require('macaroons.js').verifier.TimestampCaveatVerifier;
    }
}


export class TimeCaveat implements CaveatInterface {
    constructor(private beforeDate: Date) {

    }

    asString(): string {
        return 'time < ' + this.beforeDate.toISOString();
    }
}
