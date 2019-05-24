require('dotenv').config();
var firebase = require('./FirebaseConfig');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mqttHandler = require('./MQTTHandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var mqttClient = new mqttHandler();
mqttClient.connect();

app.get('/ligth', function (req, res) {
    console.log("HTTP Get Request");
	var ligthReference = firebase.database().ref("/Ligths/");
	ligthReference.on("value", function(snapshot) {
        console.log(snapshot.val());
        res.json(snapshot.val());
        ligthReference.off("value");
	}, 
	function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.send("The read failed: " + errorObject.code);
	});
});

app.post('/ligth', function (req, res) {

    if(req.body.User === undefined || req.body.User === "") {
        return res.status(400).send({ message: 'User is required.' });
    } 
    else if(req.body.Name === undefined || req.body.Name === "") {
        return res.status(400).send({ message: 'Name is required.' });
    }
    else if(req.body.Status === undefined || req.body.Status === "") {
        return res.status(400).send({ message: 'Status is required.' });
    }
    else if(req.body.Status !== "on" && req.body.Status !== "off") {
        return res.status(400).send({ message: 'Status must be \'on\' or \'off\'.' });
    }

    console.log("HTTP Post Request");
    var user = req.body.User;
	var name = req.body.Name;
    var message = req.body.Message;
    var status = req.body.Status;

    // Publsh Message to MQTT
    mqttClient.sendMessage(status);

    // Save BASE Data to Firebase
	var referencePath = '/Ligths/000/';
	var ligthReference = firebase.database().ref(referencePath);
	ligthReference.set({Name: 'ligth', Message: message, Status: status}, function(error) {
        if (error) {
            res.status(400).send({ message: 'Data could not be saved.' + error });
        } 
        else {
            // Save Data to Firebase
            var referencePath = '/Ligths/'+user+'/';
            var ligthReference = firebase.database().ref(referencePath);
            ligthReference.set({Name: name, Message: message, Status: status}, function(error) {
                if (error) {
                    res.status(400).send({ message: 'Data could not be saved.' + error });
                } 
                else {
                    res.status(200).json({ message: 'Data saved successfully.' });
                }
            });
        }
    });
});

var server = app.listen(process.env.PORT, function () {
    console.log("app running on port.", server.address().port);
});
