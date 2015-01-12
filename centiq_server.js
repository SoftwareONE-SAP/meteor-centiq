Centiq = {};
Centiq.whitelistedFields = ['account_id', 'email', 'firstname', 'lastname', 'name', 'profile_image', 'country', 'salutation'];

OAuth.registerService('centiq', 2, null, function(query) {
    var response = getTokens(query);
    var accessToken = response.accessToken;
    var identity = getIdentity(accessToken);

    var serviceData = {
        accessToken: accessToken,
        expiresAt: (+new Date) + (1000 * response.expiresIn)
    };

    _.extend(serviceData, _.pick(identity, Centiq.whitelistedFields));

    // only set the token in serviceData if it's there. this ensures
    // that we don't lose old ones (since we only get this on the first
    // log in attempt)
    if (response.refreshToken) {
        serviceData.refreshToken = response.refreshToken;
    }
    serviceData.id = +serviceData.account_id;
    return {
        serviceData: serviceData,
        options: {
            profile: {
                name: identity.name
            }
        }
    };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
var getTokens = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'centiq'});
    if (!config)
        throw new ServiceConfiguration.ConfigError();

    var endpoint = (config.tokenEndpoint || "https://accounts.centiq.co.uk/oauth/token");

    var response;
    try {
        response = HTTP.post(
            endpoint, {params: {
            code: query.code,
            client_id: config.clientId,
            client_secret: OAuth.openSecret(config.secret),
            redirect_uri: OAuth._redirectUri('centiq', config),
            grant_type: 'authorization_code'
        }});
    } catch (err) {
        throw _.extend(new Error("Failed to complete OAuth handshake with Centiq. " + err.message),
                   {response: err.response});
    }

    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error("Failed to complete OAuth handshake with Centiq. " + response.data.error);
    } else {
        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in
        };
    }
};

var getIdentity = function(accessToken) {
    var config = ServiceConfiguration.configurations.findOne({service: 'centiq'});
    if (!config)
        throw new ServiceConfiguration.ConfigError();

    var endpoint = (config.apiEndpoint || "https://api.centiq.co.uk") + "/user/me";

    var identityObject,
        accountObject,
        profileObject;

        console.log(accessToken, endpoint);

    try {
        identityObject = HTTP.get(
            endpoint,
            {
                params: {
                    access_token: accessToken
                }
            }
        ).data;

        accountObject = _.pick(identityObject.account, Centiq.whitelistedFields);
        profileObject = _.pick(identityObject.profile, Centiq.whitelistedFields);
        profileObject.name = identityObject.profile.displayname;
        return _.extend(accountObject, profileObject);
    } catch (err) {
        throw _.extend(new Error("Failed to fetch identity from Centiq. " + err.message), {response: err.response});
    }
};


Centiq.retrieveCredential = function(credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
