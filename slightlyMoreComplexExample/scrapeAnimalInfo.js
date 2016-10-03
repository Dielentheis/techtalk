// I ended up using promises in this example because of the asynchronicity of all the requests -
// I ran into a problem where I was calling my makeCSV function before I had pushed all of the
// info I wanted into animalInfo.
var Promise = require('bluebird');
var request = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');

// Gathers links corresponding to each animal's individual info page.
function scrapeLinks() {
	var startingUrl = 'http://www.midwestanimalrescue.org/animals/browse?special=Kittens';
	var animalUrls = [];

	// Makes a request to the startingUrl and then, from the response (which is the startingUrl's HTML),
	// gathers all of the links corresponding to each animal's individual page.
	request(startingUrl, function (error, response, body) {
		var baseUrl = 'http://www.midwestanimalrescue.org';
		var $ = cheerio.load(body);
		// basic error handling
		if (error) {
			throw new Error(error);
		}
		// 'browse' is the class associated with each animal's previewed info. This collects every chunk of HTML with the class
		// 'browse' and then for each chunk finds the 'a' tag and takes the value of the 'href' attribute,
		// which is something like "/animals/detail?AnimalID=10088333". It then adds this specific Url path to the
		// domain Url (http://www.midwestanimalrescue.org) and saves the concatenation as a link to a specific animal.
		$('.browse').each(function(i, element) {
			$ = cheerio.load(element);
			var extension = $('a').attr('href');
			animalUrls[i] = baseUrl + extension;
		});
		scrapeInfo(animalUrls);
	});
}

// Makes a request to each link corresponding to an animal's page and creates an object based on that animal's
// information, and then sends that object to makeCSV to be put into CSV/spreadsheet format.
function scrapeInfo(animalUrls) {
	var animalInfo = [];
	Promise.map(animalUrls, function(animalUrl) {
	    return request(animalUrl, function(error, response, body) {
			var animalObj = {};
			var $ = cheerio.load(body);
			if (error) {
				throw new Error(error);
			}
			$('.animalDetail').each(function(i, element) {
				var propertyAndValue = $(this).text().split(': ');
				var id = propertyAndValue[0];
				animalObj[id] = propertyAndValue[1];
			});
			animalObj["Animal Url"] = animalUrl;
			animalInfo.push(animalObj);
		});
	})
	.then(function() {
		// only calles this function once all of the animalObjs have been pushed into
		// animalInfo
		makeCSV(animalInfo);
	});
}

function makeCSV(animalInfo) {
	var animalObj = animalInfo[0];
	var firstRow = "";
	for (var key in animalObj) {
		firstRow += (key + ",");
	}
	fs.appendFile('animalInfo.csv', (firstRow + "\n"));
	var keys = firstRow.split(",");
	for (var i = 0; i < animalInfo.length; i++) {
		var thisRow = "";
		for (var j = 0; j < keys.length; j++) {
			if (animalInfo[i][keys[j]]) {
				thisRow += (animalInfo[i][keys[j]] + ",");
			}
			else {
				thisRow += ",";
			}
		}
		fs.appendFile('animalInfo.csv', (thisRow + "\n"));
	}
}

scrapeLinks();

