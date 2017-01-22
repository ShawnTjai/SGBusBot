// References
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var translator = require('mstranslator');

//Initial Arrays
var replaceArray = [
    ["north","nth"],["south","sth"],["centre","ctr"],["interchange","int"],["inter","int"],
    ["station","stn"],["opposite","opp"],["upper","upp"],["road","rd"],["block","blk"],
    ["avenue","ave"],["terrace","ter"],["after","aft"],["before","bef"],["mount","mt"],
    ["singapore","s'pore"],["heights","hts"],["polytechnic","poly"],["opposite","opp"],["complex","cplx"],
    ["park","pk"],["point","pt"],["terminal","ter"]
];

var searchingReplies = [
    "One moment while the fairy finds bus ",
    "Hold on, helicopter is on it's way to find the bus ",
    "F1 car on it's way! Hold on while I chase the bus ",
    "Checking satellite data..beaming..one moment.. Found bus ",
    "Hang on ah, people eating lunch now so wait while I find bus "
];

var standardReplies = {
    firstInit: "This is your first time using me, which language do you prefer me to reply in?",
    langChanged: "Okay! Your language preference has been changed. ",
    askQn: "To begin, just ask me a question like",
    queryExample: "\n- When is the next bus 69 from Bedok Interchange?\n- When is the next bus 69 from 75229",
    techLimitation: "Due to technical limitations, please send me your requests in english.",
    didNotUnderstand: "Sorry, I didn't understand what you said.",
    langReset: "Your language preferences have been reset.",
    resetSuccess: "I've just reset myself, lets try again!",
    startCommand: "Hello! I'm a Bus Bot.\n\nSend me a command to get started!\n\nEg. ",
    notReady: "Okay! Talk to me when you are ready :)",
    configureLang: "Please configure your language first by saying 'Configure Language'",
    apologyAccept: "Apology accepted.",
    rude: "That's rude, take that back!",
    manners: "K. Talk to me when you've learnt some manners.",
    noBus: "Sorry, how to find if you don't tell me which bus you want to take?",
    noBusStop: "Sorry, how to find if you don't tell me which bus stop for "
};

var key = {
    msTranslator: "YOUR_TRANSLATE_KEY",
    appId: "YOUR_APP_ID",
    appPw: "YOUR_APP_PW",
    myTransportKey: 'YOUR_MYTRANSPORT_KEY'
};

var url = {
    busUrl: "http://datamall2.mytransport.sg/ltaodataservice/BusArrival?",
    busStopsUrl: "http://datamall2.mytransport.sg/ltaodataservice/BusStops",
    luisEndpoint: "YOUR_LUIS_ENDPOINT"
};

//Setup Translator
var client = new translator({
  api_key: key.msTranslator // use this for the new token API. 
}, true);

//Setup LUIS
var luisRecognizer = new builder.LuisRecognizer(url.luisEndpoint);
var intentDialog = new builder.IntentDialog({recognizers: [luisRecognizer]});

// Listen on port 3978
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Initialise Connector
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || key.appId,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || key.appPw
});

var bot = new builder.UniversalBot(connector, { persistConversationData:true });
server.post('/api/messages', connector.listen());

//LUIS Intents
intentDialog.matches('conversation', '/conversation')
    .matches('vulgarity', '/vulgarity')
    .matches('nextBus', '/nextBus')
    .matches('resetLang', '/resetLang')
    .matches('resetBot', '/resetBot')
    .onDefault(builder.DialogAction.send(standardReplies.didNotUnderstand));

// Bot Dialogs
bot.dialog('/', intentDialog);

bot.dialog('/resetLang', function(session, args){
    session.sendTyping();
    session.userData['Lang'] = null;
    session.endDialog(standardReplies.langReset);
});

bot.dialog('/resetBot', function(session, args){
    session.sendTyping();
    session.userData['Lang'] = null;
    session.endDialog(standardReplies.resetSuccess);
    session.endConversation();
});

