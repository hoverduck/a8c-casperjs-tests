////////////////////////////////////////////////////////////////////////////////
// Switch Plan Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	03 July 2015
//   Description:	Cycles between Trial Premium, Full Premium, Trial
//			Business, Full Business, and ensures that there's only 
//			ever one in the cart at time, and the user is notified
//			of the changes between trial and full.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Switch Plan Test Suite', function suite(test) {
  casper.calypsoNavigateToUpgrades(test);

  // Start with an empty cart
  casper.clearCart(test);

  // Function to count the number of items in the cart - should always be 1
  var countCartItems = function() {
    test.assert(1 === casper.evaluate(function() {
      return document.querySelectorAll('li.cart-item').length;
    }), 'Cart has exactly 1 item');
  };

  // Function to select a plan and verify it appears in the cart by itself
  var choosePlan = function(selector, name, trial) {
    // Plan options are loaded, click Trial Premium Plan
    casper.waitForSelector(selector, function selectPlan() {
      casper.click(selector);
      casper.waitForSelector('div.cart-body', function verifyCart() {
        // The cart can take a second to fully update, so wait to be safe
        casper.wait(1000, function() {
          test.assertSelectorHasText('span.product-name', name);
          countCartItems();
          if (trial) {
            test.assertSelectorHasText('span.product-price', 'Free 14 Day Trial', 'Verified 14 Day Trial tag in cart');
          } else {
            test.assertSelectorDoesntHaveText('span.product-price', 'Free 14 Day Trial', 'Verified no 14 Day Trial tag in cart');
          }
        });
      });
    });
  };

  // Select Premium Trial
  casper.then(function() { choosePlan('div.value_bundle a.button.is-primary', 'Premium', true); });
  casper.then(function() { casper.calypsoNavigateToUpgrades(test); });

  // Select Premium Full, verify the user gets a note about the replacement
  casper.then(function() { choosePlan('div.value_bundle small a', 'Premium', false); });
  casper.waitForSelector('div.notice.is-error', function() {
    test.assertSelectorHasText('div.notice.is-error', 'You already had WordPress.com Premium (free trial) in your cart. We replaced it with the full version.', 'Notified user of Premium Trial->Full plan update');
    casper.calypsoNavigateToUpgrades(test);
  });

  // Go back to Premium Trial, verify the user gets a note about the replacement
  casper.then(function() { choosePlan('div.value_bundle a.button.is-primary', 'Premium', true); });
  casper.waitForSelector('div.notice.is-error', function() {
    test.assertSelectorHasText('div.notice.is-error', 'You already had WordPress.com Premium in your cart. We replaced it with the free trial.', 'Notified user of Premium Full->Trial plan update');
    casper.calypsoNavigateToUpgrades(test);
  });

  // Select Business Trial
  casper.then(function() { choosePlan('div.business-bundle a.button.is-primary', 'Business', true); });
  casper.then(function() { casper.calypsoNavigateToUpgrades(test); });

  // Select Business Full, verify the user gets a notification about the replacement
  casper.then(function() { choosePlan('div.business-bundle small a', 'Business', false); });
  casper.waitForSelector('div.notice.is-error', function() {
    test.assertSelectorHasText('div.notice.is-error', 'You already had WordPress.com Business (free trial) in your cart. We replaced it with the full version.', 'Notified user of Business Full->Trial plan update');
    casper.calypsoNavigateToUpgrades(test);
  });

  // Go back to Business Trial, verify the user gets a note about the replacement
  casper.then(function() { choosePlan('div.business-bundle a.button.is-primary', 'Business', true); });
  casper.waitForSelector('div.notice.is-error', function() {
    test.assertSelectorHasText('div.notice.is-error', 'You already had WordPress.com Business in your cart. We replaced it with the free trial.', 'Notified user of Business Full->Trial plan update');
  });

  casper.run();
  casper.then(function switchPlanDone() {
    casper.test.done();
  });
});
