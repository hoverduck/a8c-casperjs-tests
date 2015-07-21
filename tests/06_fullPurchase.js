////////////////////////////////////////////////////////////////////////////////
// Business Plan Purchase Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	08 July 2015
//   Description:	Purchases a Business Plan on a valid credit card using a
//			coupon from the config.json file.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Business Plan Purchase Test Suite', function suite(test) {
  casper.calypsoNavigateToUpgrades(test);

  // Start with an empty cart
  casper.clearCart(test);

  casper.waitForSelector('div.business-bundle small a', function clickBusinessTrial() {
    casper.click('div.business-bundle small a');
  });

  casper.waitForSelector('button.button-pay', function fillForm() {
    // Fill out the form with info from the config.json file
    casper.then(function() { casper.sendKeys('#name',		casper.config.name,		{ reset : true }) });
    casper.then(function() { casper.sendKeys('#number',		casper.config.cc,		{ reset : true }) });
    casper.then(function() { casper.sendKeys('#expiration-date',	casper.config.expDate,		{ reset : true }) });
    casper.then(function() { casper.sendKeys('#cvv',		casper.config.cvv,		{ reset : true }) });
    casper.then(function() { casper.click('div.checkout-field.country'); });
    casper.waitForText('Select Country', function() {
      casper.sendKeys('div.checkout-field.country select', 'United States\n',	{ reset : true });
    });
    casper.then(function() { casper.sendKeys('#postal-code',	casper.config.postalCode,	{ reset : true }) });

    // The country takes a while to load, so wait for that then click the order button
    casper.waitForSelectorTextChange('div.country select', function() {
      casper.wait(10000, function() {
        casper.click('button.button-pay');
      });
    });

    casper.waitForSelector('div.thank-you-message', function thankYou() {
      var message = 'Thank you for your purchase!';
      
      test.assertSelectorHasText('div.thank-you-message', message, 'Thank you message displayed');
    });
  });

  casper.run();
  casper.then(function purchasePlanDone() {
    casper.test.done();
  });
});
