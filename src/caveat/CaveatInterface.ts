export interface CaveatInterface {
    asString(): string;
}

export interface CaveatVerifierInterface {
    verify(caveat: string): boolean;
}
