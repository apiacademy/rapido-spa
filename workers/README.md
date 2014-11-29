Web workers must be loaded through a URL, but the ember-cli build process combines all javascript files
into a single vendor.js.

This directory holds web workers that will be copies into the workers directory.

For example, the Ace editor includes workers that cannot be loaded through vendor.js
