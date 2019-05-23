require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mqttHandler = require('./MQTTHandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var mqttClient = new mqttHandler();
mqttClient.connect();

app.post("/ligth", function(req, res) {
  mqttClient.sendMessage(req.body.message);
  res.status(200).send("Message sent to mqtt");
});

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});