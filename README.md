# a8c-casperjs-tests
A repo to hold the CasperJS test suite I'm building for Automattic.

Usage - casperjs --engine=slimerjs test [testFile].js --user=[username] --pass=[password]

Note - You may need to set up proxychains to force the connection to the 'staging' version of the WP page.

TODO: 

    1) Build a master test file to execute all individual tests

       a) Split the tests apart into more logical chunks

    2) Exercise different methods of reaching the Plan Upgrade page

    3) Exercise more combinations of invalid inputs to the form

    4) Exercise the full purchase process with a valid CC#
