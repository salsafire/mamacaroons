import { CaveatInterface, CaveatVerifierInterface } from './CaveatInterface';

export class AssignCaveatVerifier implements CaveatVerifierInterface {
    public values: any = {};

    verify(caveat: string) {
        const isAssign = caveat.indexOf('->') > -1;

        if (isAssign) {
            const [key, value] = caveat.split('->', 2);
            this.values[key.trim()] = value.trim();
        }

        return isAssign;
    }
}

export class AssignCaveat implements CaveatInterface {
    constructor(private key: string, private value: string) {

    }

    asString(): string {
        return this.key + ' -> ' + this.value;
    }
}
