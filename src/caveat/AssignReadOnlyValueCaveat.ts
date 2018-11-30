import { CaveatInterface, CaveatVerifierInterface } from './CaveatInterface';

const SIGN = '-!>';


export class AssignReadOnlyValueCaveatVerifier implements CaveatVerifierInterface {
    public values: any = {};

    verify(caveat: string) {
        const isAssign = caveat.indexOf(SIGN) > -1;

        if (isAssign) {
            const [key, value] = caveat.split(SIGN, 2);
            if (this.values[key.trim()]) {
                // throw new Error(`"${key}" was assigned more than once`);
                return false;
            }
            this.values[key.trim()] = value.trim();
        }

        return isAssign;
    }
}

export class AssignReadOnlyValueCaveat implements CaveatInterface {
    constructor(private key: string, private value: string) {

    }

    asString(): string {
        return this.key + ' ' + SIGN + ' ' + this.value;
    }
}
