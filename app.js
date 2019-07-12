const mysql =require('mysql');
const AWS = require('aws-sdk');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
var request = require("request");
global.IDClimaActual=0;
const rekognition = new AWS.Rekognition({
    accessKeyId: '******',
    secretAccessKey: '*****',
    region: '******'
});


app.use(bodyparser.json());

var amqp = require('amqplib/callback_api');


var request = require("request")
const axios = require('axios');

const getClima = () => {
  try {
    return axios.get('http://api.openweathermap.org/data/2.5/weather?id=3598132&appid=040e6f115fe46f4480d923d05db6a5b4')
  } catch (error) {
    console.error(error)
  }
}

const conectarRabbit = async () => {
  amqp.connect('******', function(error0, connection) {
  //amqp.connect('amqp://localhost', function(error0, connection) {
	  if (error0) {
		throw error0; 
	  }
	  connection.createChannel(function(error1, channel) {
		if (error1) {
		  throw error1;
		}
		var queue = 'emociones_queue';

		channel.assertQueue(queue, {
		  durable: false
		});
		channel.prefetch(1);
		console.log(' [x] Awaiting Emociones requests');
		channel.consume(queue, function reply(msg) {
			var name = msg.content.toString();
			console.log(" [.] nombre: " + name);
			var r; 
			//---------------------
			var params = {
                Attributes: [ "ALL" ], //Emotions attribute
                Image: {
                    S3Object: {
                    Bucket: "grupovirt", 
                    Name: 'images/'+ name
                    }
                }    
            }
                
            var maxConfidence;
            function recognize() {
                    rekognition.detectFaces(params, (error, data) => {
                    if (error) throw error;
                    //console.log(JSON.stringify(data, null, '\t'));
                    data.FaceDetails.forEach((response) => {
                        maxConfidence = response.Emotions.reduce((a, b) => b.Confidence > a.Confidence ? b : a);
                    })
                })
            }
            recognize();
            setTimeout(function(){
				console.log("en la cola: ");
                console.log(maxConfidence.Type)
				r = maxConfidence.Type;
				//r = Math.random().toString();
				channel.sendToQueue(msg.properties.replyTo,
				Buffer.from(r), {
				  correlationId: msg.properties.correlationId
				});

				channel.ack(msg);
            }, 3000);     
			
		});
	  });
	}); 	
}

conectarRabbit()








//---------------------
                 	

