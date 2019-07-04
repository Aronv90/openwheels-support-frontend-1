/**
* This file/module contains all configuration for the build process.
*/
module.exports = {
    /**
    * The `build_dir` folder is where our projects are compiled during
    * development and the `compile_dir` folder is where our app resides once it's
    * completely built.
    */
    src_dir: 'src',
    build_dir: 'build',
    compile_dir: 'bin',
    vendor_dir: 'vendor',

    /**
    * This is a collection of file patterns that refer to our app code (the
    * stuff in `src/`). These file paths are used in the configuration of
    * build tasks. `js` is all project javascript, less tests. `ctpl` contains
    * our reusable components' (`src/common`) template HTML files, while
    * `atpl` contains the same, but for our app's code. `html` is just our
    * main HTML file, `less` is our main stylesheet, and `unit` contains our
    * app's unit tests.
    */
    app_files: {
        js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
        jsunit: [ 'src/**/*.spec.js' ],

        atpl: [ 'src/app/**/*.tpl.html' ],
        ctpl: [ 'src/common/**/*.tpl.html' ],

        html: [ 'src/index.html' ],
        less: 'src/less/main.less',

        htaccess: 'src/.htaccess'
    },

    /**
    * This is a collection of files used during testing only.
    */
    test_files: {
        js: [
            'vendor/angular-mocks/angular-mocks.js'
        ]
    },

    /**
    * This is the same as `app_files`, except it contains patterns that
    * reference vendor code (`vendor/`) that we need to place into the build
    * process somewhere. While the `app_files` property ensures all
    * standardized files are collected for compilation, it is the user's job
    * to ensure non-standardized (i.e. vendor-related) files are handled
    * appropriately in `vendor_files.js`.
    *
    * The `vendor_files.js` property holds files to be automatically
    * concatenated and minified with our project source files.
    *
    * The `vendor_files.css` property holds any CSS files to be automatically
    * included in our app.
    *
    * The `vendor_files.assets` property holds any assets to be copied along
    * with our app's assets. This structure is flattened, so it is not
    * recommended that you use wildcards.
    */
    vendor_files: {
        js: [
            'vendor/underscore/underscore.js',
            'vendor/jquery/dist/jquery.js',
            'vendor/jquery/jquery.js',
            'vendor/jquery-ui/jquery-ui.js',
            'vendor/underscore.string/lib/underscore.string.js',
            'vendor/angular/angular.js',
            'vendor_custom/angular-locale/angular-locale_nl-nl.js',
            'vendor/angular-local-storage/dist/angular-local-storage.js',
            'vendor/angular-simple-logger/dist/angular-simple-logger.js',
            'vendor/angular-uuid/uuid.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
            'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-ui-utils/modules/unique/unique.js',
            'vendor/angular-sanitize/angular-sanitize.js',
            'vendor/angular-jsonrpc/build/jsonrpc.js',
            'vendor/momentjs/moment.js',
            'vendor_custom/moment-locale/moment-locale_nl.js',
            'vendor/pickadate/lib/picker.js',
            'vendor/pickadate/lib/picker.date.js',
            'vendor/pickadate/lib/picker.time.js',
            'vendor/pickadate/lib/translations/nl_NL.js',
            'vendor/bootstrap/js/collapse.js',
            'vendor/bootstrap/js/dropdown.js',
            'vendor/angular-moment/angular-moment.js',
            'vendor/angular-dragdrop/src/angular-dragdrop.js',
            'vendor/ngprogress/build/ngprogress.js',
            'vendor/angular-percentage-filter/percentage.js',
            'vendor/angular-google-maps/dist/angular-google-maps.js',
            'vendor/angular-translate/angular-translate.js',
            'vendor/headroom.js/dist/headroom.js',
            'vendor/headroom.js/dist/angular.headroom.js',
            'vendor/ngAutocomplete/src/ngAutocomplete.js',
            'vendor/ng-file-upload/ng-file-upload.js',
            'vendor/ng-table/dist/ng-table.js',
            'vendor/angular-google-chart/ng-google-chart.js',
            'vendor/ng-infinite-scroll-npm-is-better-than-bower/build/ng-infinite-scroll.js',
            'vendor/angular-material/angular-material.js',
            'vendor/angular-animate/angular-animate.js',
            'vendor/angular-aria/angular-aria.min.js',
            'vendor_custom/marked.js',
            //'vendor/openwheels-ui-components/dist/js/openwheels-ui-components.min.js'
        ],
        css: [
          'vendor/ng-table/ng-table.css',
          'vendor/openwheels-ui-components/dist/css/openwheels-ui-components.css',
          'vendor/angular-material/angular-material.css'
        ],
        assets: [
            'vendor/font-awesome/fonts/*'
        ]
    }
};
