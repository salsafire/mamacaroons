const MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder;
const MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;
const TimestampCaveatVerifier = require('macaroons.js').verifier.TimestampCaveatVerifier;

// create a simple macaroon first
var location = 'http://mybank/';
var secret = 'this is a different super-secret key; never use the same secret twice';
var publicIdentifier = 'we used our other secret key';


function send_to_3rd_party_location_and_do_auth(predicate: string) {
    return 'IdOf ' + predicate;
}

function getDischargeThirdPartyMacaroon(caveatKey: string, identifier: string) {
    return new MacaroonsBuilder('http://auth.mybank/', caveatKey, identifier)
        .add_first_party_caveat('time < 2019-01-01T00:00')
        .getMacaroon().serialize();
}


// add a 3rd party caveat
// you'll likely want to use a higher entropy source to generate this key
var randomCaveatKeyForThirdParty = `${Math.random()}`;

var identifier = send_to_3rd_party_location_and_do_auth('user = Alice');

var m = new MacaroonsBuilder(location, secret, publicIdentifier)
    .add_first_party_caveat('account = 3735928559')
    .add_third_party_caveat('http://auth.mybank/', randomCaveatKeyForThirdParty, identifier)
    .getMacaroon();

console.log(m.inspect());

const thirdPartyMacaroon = MacaroonsBuilder.deserialize(getDischargeThirdPartyMacaroon(randomCaveatKeyForThirdParty, identifier));
const thirdPartyVerifierMacaroon = MacaroonsBuilder.modify(m).prepare_for_request(thirdPartyMacaroon).getMacaroon();

new MacaroonsVerifier(m)
    .satisfyExact('account = 3735928559')
    .satisfyGeneral(TimestampCaveatVerifier)
    .satisfy3rdParty(thirdPartyVerifierMacaroon)
    .assertIsValid(secret);

export {};
