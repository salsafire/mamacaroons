import { CaveatInterface, CaveatVerifierInterface } from './CaveatInterface';

export class ExchangeCaveatVerifier implements CaveatVerifierInterface {
    public values: any = {};

    constructor(private exchange: string, private action: string) {

    }

    verify(caveat: string) {
        const CAVEAT_PREFIX = 'exchange = ';
        const CAVEAT_PREFIX_LEN = CAVEAT_PREFIX.length;


        if (caveat.startsWith(CAVEAT_PREFIX)) {
            const listAsString = caveat.substr(CAVEAT_PREFIX_LEN).trim();
            const list = listAsString.split(',');
            return list.findIndex(s => {
                return s.includes(`${this.exchange}:${this.action}`);
            }) > -1;
        }
        return false;
    }
}


export class ExchangeCaveat implements CaveatInterface {
    constructor(private exchanges: string[]) {

    }

    asString(): string {
        return 'exchange = ' + this.exchanges.join(',');
    }
}
