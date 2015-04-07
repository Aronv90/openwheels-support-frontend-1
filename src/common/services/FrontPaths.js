'use strict';

angular.module('front.paths', [])
.constant('FRONT_DASHBOARD', '/dashboard')
.constant('FRONT_USER_DATA', '/dashboard/gegevens')
.constant('FRONT_USER_RESOURCES', '/dashboard/autos')
.constant('FRONT_USER_INVOICEGROUP', '/dashboard/facturen-verzamel')
.constant('FRONT_TRIP_OVERVIEW', '/dashboard/ritten')
.constant('FRONT_DRIVERLICENSE', '/license/')

.constant('FRONT_RENT', '/auto-huren')

.constant('FRONT_SWITCHUSER', '?_als_gebruiker=')

.constant('API_PATH', '/api/')

.constant('OAUTH_PATH', '/oauth/v2/auth')
.constant('LOGOUT_PATH', '/logout')
.constant('REFRESH_TOKEN_PATH', '/oauth/v2/token');
