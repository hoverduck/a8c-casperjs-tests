////////////////////////////////////////////////////////////////////////////////
// Credit Card Detection Test -- Using CasperJS with PhantomJS/SlimerJS
//   Author	:	Scott Stancil
//   Date	:	18 June 2015
//   Description:	This test suite presumes you are logged into WP.com
//			(via the 00_login.js test), navigates to the Upgrades
//			page, selects the Business Plan (not the trial), and
//			inputs a variety of credit card numbers.  It verifies
//			that the appropriate classes are added (and thus which
//			images are displayed) for each brand of credit card.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('CC Image Test', function suite(test) {
  casper.calypsoNavigateToUpgrades(test);


  // Plan options are loaded, click Upgrade Now (not trial) for Business Plan
  var selector = '.business-bundle button';
  casper.waitForSelector(selector, function testPlansPageLoaded() {
    test.assertTitleMatch(/Plans/, 'Plans selection page loaded');
    casper.click(selector);
  });

  // Verify that the CC# field maxes out at 16 digits
  casper.waitForSelector('#number', function checkMaxDigits() {
    casper.sendKeys('#number', '0000000000000000', { reset : true });
    casper.test.assertSelectorHasText('#number', '0000 0000 0000 0000', 'CC# field can hold 16 digits');
    casper.sendKeys('#number', '00000000000000000', { reset : true });
    casper.test.assertSelectorHasText('#number', '0000 0000 0000 0000', 'CC# field can not hold 17 digits');
  });

  // Verify that the CC# field won't accept non-numeric characters
  casper.then(function checkNonNumeric() {
    casper.sendKeys('#number', 'Abc123.@*#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#number', '123', 'Number field accepts only numbers');
  });

  // Verify that each accepted card logo appears when a compatible number is input
  // and that the logo is not there when an incompatible number is input
  var verifyCCNumbers = function(cardName, positiveTests, negativeTests) {
    for (var num in positiveTests) {
      casper.sendKeys('#number', positiveTests[num].toString(), { reset : true });
      casper.test.assertExists('div.number.' + cardName.toLowerCase(), cardName + ' starts with ' + positiveTests[num]);
    }
    for (var num in negativeTests) {
      casper.sendKeys('#number', negativeTests[num].toString(), { reset : true });
      casper.test.assertDoesntExist('div.number.' + cardName.toLowerCase(), cardName + ' doesn\'t start with ' + negativeTests[num]);
    }
  }

  // Test each credit card type.  Valid ranges taken from https://goo.gl/eabyvs
  // Discover - 16 digits, starts with 6011, 622126-622925, 644-649, 65
  casper.then(function checkDiscoverCards() {
    var discoverPositiveTests = [ 6011, 622126, 622925, 644, 645, 646, 647, 648, 649, 65 ];
    var discoverNegativeTests = [ 6012, 66, 622926, 643 ];
    verifyCCNumbers('Discover', discoverPositiveTests, discoverNegativeTests);
  });

  // Visa - 13 or 16 digits, starts with 4
  casper.then(function checkVisaCards() {
    var visaPositiveTests = [ 4, 4000000000000,  4000000000000000 ];
    var visaNegativeTests = [ 3, 40000000000000, 400000000000000];
    verifyCCNumbers('Visa', visaPositiveTests, visaNegativeTests);
  });

  // MasterCard - 16 digits, starts with 51-55
  casper.then(function checkMasterCardCards() {
    var mastercardPositiveTests = [ 51, 52, 53, 54, 55 ];
    var mastercardNegativeTests = [ 50, 56 ];
    verifyCCNumbers('MasterCard', mastercardPositiveTests, mastercardNegativeTests);
  });

  // American Express - 15 digits, starts with 34 or 37
  casper.then(function checkAmexCards() {
    var amexPositiveTests = [ 34, 37, 370000000000000 ];
    var amexNegativeTests = [ 3700000000000000, 3 ];
    verifyCCNumbers('Amex', amexPositiveTests, amexNegativeTests);
  });

  casper.run();
  casper.then(function cardImageTestDone() {
    casper.test.done();
  });
});

