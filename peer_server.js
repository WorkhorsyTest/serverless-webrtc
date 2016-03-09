


var port = 8888;
var express = require('express');
var app = express();
var g_offers = {};

app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.status(200).send('Hello World!');
});

app.get('/get_offers.json', function (req, res) {
	console.log('get_offers.json');
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Content-Type', 'application/json');

	res.status(200).send(JSON.stringify(Object.keys(g_offers)));
});

app.get('/set_offer.json', function (req, res) {
	console.log('set_offers.json');
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Content-Type', 'application/json');
	var offer = req.param('offer');
	console.log(offer);
	g_offers[offer] = 1;

	res.status(200).send(JSON.stringify({}));
});

app.get('/get_answer.json', function (req, res) {
	console.log('get_answer.json');
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Content-Type', 'application/json');
	var offer = req.param('offer');
	var answer = g_offers[offer];
	console.info(offer);
	console.info(answer);

	res.status(200).send(JSON.stringify(answer));
});

app.get('/set_answer.json', function (req, res) {
	console.log('set_answer.json');
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Content-Type', 'application/json');
	var offer = req.param('offer');
	var answer = req.param('answer');
	console.log(offer);
	console.log(answer);
	g_offers[offer] = answer;

	res.status(200).send(JSON.stringify({}));
});

app.listen(port, function() {
	console.log('Server running at http://localhost:' + port);
});
