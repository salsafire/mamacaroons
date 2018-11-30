import { CaveatInterface, CaveatVerifierInterface } from './CaveatInterface';

export class AssignArrayIntersectCaveatVerifier implements CaveatVerifierInterface {
    public values: { [key: string]: string[] } = {};

    verify(caveat: string) {
        const isAssign = caveat.indexOf('-[]!>') > -1;

        if (isAssign) {
            const [key, value] = caveat.split('-[]!>', 2);
            if (!this.values[key.trim()]) {
                this.values[key.trim()] = JSON.parse(value.trim());
            } else {
                const newValues: Array<string> = JSON.parse(value.trim());
                this.values[key.trim()] = this.values[key.trim()]
                    .filter(value => newValues.includes(value));
            }
        }

        return isAssign;
    }
}

export class AssignArrayIntersectCaveat implements CaveatInterface {
    constructor(private key: string, private values: string[]) {

    }

    asString(): string {
        return this.key + ' -[]!> ' + JSON.stringify(this.values);
    }
}
