'use strict';

angular.module('settingsService', ['LocalStorageModule'])
	.factory('settingsService', function (jsonrpc, localStorageService, ENV, appConfig, API_PATH) {

		var SETTINGS_STORAGE_NAME = 'OpenwheelsBackofficeSettings';

    /**
     * Default server: pick first available for current environment
     */
    var firstEntry;
    var defaultServer;
    angular.forEach(appConfig.backends, function (backend) {
      if (defaultServer) { return; }
      if (!firstEntry) { firstEntry = backend; }
      if (ENV === 'development' && backend.development) { defaultServer = backend.url; }
      if (ENV === 'production' && backend.production) { defaultServer = backend.url; }
    });

    // fallback to first entry
    if (!defaultServer) {
      console.warn('No backend explicitly configured for environment "' + ENV + '", using first as the default');
      defaultServer = firstEntry.url;
    }

		var defaults = {
			server: defaultServer,
			ringerPopups: false
		};

    /**
     * Try get settings from local storage
     */
    var settings;
    var stored = localStorageService.get(SETTINGS_STORAGE_NAME);
    if (stored) {
      console.info('Load settings from local storage');
      settings = stored;
    } else {
      console.info('No settings in local storage, use defaults');
      settings = defaults;
    }

    /**
     * Validate
     */
    if (settings.server) {
      console.info('Using backend ' + settings.server);
      jsonrpc.setBasePath(settings.server + API_PATH);
    } else {
      console.warn('Backend server not set');
      jsonrpc.setBasePath(null);
    }

    var prevServerSetting = settings.server;

		var save = function save() {
			localStorageService.add(SETTINGS_STORAGE_NAME, settings);
      if (prevServerSetting !== settings.server) {
        console.info('Switched to backend ' + settings.server);
      }
      prevServerSetting = settings.server;
		};

		return {settings: settings, save: save};
	});
