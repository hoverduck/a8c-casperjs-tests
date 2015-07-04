////////////////////////////////////////////////////////////////////////////////
// Bad Credit Card Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	29 June 2015
//   Description:	This test suite logs into WordPress with the given
//			credentials and navigates to the Upgrades page, selects
//			the Business Plan (not the trial), and inputs a series
//			of bad information.  It verifies that the error
//			message is displayed for each invalid input.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Invalid Form Input Test Suite', function suite(test) {
  casper.calypsoNavigateToUpgrades(test);

  // Start with an empty cart
  casper.clearCart(test);

  // Plan options are loaded, click Upgrade Now (not trial) for Business Plan
  casper.waitForSelector('.business-bundle small a', function testPlansPageLoaded() {
    test.assertTitleMatch(/Plans/, 'Plans selection page loaded');
    casper.click('.business-bundle small a');
  });

  // Function to clear all fields
  var clearFields = function() {
    casper.sendKeys('#name', '',		{ reset : true });
    casper.sendKeys('#number', '',		{ reset : true });
    casper.sendKeys('#expiration-date', '',	{ reset : true });
    casper.sendKeys('#cvv', '',                 { reset : true });
    casper.sendKeys('#postal-code', '',		{ reset : true });
  };

  // Function to fill all fields with valid information, so they can be individually invalidated afterward
  //   -- Note: The CC# is from www.getcreditcardnumbers.com, and is only syntactically valid
  var fillFields = function() {
    casper.sendKeys('#name', 'Hortense Willomina',		{ reset : true });
    casper.sendKeys('#number', '4097966047889033',		{ reset : true });
    casper.sendKeys('#expiration-date', '01/20',		{ reset : true });
    casper.sendKeys('#cvv', '123',				{ reset : true });
    casper.sendKeys('div.country select', 'United States\n',	{ reset : true });
    casper.sendKeys('#postal-code', '58102',			{ reset : true });
  };

  // Function to verify the error message is displayed
  var verifyError = function(testName, errorArray) {
    casper.click('button.button-pay');
    casper.waitForSelector('div.notice.is-error', function () {
      for (var message in errorArray) {
        test.assertTextExists(errorArray[message], testName + " - " + errorArray[message]);
      }

      // Verify there are exactly as many errors as in errorArray
      var errorCount = casper.evaluate(function() {
        return document.querySelectorAll('div.notice.is-error li').length;
      });
      test.assert(errorArray.length === errorCount, 'Verify there are ' + errorArray.length + ' errors listed (' + errorCount + ' present)');

      // Close the error div and clean out the form
casper.wait(3000);
      casper.click('span.noticon-close-alt');
      clearFields();
    });
  };
 
  // Check error messages for a variety of inputs
  casper.waitForSelector('button.button-pay', function testNoName() {
    // Verify all errors are present on an empty form
    casper.then(function() { verifyError('Empty Form', ['Missing required Name on Card field',
                                                        'Missing required Card Number field',
                                                        'Card Number is invalid',
                                                        'Missing required Credit Card Expiration Date field',
                                                        'Credit Card Expiration Date is invalid',
                                                        'Missing required Credit Card CVV Code field',
                                                        'Credit Card CVV Code is invalid',
                                                        'Missing required Country field',
                                                        'Missing required Postal Code field']); });

    // Verify error when only Name is invalid
    casper.then(function() {
      fillFields();
      casper.sendKeys('#name', '', { reset : true });
      verifyError('Invalid Name Only', [ 'Missing required Name on Card field' ]);
    });

    // Attempt an invalid date
    casper.then(function() { casper.sendKeys('#expiration-date', '1520', { reset : true }); });
    casper.then(function() { verifyError('Invalid Expiration', [ 'Credit Card Expiration Date is invalid' ]); });
  });

  // Test typing text into the month and CVV fields, verify it's not even displayed
  casper.then(function checkNonNumeric() {
    casper.sendKeys('#expiration-date', '.@*Abc123.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#expiration-date', '12/30', 'Expiration date field accepts only numbers - No slash');
    casper.sendKeys('#expiration-date', '.@*Abc12/3.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#expiration-date', '12/30', 'Expiration date field accepts only numbers - Well-placed slash');
    casper.sendKeys('#expiration-date', '.@*Abc1/23.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#expiration-date', '12/30', 'Expiration date field accepts only numbers - Poorly-placed slash');
    casper.sendKeys('#cvv', '.@*Abc1234560#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#cvv', '1234', 'CVV field accepts only 4 numbers');
  });

  // Test a bad coupon code
  casper.then(function badCoupon() {
    var couponErrorString = "Sorry, but we were not able to find that coupon. Please check that you typed the coupon code correctly and that this coupon is for the product you have selected.";

    if (this.exists('.cart-coupon a')) {
      casper.click('.cart-coupon a');
    }

    casper.waitForSelector('.cart-coupon form input[type=text]', function() {
      // First clear the coupon field and click Apply to make sure any old coupons are removed
      casper.sendKeys('.cart-coupon form input[type=text]', '', { reset : true });
      casper.click('.cart-coupon form button');

      // Input coupon
      casper.sendKeys('.cart-coupon form input[type=text]', 'thisisabadcoupon!!!', { reset : true });
      casper.click('.cart-coupon form button');
    });

// This fails if the viewport can't see the cart contents div
// TODO - Force it into view before executing this test
    casper.then(function() {
      casper.waitForSelector('div.notice.is-error', function badCouponCode() {
        test.assertTextExists(couponErrorString, 'Invalid coupon code');
        casper.click('span.noticon-close-alt');
      });     
    });
  });

  // Test a good coupon code
  casper.then(function goodCoupon() {
    var couponCode = 'GOOD-COUPON-CODE';
    var couponSuccessString = 'Coupon discount applied to cart.';

    if (this.exists('.cart-coupon a')) {
      casper.click('.cart-coupon a');
    }
 
    casper.waitForSelector('.cart-coupon form input[type=text]', function() {
      // Get the current price, stripping out any non-numeric characters
      var originalPrice = this.fetchText('div.cart-body div.secondary-details span.product-price').replace(/[^0-9.]/g, '');

      // First clear the coupon field and click Apply to make sure any old coupons are removed
      casper.sendKeys('.cart-coupon form input[type=text]', '', { reset : true });
      casper.click('.cart-coupon form button');

      // Input coupon
      casper.sendKeys('.cart-coupon form input[type=text]', couponCode, { reset : true });
      casper.click('.cart-coupon form button');

      casper.waitForSelector('div.notice.is-success', function goodCouponCode() {
        test.assertTextExists(couponSuccessString, 'Valid coupon code');
        // Get the new price, stripping out any non-numeric characters
        var newPrice = this.fetchText('div.cart-body div.secondary-details span.product-price').replace(/[^0-9.]/g, '');
        test.assert(newPrice == originalPrice / 2, 'Price is discounted by 50%');
        casper.click('span.noticon-close-alt');
      });     
    });
  });

  casper.run();
  casper.then(function allDone() {
    casper.test.done();
  });
});
