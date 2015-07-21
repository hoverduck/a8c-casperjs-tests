////////////////////////////////////////////////////////////////////////////////
// Cancel Plan Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	08 July 2015
//   Description:	Cancels a purchased plan.  Requires a www.mailinator.com
//                      e-mail address, listed in the config.json file.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Cancel Plan Test Suite', function suite(test) {
  // Load the 'My Upgrades' page
  casper.open('https://wordpress.com/my-upgrades');

  casper.waitForText('Cancel and Refund', function clickCancel() {
    casper.clickLabel('Cancel and Refund');
  });

  casper.waitForSelector('input.button-primary[type=submit]', function confirmCancel() {
    casper.click('input.button-primary[type=submit]');
  });

  casper.then(function cancelMessage() {
    casper.waitForText('You requested cancellation of a plan. Please check your email for a message with a confirmation link.');
  });

  casper.thenOpen(casper.config.mailinator);

  var count = 0;
  casper.then(function countMail() {
    // Find out how many messages there are
    count = casper.evaluate(function evalCount() { return document.querySelectorAll('ul#mailcontainer li').length; }); 
  });

  var cancelURL = "http://google.com"; // Fake URL to drive failure if not replaced
  casper.then(function loopThroughMail() {
    casper.repeat(count, function clickMail() {
      casper.click('div.mail-list li.message a');
      casper.waitForSelector('div.controls', function messageLoaded() {
        try {
          casper.withFrame('rendermail', function() {
            cancelURL = casper.getElementAttribute('a.renew-button', 'href');
          });
        } catch(e) {
          casper.click('div.header div.btn-group button+button+button');
        }
      });

      if (cancelURL !== "http://google.com") return; // break out of the repeat loop
    });
  });

  casper.then(function() {
    casper.open(cancelURL).then(function cancelURLOpened() {
      test.assertSelectorHasText('div.notice.success p', 'Upgrade cancelled and refunded. The refund may take up to 7 days days to appear in your PayPal/bank/credit card account.');
    });
  });

  casper.run();
  casper.then(function cancelPlanDone() {
    casper.test.done();
  });
});
