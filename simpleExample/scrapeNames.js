var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

function scrapeNames() {
	var url = 'http://www.midwestanimalrescue.org/animals/browse?special=Kittens';

	// Makes a request to the given URL, then performs callback function.
	// Response gives lots of info - socket info, headers, etc. Body is the HTML body of the page.
	request(url, function (error, response, body) {
		if (error) {
			throw new Error(error);
		}
		// '$' takes on essentially the same function as the jQuery '$', and cheerio.load(body)
		// tells the program that when we use '$' we want it to be searching through body
		var $ = cheerio.load(body);
		var nameArr = [];
		// Selects all elements with tag 'a' under a parent class 'browseInfo' and performs the
		// callback function on each one
		$('.browseInfo > a').each(function(i, element) {
			// Grabs the text of the element, which in this case is the animal's name,
			// and stores it in name variable
			var name = $(element).text();
			nameArr.push(name);
		});
		// Writes to the file 'names.txt'; each name is on a separate line
		fs.writeFile('names.txt', nameArr.join('\n'));
	});
}

scrapeNames();