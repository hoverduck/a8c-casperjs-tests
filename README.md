# a8c-casperjs-tests
A repo to hold the CasperJS/SlimerJS test suite I'm building for Automattic to
test the process of purchasing a Business Plan.  The login.js script contains
the logic to log into wordpress.com and navigate to the Upgrades screen, as well
as a few global variables and functions.  The tests/ directory contains all of
the individual test files.  They can be called individually, or as a group.

Note: You must edit the config.json file to contain real values for the
username/password/couponCode fields.

Note 2: This was built/tested using CasperJS version 1.1.0-beta3 and SlimerJS version 0.9.6.

Usage -
  [proxychains] casperjs --engine=slimerjs test --pre=login.js tests[/&lt;filename&gt;]

You may need to set up proxychains (http://proxychains.sourceforge.net/howto.html)
to force the connection to the 'staging' version of the WP page.

TODO: 

    1) Exercise different methods of reaching the Plan Upgrade page

    2) Exercise the full purchase process with a valid CC#
