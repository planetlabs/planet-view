# Planet View

Planet View displays a beautiful satellite image from Planet every time you open a new tab.

## Getting started

Installing is easy. The "Planet View" extension is available for both Firefox and Chrome:

 * [Planet View for Firefox](https://addons.mozilla.org/en-US/firefox/addon/planet-view/)
 * [Planet View for Chrome](https://chrome.google.com/webstore/detail/planet-view/hhhgdbldiopbpblfcohjaeinjjciplho)

Follow the instructions on the pages above to add the extension to your browser.  After installing, you'll see an image from the Planet gallery every time you open a new tab.

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

    git push --tags origin main

Next, the `extension.zip` archive needs to be uploaded to the Chrome Web Store and Firefox Add-on Developer Hub.  Publishing the Chrome extension requires a [developer account](https://chrome.google.com/webstore/developer/dashboard) that has been added to the Planet Labs publisher group.  Contact one of the current authors to be added to the group.  After uploading the newly created `extension.zip`, it can take up to an hour for the new version to be published.

 * [Chrome Extension](https://chrome.google.com/webstore/detail/planet-view/hhhgdbldiopbpblfcohjaeinjjciplho).
 * [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/planet-view/)

![Current Status](https://github.com/planetlabs/planet-view/workflows/Test/badge.svg)

## License

[Apache 2](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0))
