# Singapore Bus Timing Bot
##Introduction
A bot which retrieves bus timings in Singapore. Built using the Microsoft Bot Framework.

This bot will retrieve bus stop information, bus arrival times and translate them to the language of your choice.

###Pre-Requisites (To Install)
- [Node.js](https://nodejs.org/en/)
- [Microsoft Bot Framework Emulator](https://emulator.botframework.com/)
- [Visual Studio Code](https://code.visualstudio.com/) (other editors are fine as well)

###APIs Required
- [Microsoft Language Understanding Intelligent Service](https://www.luis.ai)
- [Microsoft Cognitive Services - Translator API](https://www.microsoft.com/cognitive-services/en-us/translator-api)
- [myTransport.sg Bus Timing, Routes & Stops & Services](https://www.mytransport.sg/content/mytransport/home/dataMall.html)
  * You will need to request for an API key for Real-Time/Dynamic Data

##Getting Started
###Live Bot in Action (Demo)
<img src="https://github.com/ShawnTjai/SGBusBot/blob/master/demo.gif?raw=true">

###Configuring your Node Package Manager (NPM)
Once you have set-up Node.js, navigate to the correct directory and perform the following NPM commands.
This will install the dependencies required for the bot to run.
- npm install --save restify
- npm install --save botbuilder
- npm install --save request
- npm install --save mstranslator

###Publishing your Bot & Configuring Microsoft Bot Framework
1. Host your bot on a web service preferably on [Microsoft Azure Web App](https://portal.azure.com/#create/Microsoft.WebSite)
 * You may configure the deployment options to sync with your git repositories
2. Register your bot at the [Microsoft Bot Framework](https://dev.botframework.com/bots/new) portal
 * You will have to create a new Microsoft Application ID and Password. Do not forget these details!

<img src="https://github.com/ShawnTjai/SGBusBot/blob/master/botframework.png?raw=true" width="400">

###Setting up the LUIS.AI Natural Language Endpoint
1. **Create a New Application**

2. **Go to settings and under subscription keys, enter your LUIS key which you generated from Azure and pair it to the newly created application.**

3. **Add Entities**
 * busOrigin
 * busService
 * busStop
 * vulgarity
 * compliment

4. **Add Intents & Train Them**
 * conversation ("Hello!)
 * vulgarity ("This bot sucks")
 * nextBus ("When is the next bus **69** at  _**Bedok Interchange**_?" | "When is the next bus **69** at bus stop  _**84009**_")
 * resetBot ("Reset")
 * resetLang ("Reset the language")
 
 **Select the Entity**

 * 69 - Select as busService entity
 * Bedok Interchange - Select as busOrigin entity
 * 84009 - Select as busStop entity

5. **Training and Publishing Endpoint**
 * Now click on "Train" on the bottom left
 * When done training, click "Publish" and copy the endpoint URL for later

###Getting a Microsoft Translator API Key
1. Go to [Microsoft Azure](https://portal.azure.com) and make sure you have an active subscription. Free Trial, Azure Pass, Dev Essentials or MSDN.
2. Create a new "Cognitive Services APIs (preview)" service with the API Type "Translator Text API"
3. Once it is created, click "keys" and pick one of the two keys there.

###Getting a Bus Timing API Key
1. Head to [myTransport's website](https://www.mytransport.sg/content/mytransport/home.html)
2. Under "Real-Time/Dynamic Data", click "Request for API Access" and fill in the details
3. You should receive an API key in your email shortly after

###Adding the Keys & Endpoint to Code
Look for the variable "key" and fill in the keys there. They are "msTranslator", "appId", "appPw", "myTransportKey

For the endpoint URL, look for the variable "url" and paste the LUIS Endpoint in "luisEndpoint"

###Completed Everything Above?
1. Open the Node.js command prmpt
2. Navigate to the bot folder
3. Run the command "node app.js", you should see "restify listening to http://[::]:3978"
4. You can now connect using the emulator you downloaded. 
 * Enter the URL as "http://localhost:3978/api/messages" together with your App Id & PW created earlier
 * To connect to the live bot, you may use the website URL like "https://YOUR_WEBSITE_URL/api/messages"

##Additional Notes
Please note that this project is meant to help people get started with the [Microsoft Bot Framework](https://dev.botframework.com/), Natural Language as well as APIs with something relatable. In this case, it would be getting bus timings. This repo can easily be forked and edited to suit your own needs (Eg. [Weather](http://www.SGWeatherToday.com/), Train, [RSS](https://github.com/ShawnTjai/RSSFeedBot) etc.)

There are plenty of other features which can be added so i'll just give you examples of a few.
- Bus Stop Information
- Nearest Bus Stop
- Street-view of Bus Stop
- Getting from A to B
- Bus First/Last Timings

Have fun :)

http://www.ShawnTjai.com
