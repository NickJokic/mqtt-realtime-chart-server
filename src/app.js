const express = require('express'),
    app = express(),
    cors = require('cors'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mqtt = require('mqtt'),
    mqttClient = mqtt.connect('mqtt://0.0.0.0:1883'),
    mqttTopic = 'voltage',
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var streamInterval;
var msFrequency = 20;

/* 
Subscribe (listen) to MQTT topic and start publishing
simulated data after successful MQTT connection 
*/
mqttClient.on('connect', () => {
    console.log('Mqtt connected.')
    mqttClient.subscribe(mqttTopic); //subscribe
    startStreamSimulation(); //publish
})

mqttClient.on('offline', () => {
    console.log('Mqtt offline.')
    mqttClient.unsubscribe(mqttTopic);
    clearInterval(streamInterval);
})

/* 
Message event fires, when new messages
arrive on the subscribed topic
*/
mqttClient.on('message', function (topic, message) {
    /* console.log('Received: ' + message.toString() + ' from topic: ' + topic.toString()); */
    let parsedMessage = JSON.parse(message);
    io.emit('voltageData', parsedMessage);
})

/* 
Function that publishes simulated data to the MQTT broker every ≈20ms
*/
function startStreamSimulation() {
    
    var v1 = 0,
        v2 = 0,
        v3 = 0;

    streamInterval = setInterval(function () {

        /* Prepare random data */
        v1 = returnRandomFloat(231, 231.1);
        v2 = returnRandomFloat(235, 235.3);
        v3 = returnRandomFloat(238.7, 239.3);

        /* Publish random data to the corresponding MQTT topic as a JSON string  */
        mqttClient.publish(mqttTopic, JSON.stringify({
            'v1': v1,
            'v2': v2,
            'v3': v3
        }));


    }, msFrequency);
}

function returnRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

io.on('connection', (client) => {
    console.log("Socket connected.")
})

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.get('/', function (req, res) {
    res.send(
    [{
            title: "Hi, I'm the express server!",
            description: "Start Moquette and the client application to see the action!"
    }]
    )
});

server.listen(3000, function () {
    console.log('App listening on port 3000!');
});
