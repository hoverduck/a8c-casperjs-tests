////////////////////////////////////////////////////////////////////////////////
// Cancel Purchase Test -- Using CasperJS with SlimerJS
//   Author	:	Scott Stancil
//   Date	:	08 July 2015
//   Description:	Cancels a purchased plan.  Requires a www.mailinator.com
//                      e-mail address, listed in the config.json file.
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Cancel Purchase Test Suite', function suite(test) {
  // Load the 'My Upgrades' page
//  casper.open('https://wordpress.com/my-upgrades');
//
//  casper.waitForText('Cancel this upgrade', function clickCancel() {
//    casper.clickLabel('Cancel this upgrade');
//  });
//
//  casper.waitForSelector('input.button-primary[type=submit]', function confirmCancel() {
//    casper.click('input.button-primary[type=submit]');
//  });
//
//  casper.then(function cancelMessage() {
//    casper.waitForText('You requested cancellation of a plan. Please check your email for a message with a confirmation link.');
//  });

  casper.open(casper.config.mailinator);

  var count = 0;
  casper.then(function countMail() {
    // Find out how many messages there are
    count = casper.evaluate(function evalCount() { return document.querySelectorAll('ul#mailcontainer li').length; }); 
  });

  casper.then(function loopThroughMail() {
    casper.repeat(count, function clickMail() {
      casper.click('div.mail-list li.message a');
      casper.waitForSelector('div.controls', function messageLoaded() {
        casper.withFrame('rendermail', function() {
          try {
            casper.clickLabel('Confirm Cancellation');

            casper.waitForPopup(/my-upgrades/, function verifyPopup() {
              test.assertEquals(casper.popups.length, 1);
            });
          
            casper.withPopup(/my-upgrades/, function verifySuccessMessage() {
              test.assertSelectorHasText('div.notice.success p', 'The upgrade has been cancelled as requested.');
            });

            casper.clickLabel('Delete', 'button');
          } catch(e) {
            casper.clickLabel('Delete', 'button');
          }
        });
      });
    });
  });

  casper.run();
  casper.then(function switchPlanDone() {
    casper.test.done();
  });
});
