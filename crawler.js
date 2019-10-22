const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

const START_URL = "http://www.arstechnica.com";
const SEARCH_WORD = "stemming";
const MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
const url = new URL(START_URL);
const baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

// console.log("Visiting page " + pageToVisit);
// request(pageToVisit, function(error, response, body) {
//    if(error) {
//      console.log("Error: " + error);
//    }
//    // Check status code (200 is HTTP OK)
//    console.log("Status code: " + response.statusCode);
//    if(response.statusCode === 200) {
//      // Parse the document body
//      var $ = cheerio.load(body);
//      console.log("Page title:  " + $('title').text());
//     collectInternalLinks($);
//     }
// });


function crawl() {
    if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log("Reached max limit of number of pages to visit.");
        return;
      }
      var nextPage = pagesToVisit.pop();
      if (nextPage in pagesVisited) {
        // We've already visited this page, so repeat the crawl
        crawl();
      } else {
        // New page we haven't visited
        visitPage(nextPage, crawl);
      }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     } else {
       collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     }
  });
}

function searchForWord($, word) {
    const bodyText = $('html > body').text();
    if(bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
        return true;
    }
    return false;
}

function collectInternalLinks($) {
    var allRelativeLinks = [];
    var allAbsoluteLinks = [];

    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function() {
        allRelativeLinks.push($(this).attr('href'));
    });

    var absoluteLinks = $("a[href^='http']");
    absoluteLinks.each(function() {
        allAbsoluteLinks.push($(this).attr('href'));
    })

    console.log("Found " + allRelativeLinks.length + " relative links");
    console.log("Found " + allAbsoluteLinks.length + " absolute links");

    console.log(allAbsoluteLinks);
}
