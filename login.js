////////////////////////////////////////////////////////////////////////////////
// Login Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	03 July 2015
//   Description:	This test logs into WordPress with the given
//			credentials, intended to be used as the first step in
//			a variety of tests.
//   Usage	:
//         casperjs --engine=slimerjs test cardDetectionTest.js \
//            --user=<username> --pass=<password>
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('WP.com Login', function suite(test) {
  // Load the sensitive info from config.json
  casper.config = require('config.json');

  // Set the viewport to something usable
  casper.options.viewportSize = { width : 1024, height : 768 };

  // Increase the wait timeout
  casper.options.waitTimeout = 30000

  // Load helper scripts
//  casper.options.clientScripts = ["include/jquery-1.11.3.min.js"];

  // Load the initial webpage
  casper.start('https://wordpress.com');

  // Login
  casper.then(function clickLogonLink() {
    this.click('.click-wpcom-login', 'a');
  });


  casper.waitForSelector('#loginform', function testLoginPageLoaded() {
    test.assertTitleMatch(/Log In/, 'Log in screen loads');
    this.fill('form#loginform', {
      'log' : casper.config.username,
      'pwd' : casper.config.password
    }, true);
  });

  // Reader is loaded, staging tag verified
  casper.waitForSelector('.my-sites a', function testReaderLoaded() {
    // Make sure this is the staging version
    test.assertExists('span.environment.is-staging', '"Staging" tag present');
    test.assertTitleMatch(/Following.*Reader/, 'Logged in successfully');
  });

  casper.run();
  casper.then(function loginDone() {
    casper.test.done();
  });
});

//////////////////////////////////////////
//////////// Global Functions //////////// 
//////////////////////////////////////////
casper.calypsoNavigateToUpgrades = function(test) {
  // Load the initial webpage
  casper.open('https://wordpress.com');

  // Page is loaded, click My Sites
  casper.waitForSelector('.my-sites a', function testReaderLoaded() {
    this.click('.my-sites a');
  });

  // My Sites is loaded, click Upgrades
  casper.waitForSelector('.upgrades a', function testStatsPageLoaded() {
    test.assertTitleMatch(/Stats/, 'My Sites page loaded');
    this.click('.upgrades a');
  });
};

casper.clickWhileSelector = function(selector) {
    return this.then(function() {
        if (this.exists(selector)) {
            this.click(selector);
            return this.clickWhileSelector(selector);
        }
        return;
    });
};

casper.clearCart = function(test) {
  casper.calypsoNavigateToUpgrades(test);

  casper.waitForSelector('div.popover-cart button.cart-toggle-button', function() {
    casper.click('div.popover-cart button.cart-toggle-button', 'Opening cart');
  });
  casper.waitForSelector('div.cart-buttons', function deleteCartItems() {
    if (casper.exists('li.cart-item button.remove-item')) {
      casper.clickWhileSelector('li.cart-item button.remove-item');
    }
  });
};
