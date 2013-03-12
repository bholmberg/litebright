var server = "10.1.3.251";
var apiPath = "/litebrite/peggy/";

var http = require('http');
//var lo = require('lodash');
var moment = require('moment');

var quote = require('./ticker.json');

var mDate = moment(quote.return.now/1000);



function lookup() {
    http.get(
        {
            host: "data.mtgox.com",
            port: 80,
            path: "/api/1/BTCUSD/ticker"
        }, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));

            var responseData = "";

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                responseData += chunk;
            });

            res.on('end', function(){
                //response.send(pageData)
                //console.log(responseData);
                console.log(responseData);
                var d = JSON.parse(responseData);

                var message = [];

                message.push("BTCUSD");
                message.push("HIGH: " + d.return.high.display);
                message.push("LOW:  " + d.return.low.display);
                message.push("LAST: " + d.return.last.display);

                console.log(message);

                postMessage(message);
            });
        }
    );
}

var postMessage = function (message) {

    console.log("postMessage called");

    // get one minute lease code
    console.log("getting write lease", apiPath + "get_lease/1");
    http.get(
        {
            host: server,
            port: 80,
            path: apiPath + "get_lease/1"
        }, function (res) {
            var leaseData = "";

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                leaseData += chunk;
            });

            res.on('end', function(){

                var lease = JSON.parse(leaseData);
                console.log("got lease", lease.lease_code);

                // call to clear
                //console.log("calling clear", apiPath+"clear/"+lease.lease_code);
//                http.get({
//                    host:server,
//                    port:80,
//                    path:apiPath+"clear/"+lease.lease_code
//                });

                var messageUrl = "";

                for (var i = 0; i < message.length; i++) {

                    messageUrl = apiPath + "write/" + lease.lease_code + "/" + i + "/0/" + encodeURIComponent(message[i]);
                    console.log("calling this:", messageUrl);
                    http.get({
                        host: server,
                        port: 80,
                        path: messageUrl
                    });
                }
            });
        }
    );
}

//lookup();
