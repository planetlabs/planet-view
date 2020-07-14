# Planet View

Planet View displays a beautiful satellite image from Planet every time you open a new tab.

## Getting started

Installing is easy. Find the ["Planet View" extension](https://chrome.google.com/webstore/detail/planet-view/hhhgdbldiopbpblfcohjaeinjjciplho) in the Chrome Web Store.  Click the "+ Free" button to install the extension.  Voila.

[![installation](https://cloud.githubusercontent.com/assets/41094/5092854/d2eb189c-6f0f-11e4-9f1c-6b45ebbfa44e.gif)](https://chrome.google.com/webstore/detail/planet-view/hhhgdbldiopbpblfcohjaeinjjciplho)

## Development

The development environment requires [Node](http://nodejs.org/).  To serve a development version of the extension, run the following:

    npm start

To test a built version of the extension, first run the build script:

    npm run build

From testing in Chrome, open [the extensions page](chrome://extensions/), and load the `./dist` directory as an unpacked extension.

For testing in Firefox, open [the debuggong page](about:debugging#/runtime/this-firefox), and under "This Firefox", click "Load Temporary Add-on..." and select the `./dist/manifest.json` file.

## Publishing

To create a release, decide whether your changes constitute a major, minor, or patch release, and then run something like the following:

    make minor release

This updates the version numbers in the `package.json` and `src/manifest.json` files, creates a commit for the new version number, tags this commit, and creates the `extension.zip` archive.  Assuming everything looks right, push the version bump commit and the new tag:

    git push --tags origin master

Next, the `extension.zip` archive needs to be uploaded to the Chrome Web Store.  This requires a [developer account](https://chrome.google.com/webstore/developer/dashboard) that has been added to the Planet Labs publisher group.  Contact one of the current authors to be added to the group.  After uploading the newly created `extension.zip`, it can take up to an hour for the new version to be [published](https://chrome.google.com/webstore/detail/planet-view/hhhgdbldiopbpblfcohjaeinjjciplho).

![Current Status](https://github.com/planetlabs/planet-view/workflows/Test/badge.svg)

## License

[Apache 2](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0))