bot.dialog('/conversation', [function(session, args){
        session.sendTyping();
        var lang = session.userData['Lang'];
        var compliment = builder.EntityRecognizer.findEntity(args.entities, 'compliment');
        var vulgarity = builder.EntityRecognizer.findEntity(args.entities, 'vulgarity');

        if(compliment){
            session.endDialog("Thanks! Hope it helps :)");
            return;
        } else if (vulgarity){
            session.endDialog("That hurt my feelings ):");
            return;
        } else {
            if (!lang) {
                session.send("Hello! Welcome to the Bus Timing Bot.");
                console.log("User's first load or resetted language.");

                builder.Prompts.choice(session, standardReplies.firstInit, "English|Chinese|Japanese|Tamil|Cancel");
            } else {
                console.log("User Lang Data Exists: "+lang);

                if(lang == "en"){
                    session.endDialog(standardReplies.startCommand+standardReplies.queryExample);
                } else {
                    var paramsTranslateTo = {
                        text: standardReplies.startCommand,
                        from: 'en',
                        to: lang
                    };

                    client.translate(paramsTranslateTo, function(err, data){
                        session.endDialog(data+standardReplies.queryExample);
                    });
                }
            }
        }
    }, function(session, results){
        session.sendTyping();
        if (results.response && results.response.entity !== 'Cancel') {
            var fullLang = "English";

             //Add more languages for your liking, add prompt on top also
            if(results.response.entity.toUpperCase() == "ENGLISH"){
                session.userData['Lang'] = 'en';
                fullLang = "English";
            } else if(results.response.entity.toUpperCase() == "CHINESE"){
                session.userData['Lang'] = 'zh-chs';
                fullLang = "中文";
            } else if(results.response.entity.toUpperCase() == "JAPANESE"){
                session.userData['Lang'] = 'ja';
                fullLang = "日本語";
            } else if(results.response.entity.toUpperCase() == "TAMIL"){
                session.userData['Lang'] = 'ta';
                fullLang = "தமிழ்";
            }

            var paramsTranslateTo = {
                text: standardReplies.langChanged,
                from: 'en',
                to: session.userData['Lang']
            };

            var paramsTranslateTo2 = {
                text: standardReplies.askQn,
                from: 'en',
                to: session.userData['Lang']
            };

            var paramsTranslateTo4 = {
                text: standardReplies.techLimitation,
                from: 'en',
                to: session.userData['Lang']
            };
            
            client.translate(paramsTranslateTo, function(err, data){
                client.translate(paramsTranslateTo2, function(err, data2){
                    client.translate(paramsTranslateTo4, function(err, data4){
                        session.send(data + "("+fullLang+")");
                        session.send(data4);
                        session.endDialog(data2+standardReplies.queryExample);
                    });
                });
            });
        } else {
            session.endDialog(standardReplies.notReady);
        }
    }
]);

bot.dialog('/vulgarity', [function (session){
        session.sendTyping();
        builder.Prompts.choice(session, standardReplies.rude, "Sorry|No");
    }, function (session, results){
        session.sendTyping();
        if (results.response && results.response.entity !== 'No') {
            session.endDialog(standardReplies.apologyAccept);
        } else {
            session.endDialog(standardReplies.manners);
        }
    }
]);

