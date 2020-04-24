
## Develop

- Install

  ```bash
  $ npm install
  $ npx bower install
  ```

- Configure

  Add the file `config/config.js` with:

  ```js
  module.exports = {
    app_id: "APP_ID_HERE",
    app_secret: "APP_SECRET_HERE",
    backends: [
      {
        name: "MyWheels Test (test.openwheels.nl)",
        url: "https://test.openwheels.nl",
        development: true
      },
      {
        name: "MyWheels Beta (openwheels.nl)",
        url: "https://openwheels.nl",
        production: true
      }
    ]
  };
  ```

- Run

  ```bash
  $ npx grunt server
  ```

- Optionally build, to figure out possible minification-resulting errors and the like

  ```bash
  $ npx grunt dist
  $ npx grunt test-dist
  ```

## Release

- Bump the version in `package.json` as well as `bower.json`
- Push and build in Jenkins
