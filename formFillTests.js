////////////////////////////////////////////////////////////////////////////////
// Bad Credit Card Test -- Using CasperJS with PhantomJS/SlimerJS
//   Author	:	Scott Stancil
//   Date	:	29 June 2015
//   Description:	This test suite logs into WordPress with the given
//			credentials and navigates to the Upgrades page, selects
//			the Business Plan (not the trial), and inputs a series
//			of bad information.  It verifies that the error
//			message is displayed for each invalid input.
//   Usage	:
//         casperjs --auto-exit=no [--engine=slimerjs] test badInputTest.js \
//            --user=<username> --pass=<password>
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Bad CC # Test', function suite(test) {
  // Check/Set username and password arguments
  casper.test.assert(casper.cli.has('user') && casper.cli.has('pass'), 'Supply --user and --pass arguments');
  var username = casper.cli.get('user');
  var password = casper.cli.get('pass');

  // Load the initial webpage
  casper.start('https://wordpress.com');

  // Login
  casper.then(function clickLogonLink() {
    this.click('.click-wpcom-login', 'a');
  });


  casper.waitForSelector('#loginform', function testLoginPageLoaded() {
    test.assertTitleMatch(/Log In/, 'Log in screen loads');
    this.fill('form#loginform', {
      'log' : username,
      'pwd' : password
    }, true);
  });

  // Reader is loaded, click My Sites
  casper.waitForSelector('.my-sites a', function testReaderLoaded() {
    // Make sure this is the staging version
    test.assertExists('span.environment.is-staging', '"Staging" tag present');
    test.assertTitleMatch(/Following.*Reader/, 'Logged in successfully');
    this.click('.my-sites a');
  });

  // My Sites is loaded, click Upgrades
  casper.waitForSelector('.upgrades a', function testStatsPageLoaded() {
    test.assertTitleMatch(/Stats/, 'My Sites page loaded');
    this.click('.upgrades a');
  });

  // Plan options are loaded, click Upgrade Now (not trial) for Business Plan
  casper.waitForSelector('.business-bundle small a', function testPlansPageLoaded() {
    test.assertTitleMatch(/Plans/, 'Plans selection page loaded');
    casper.click('.business-bundle small a');
  });

  // Function to verify the error message is displayed
  var verifyError = function(testName, errorArray) {
    casper.click('button.button-pay');
    casper.waitForSelector('div.notice.is-error', function () {
      for (var message in errorArray) {
        test.assertTextExists(errorArray[message], testName + " - " + errorArray[message]);
      }
      casper.click('span.noticon-close-alt');
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
    // Attempt an invalid date
    casper.then(function() { casper.sendKeys('#expiration-date', '1520', { reset : true }); });
    casper.then(function() { verifyError('Invalid Expiration', [ 'Credit Card Expiration Date is invalid' ]); });
  });

  // Test typing text into the month and CVV fields, verify it's not even displayed
  casper.then(function checkNonNumeric() {
    casper.sendKeys('#expiration-date', 'Abc123.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#expiration-date', '12/30', 'Expiration date field accepts only numbers - No slash');
    casper.sendKeys('#expiration-date', 'Abc12/3.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#expiration-date', '12/30', 'Expiration date field accepts only numbers - Well-placed slash');
    casper.sendKeys('#expiration-date', 'Abc1/23.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#expiration-date', '12/30', 'Expiration date field accepts only numbers - Poorly-placed slash');
    casper.sendKeys('#cvv', 'Abc123456.@*0#!\'\\', { reset : true });
    casper.test.assertSelectorHasText('#cvv', '1234', 'CVV field accepts only 4 numbers');
  });

  // Test a bad coupon code
  casper.then(function badCoupon() {
    var couponErrorString = "Sorry, but we were not able to find that coupon. Please check that you typed the coupon code correctly and that this coupon is for the product you have selected.";

    if (this.exists('.cart-coupon a')) {
      casper.click('.cart-coupon a');
    }

    casper.waitForSelector('.cart-coupon form input[type=text]', function() {
      casper.sendKeys('.cart-coupon form input[type=text]', 'thisisabadcoupon!!!', { reset : true });
      casper.click('.cart-coupon form button');
    });

// NOTE - This fails if the SlimerJS viewport can't see the cart contents div
    casper.then(function() {
      casper.waitForSelector('div.notice.is-error', function badCouponCode() {
        test.assertTextExists(couponErrorString, 'Invalid coupon code');
        casper.click('span.noticon-close-alt');
      });     
    });
  });

  // Test a good coupon code
  casper.then(function goodCoupon() {
    var couponCode = '***REMOVED***';
    var couponSuccessString = 'Coupon discount applied to cart.';

    if (this.exists('.cart-coupon a')) {
      casper.click('.cart-coupon a');
    }
 
    casper.waitForSelector('.cart-coupon form input[type=text]', function() {
      // Get the current price, stripping out any non-numeric characters
      var originalPrice = this.fetchText('div.cart-body div.secondary-details span.product-price').replace(/[^0-9]/g, '');
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

//casper.wait(5000, function() { casper.echo("I waited"); });