bot.dialog('/nextBus', function (session, args){
        session.sendTyping();
        var lang = session.userData['Lang'];

        if(!lang){
            session.endDialog(standardReplies.configureLang);
            return;
        }

        var text = session.message.text;
        var searchType = "busStopNum";

        var busService = builder.EntityRecognizer.findEntity(args.entities, 'busService');
        var busStop = builder.EntityRecognizer.findEntity(args.entities, 'busStop');
        var busOrigin = builder.EntityRecognizer.findEntity(args.entities, 'busOrigin');

        var totalStops = 5250;
        var testCount = 0;

        if(busService){
            busService = busService.entity;
            console.log("busService: "+busService);
        } else {
            busService = "not in service";
        }
        
        if(busStop){
            busStop = busStop.entity;
            console.log("busStop: "+busStop);
        } else {
            busStop = 0;
        }
        
        if(busOrigin){
            busOrigin = busOrigin.entity;

            console.log("busOrigin init: "+busOrigin);

            for(var p=0; p<replaceArray.length; p++){
                if(busOrigin.indexOf(replaceArray[p][0]) !== -1){
                    busOrigin = busOrigin.replace(replaceArray[p][0], replaceArray[p][1]);
                    busOrigin = busOrigin.replace(/[^a-zA-Z ]/g,"");
                }
            }

            console.log("busOrigin aft: "+busOrigin);

            if(busOrigin == "tampines int"){
                searchType = "busStopNum";
                busStop = 75009;
            }
        } else {
            busOrigin = "not in use";
        }
        
        console.log("Here? "+url.busUrl+"BusStopID="+busStop+"&ServiceNo="+busService);

        var busStopCode = "";
        var matchedBusStop = false;
        var interval = 5*25;
        var cards = [];
        var traverseDone = false;
        var endNow = false;

        var rand = Math.floor(Math.random() * 3);

        if(busStop != 0){
            console.log("No bus stop id");
            var loc = "at bus stop #"+busStop;
            var findBanter = searchingReplies[rand] +busService+" "+loc+" for you...";
        } else if(busOrigin != "not in use"){
            console.log("no bus stop name");
            var loc = "at bus stop "+busOrigin;
            var findBanter = searchingReplies[rand] +busService+" "+loc+" for you...";
        } else {
            console.log("no id or name");
            var findBanter = standardReplies.noBusStop+busService+"?";
            endNow = true;
        }

        if(busService == "not in service"){
            console.log("no bus number");
            var findBanter = standardReplies.noBus;
            endNow = true;
        }

        var paramsTranslateBanter = {
            text: findBanter,
            to: lang
        };

        client.translate(paramsTranslateBanter, function(err, data){
            if(endNow){
                session.endDialog(data);
            } else {
                session.send(data);
                session.sendTyping();

                for(var x=0; x<totalStops/50; x++){
                    setTimeout(function (x){
                        var optionsDetails = {
                            uri: url.busStopsUrl+"?$skip="+(x*50),
                            headers: {
                                'AccountKey': key.myTransportKey
                            }
                        }

                        request(optionsDetails, function(error, response, body){
                            var obj = JSON.parse(body);
                            var value = obj.value;

                            var t = value.filter(function(y){
                            if((y.BusStopCode==busStop || y.Description.toLowerCase().indexOf(busOrigin) !== -1 || y.RoadName.toLowerCase().indexOf(busOrigin) !== -1) && (y.Description != "Non Stop" && y.Description != "Express")){
                                    testCount++;
                                    console.log(testCount);
                                    console.log(busService+" "+busStop+" ("+busOrigin+") matches "+y.BusStopCode+" ("+y.RoadName+") ("+y.Description+")");
                                    busStopCode = y.BusStopCode;
                                    matchedBusStop = true;

                                    var options = {
                                        uri: url.busUrl+"BusStopID="+y.BusStopCode+"&ServiceNo="+busService,
                                        headers: {
                                            'AccountKey': key.myTransportKey
                                        }
                                    }

                                    request(options, function(error, response, body){
                                        var finalMessage = "An error has occured. Please try again.";

                                        var obj = JSON.parse(body);
                                        console.log(obj);

                                        if(obj != null){
                                            var busStopNum = obj.BusStopID;
                                            var len = 0;

                                            try {
                                                len = obj.Services.length;
                                                console.log("Length of JSON Services: "+len);
                                            } catch (err){
                                                console.log(err);
                                            }

                                            if(len > 0){
                                                var services = obj.Services;
                                                var service = services[0];
                                                var no = service.ServiceNo;
                                                var inOp = service.Status;
                                            } else if (searchType == "busStopName"){
                                                return;
                                            } else {
                                                return;
                                            }

                                            if(inOp === "In Operation"){
                                                var nextBus = service.NextBus;
                                                var estArr = nextBus.EstimatedArrival;
                                                
                                                var subBus = service.SubsequentBus;
                                                var subEstArr = subBus.EstimatedArrival;

                                                if(estArr){
                                                    var load = nextBus.Load;
                                                    
                                                    var feature = nextBus.Feature;
                                                    
                                                    if(feature){
                                                        var featureText = " ("+feature+")";
                                                    } else {
                                                        var featureText = "";
                                                    }
                                                    
                                                    var milli = Math.abs(new Date(estArr) - new Date());
                                                    var diff = Math.floor((milli/1000)/60);
                                                
                                                    var frontTitle = "Bus "+no;

                                                    if(diff == "1"){
                                                        var title = frontTitle+" is arriving in "+diff+" minute"+featureText+" ("+load+")";
                                                        var shortTitle = "The bus will arrive in "+diff+" minute!";
                                                    } else if(diff == "0"){
                                                        var title = frontTitle+" is arriving"+featureText+" ("+load+")";
                                                        var shortTitle = "Better run! The bus is arriving now!";
                                                    } else {
                                                        var title = frontTitle+" is arriving in "+diff+" minutes"+featureText+" ("+load+")";
                                                        var shortTitle = "The bus will arrive in "+diff+" minutes!";
                                                    }
                                                } else {
                                                }
                                                
                                                if(subEstArr){
                                                    var subLoad = subBus.Load;
                                                    
                                                    var subFeature = subBus.Feature;

                                                    if(subFeature){
                                                        var subFeatureText = " ("+subFeature+")";
                                                    } else {
                                                        var subFeatureText = "";
                                                    }

                                                    var subMilli = Math.abs(new Date(subEstArr) - new Date());
                                                    var subDiff = Math.floor((subMilli/1000)/60);
                                                    var shortTitleAdd = "";
                                                
                                                    if(estArr){
                                                        if(subDiff == "1"){
                                                            var subMsg = " and the subsequent bus is in "+subDiff+" minute"+subFeatureText;
                                                            var shortTitleAdd = " Next bus is in "+subDiff+" minute if you miss this one.";
                                                        } else {
                                                            var subMsg = " and the subsequent bus is in "+subDiff+" minutes"+subFeatureText;
                                                            
                                                            var shortTitleAdd = " Next bus is in "+subDiff+" minutes if you miss this one.";
                                                        }
                                                    } else {
                                                        var title = "Bus "+no+" is arriving in "+subDiff+" minutes"+subFeatureText;
                                                        var shortTitle = "The bus is arriving in "+subDiff+" minutes! Don't miss it!";
                                                    }
                                                } else {
                                                    var subMsg = "";
                                                }
                                                
                                                finalMessage = title + subMsg;
                                            } else {
                                                finalMessage = "Bus "+no+" at bus stop "+busStopNum+" - "+y.Description+" ("+y.RoadName+") is currently not in service.";
                                            }

                                            var paramsTranslateTo = {
                                                text: shortTitle + shortTitleAdd,
                                                to: lang
                                            };

                                            var paramsTranslateDetails = {
                                                text: y.Description+" ("+y.RoadName+") - "+busStopNum,
                                                to: lang
                                            };

                                            var paramsTranslateTitle = {
                                                text: title,
                                                to: lang
                                            };

                                            client.translate(paramsTranslateTo, function(err, data){
                                                client.translate(paramsTranslateDetails, function(err, data2){
                                                    client.translate(paramsTranslateTitle, function(err, data3){                                                
                                                        var tmp = new builder.HeroCard(session)
                                                                .title(data3)
                                                                .subtitle(data2)
                                                                .text(data)
                                                                .images([
                                                                    builder.CardImage.create(session, "http://landtransportguru.net/web/wp-content/uploads/2016/08/ga_trg_punggol.jpg")
                                                                ]);

                                                            cards[cards.length] = tmp;

                                                            if(y.BusStopCode == "LEIS1" && !traverseDone){
                                                                traverseDone = true;
                                                                if(cards.length != 0){
                                                                    var reply = new builder.Message(session)
                                                                        .attachmentLayout(builder.AttachmentLayout.carousel)
                                                                        .attachments(cards);
                                                                    session.endDialog(reply);
                                                                } else {
                                                                    session.endDialog("You sure anot? Bus "+no+" doesn't stop at "+busStopNum+" - "+y.Description+" ("+y.RoadName+") leh..");
                                                                }
                                                            }
                                                    });
                                                });
                                            });
                                        } else {
                                            if(searchType == "busStopName"){
                                                matchedBusStop = false;
                                            } else {
                                                finalMessage = "You sure anot? Bus "+busService+" doesn't stop at "+busStopNum+" - "+y.Description+" ("+y.RoadName+") leh..";

                                                var paramsTranslateTo = {
                                                    text: finalMessage,
                                                    to: lang
                                                };

                                                client.translate(paramsTranslateTo, function(err, data){
                                                    session.endDialog(data);
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    testCount++;
                                    if(y.BusStopCode.indexOf("A") !== -1 && !traverseDone){
                                        traverseDone = true;
                                        if(cards.length != 0){
                                            var reply = new builder.Message(session)
                                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                                .attachments(cards);
                                            session.endDialog(reply);
                                        } else {
                                            session.endDialog("You sure anot? Bus "+busService+" doesn't stop here leh..");
                                        }
                                    }
                                    if(searchType == "busStopName"){
                                        matchedBusStop = false;
                                        console.log(busService+" "+busStop+" ("+busOrigin+") doesn't match "+y.BusStopCode+" ("+y.Description+")");
                                    } else {
                                        console.log(busService+" "+busStop+" ("+busOrigin+") doesn't match "+y.BusStopCode+" ("+y.Description+")");
                                    }
                                }
                            });
                        });
                    }, interval * x, x);
                }
            }
        });
    }
);
