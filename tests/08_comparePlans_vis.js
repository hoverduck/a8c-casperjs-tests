////////////////////////////////////////////////////////////////////////////////
// Visual Regression -- Using CasperJS with SlimerJS and PhantomCSS/ResembleJS
//   Author	:	Scott Stancil
//   Date		:	30Sep15
//   Description:	Runs through a very quick visual flow of opening the plans
//                      page and comparing various plans
////////////////////////////////////////////////////////////////////////////////
casper.test.begin('Plan Comparison Visual Regression', function suite(test) {
	casper.calypsoNavigateToUpgrades(test);

/*
  casper.then(selectPremium);
	casper.calypsoNavigateToUpgrades(test);
  casper.then(selectBusiness);
	casper.calypsoNavigateToUpgrades(test);
*/
  casper.then(comparePlans);

				function selectPremium() {
								var selector = '.value_bundle button';
							  casper.waitForSelector(selector, function testPlansPageLoaded() {
												casper.test.assertTitleMatch(/Plans/, 'Plans selection page loaded');
												casper.click(selector);
									      phantomcss.screenshot('#content', 'Purchase Premium Plan');
								});
				}

				function selectBusiness() {
								var selector = '.business-bundle button';
								casper.waitForSelector(selector, function testPlansPageLoaded() {
												casper.test.assertTitleMatch(/Plans/, 'Plans selection page loaded');
												casper.click(selector);
												phantomcss.screenshot('#content', 'Purchase Business Plan');
								});
				}

				function comparePlans() {
								var compareLink = 'a.compare-plans-link';
								casper.waitForSelector(compareLink, function testComparePlansPageLoaded() {
									casper.click(compareLink);
								});

								var selector = 'div.plans.main';
								casper.waitForSelector(selector, function comparePlansPageLoaded() {
												casper.test.assertTitleMatch(/Compare Plans/, 'Plan compare page loaded');
												phantomcss.screenshot(selector, 'Compare Plans');
								});
				}

  casper.then(function() { phantomcss.compareSession(); });

  casper.run();
  casper.then(function comparePlansDone() {
    casper.test.done();
  });
});
