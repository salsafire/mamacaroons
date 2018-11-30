import { CaveatInterface, CaveatVerifierInterface } from './CaveatInterface';

export class AssignArrayMergeCaveatVerifier implements CaveatVerifierInterface {
    public values: { [key: string]: string[] } = {};

    verify(caveat: string) {
        const isAssign = caveat.indexOf('-[]>') > -1;

        if (isAssign) {
            const [key, value] = caveat.split('-[]>', 2);
            const oldValues = this.values[key.trim()] ? this.values[key.trim()] : [];
            this.values[key.trim()] = oldValues.concat(JSON.parse(value.trim()));
        }

        return isAssign;
    }
}

export class AssignArrayMergeCaveat implements CaveatInterface {
    constructor(private key: string, private values: string[]) {

    }

    asString(): string {
        return this.key + ' -[]> ' + JSON.stringify(this.values);
    }
}
