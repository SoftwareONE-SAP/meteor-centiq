Package.describe({
  summary: "Centiq OAuth flow",
  version: "1.0.1",
  git: "https://bitbucket.org/centiq-ltd/meteor-package-centiq"
});

Package.onUse(function(api) {
  api.versionsFrom("METEOR@0.9.0");
  api.use('accounts-ui', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use(['underscore', 'service-configuration'], ['client', 'server']);
  api.use(['random', 'templating'], 'client');

  api.export('Centiq');

  api.addFiles(
    ['centiq_configure.html', 'centiq_configure.js'],
    'client');

  api.addFiles('centiq_server.js', 'server');
  api.addFiles('centiq_client.js', 'client');
});
