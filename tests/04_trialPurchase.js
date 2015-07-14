////////////////////////////////////////////////////////////////////////////////
// Trial Purchase Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	08 July 2015
//   Description:	Purchases a Business Plan Trial on a valid credit card using a
//			coupon from the config.json file.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Trial Purchase Test Suite', function suite(test) {
  casper.calypsoNavigateToUpgrades(test);

  // Start with an empty cart
  casper.clearCart(test);

  casper.waitForSelector('div.business-bundle a.button.is-primary', function clickBusinessTrial() {
    casper.click('div.business-bundle a.button.is-primary');
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
      var message = 'Thank you for trying WordPress.com Business!';
      
      test.assertSelectorHasText('div.thank-you-message', message, 'Thank you message displayed');
    });
  });

  casper.run();
  casper.then(function switchPlanDone() {
    casper.test.done();
  });
});
