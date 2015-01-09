Template.configureLoginServiceDialogForCentiq.helpers({
  siteUrl: function () {
    return Meteor.absoluteUrl();
  }
});

Template.configureLoginServiceDialogForCentiq.fields = function () {
  return [
    {property: 'clientId', label: 'Client ID'},
    {property: 'secret', label: 'Client secret'},
    {property: 'authEndpoint', label: 'Auth Endpoint URI'},
    {property: 'tokenEndpoint', label: 'Token Endpoint URI'}
  ];
};
