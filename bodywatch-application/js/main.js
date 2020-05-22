window.onload = () => {
    'use strict';
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
}

let video;
let poseNet;
//let poses = [];
let pose;
let options = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    maxPoseDetections: 1,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'single',
    multiplier: 0.5,
    quantBytes: 2,
    inputResolution: 161,
}
let skeleton;
let shoulderL;
let shoulderR;
let eyeL;
let eyeR;
let d;
let startingD;
let badD;
let leanCheck = 0;
let muteCheck = 'unmuted'
let showPopup = 'true'
let step = "starting_pose";
let reward_good_pose = 'true';
let frequentTime = 0.25; //voor nu staat hij op 0.25 om te testen maar in productie zou hij bijvoorbeeld 15 staan voor elke kwartier een notification
let goodPoseTime = 1; //voor nu staat hij op 1 om te testen maar in productie zou hij bijvoorbeeld elke uur kunnen aangeven of je fout heb gezeten
let badpose_per_session = [];
let badposeCounter_per_session = 0;

function setup() {
    //create camera window and webcam usage.
    var test = createCanvas(800, 600);
    test.parent('canvasPosition'); //dit koppelt het aan een div in html 
    test.position(400,120); //relocate canvas
    video = createCapture(VIDEO);
    // video.size(width, height);
    poseNet = ml5.poseNet(video, options, check);
    
    poseNet.on('pose', showPoses)

    
    
    video.hide();

    //functies hier uitvoeren zorgt misschien voor beetje lag? weet niet zeker even testen 
    //misschien probleem omdat hij hier ook de webcam opzet en functies hier uitvoeren kan voor vertraging zorgen of ligt aan me eigen laptop (lol)
    randomNotifications();
    checkGoodPose(); //start de check voor goede pose functie (kan dit maybe uitschakelen als default en in optie aan laten zetten)
    randomTips(); //start de random notifications (kan dit maybe uitzetten als default)
}

function check() {
    console.log('check');
}

function showPoses(poses) {
    //show pose x and y variables.
    console.log(poses);
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        detectOutOfCanvas();
    }
}

//dit zet de 'goede' pose van de gebruiker vast zodat er gekeken word of de persoon goed zit
function displayStartPose() {
    startingD = d;
    console.log("starting D = " + startingD);
    document.getElementById("start").innerHTML = startingD;
}

//dit zet de 'bad' pose aan de positie waar je je niet in wilt bevinden
function displayBadPose() {
    badD = d;
    console.log("bad D = " + badD);
    document.getElementById("bad").innerHTML = badD;
}

function modelReady() {
    //check if model is loaded in.
    console.log('Loaded');
}

//function to show notification split into mute/unmuted can remove one if we choose to let users mute via System
function showNotificaton() {
    //leancheck is set to 1 to notify the rest there is a notification showing so it will not spam notifications and crash the application
    leanCheck = 1;
    if (muteCheck == 'muted' && showPopup == 'true'){
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'img/icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                changeColorToGood();
                this.close();
            }
        });
        resetLeanCheck(); //gemaakt zodat gebruiker niet perse hoef te klikken om te 'resetten' maar dat het na x seconden gebeurt, zodat we advies blijven geven en geen applicatie worden die forced.
    } 
    else if (muteCheck == 'unmuted' && showPopup == 'true'){
        playSound('bing');
        Push.create("Watch your pose", {
            body: "You are leaning forward too much",
            icon: 'img/icon.png',
            onClick: function () {
                //puts leancheck back to 0 to signal the notification is clicked and is ready for a new one when needed  
                leanCheck = 0;
                changeColorToGood();
                this.close();
            }
        });
        resetLeanCheck();
    }
    else if (muteCheck == 'muted' && showPopup == 'false') //kijken wat we hiermee gaan doen maybe wel voor data registreren want geen geluid en popup is eigenlijk niks
    {
        console.log("sound is muted and showPopup is false so nothing shows but it went of in the background!");
        resetLeanCheck();
    }
    else if (muteCheck == 'unmuted' && showPopup == 'false')
    {
        playSound('bing');
        resetLeanCheck();
    }
}

//random berichten die we pushen dit zijn test teksten en test timers we moeten nog kijken naar de frequentie van de notificaties
function randomNotifications() {
    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Have a sticker, keep it up 1",
                icon: 'img/sticker.png',
                onClick: function () {
                    this.close();
                }
            });
        }, frequentTime * 60 * 1000); 

        setTimeout(
            function() {
                Push.create("Good job!", {
                    body: "Do not forget to do some stretches click here for a small routine",
                    icon: 'img/stretch.png',
                    onClick: function () {
                        testHyperlink();
                        this.close();
                    }
                });
            }, (frequentTime * 2) * 60 * 1000);
}

function testHyperlink() {
    window.open("https://www.youtube.com/watch?v=6lJBZCRlFnI");
}

//functie om de leancheck die normaal word uitgevoerd door te klikken op popup te automatiseren dit gaat na 10sec terug
function resetLeanCheck() {
    setTimeout(
    function() {
        leanCheck = 0;
        changeColorToGood();
    }, 10000);
}

//function to mute/unmute sound can remove if we want people to just mute via System
function muteSwitch() {
    var x = document.getElementById("myMute");
    if (x.innerHTML === "unmuted") {
      x.innerHTML = "muted";
      muteCheck = "muted";
    } else {
      x.innerHTML = "unmuted";
      muteCheck = "unmuted";
    }
}

//function to mute/unmute sound can remove if we want people to just mute via System
function popupSwitch() {
    var x = document.getElementById("myPopup");
    if (x.innerHTML === "true") {
      x.innerHTML = "false";
      showPopup = "false";
    } else {
      x.innerHTML = "true";
      showPopup = "true";
    }
}

//shows or hides menu so the screen will not get full with buttons
function showMenu() {
    var x = document.getElementById("myMenu");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else {
        x.style.display = "none";
    }
}

function showTutorial() {
    var x = document.getElementById("myTutorial");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else {
        x.style.display = "none";
    }
}

//functie om alle 'field' bij settings op te slaan zodat ze voor volgende gebruik kunnen worden gebruikt.
function testing_save() { 
    ////sound 
    var sound = document.getElementById("myMute").innerHTML;
    ////notification
    var notification = document.getElementById("myPopup").innerHTML;
    ///frequentietimer
    var frequenttimer = document.getElementById("myFrequentTime").value;
    ///goodposecheck
    var goodposetimer = document.getElementById("myGoodPoseTime").value;
    /// startPose
    //var startpositie = document.getElementById("start").innerHTML;
    /// badPose
    //var badpositie = document.getElementById("bad").innerHTML;

    //Set
    localStorage.setItem("sound", sound);
    localStorage.setItem("notification", notification);
    localStorage.setItem("frequenttimer", frequenttimer);
    localStorage.setItem("goodposetimer", goodposetimer);
    //localStorage.setItem("startpositie", startpositie);
    //localStorage.setItem("badpositie", badpositie);
} 

//functie om alle bewaarde values te loaden
function testing_load(){
     //Retrieve
    document.getElementById("myMute").innerHTML = localStorage.getItem("sound");
    document.getElementById("myPopup").innerHTML = localStorage.getItem("notification");
    document.getElementById("myFrequentTime").value = localStorage.getItem("frequenttimer");
    document.getElementById("myGoodPoseTime").value = localStorage.getItem("goodposetimer");
    //document.getElementById("start").innerHTML = localStorage.getItem("startpositie");
    //document.getElementById("bad").innerHTML = localStorage.getItem("badpositie");

    muteCheck = localStorage.getItem("sound");
    showPopup = localStorage.getItem("notification");
    //badD = localStorage.getItem("badpositie");
    //startingD = localStorage.getItem("startpositie");
    frequentTime = localStorage.getItem("frequenttimer");        
    goodPoseTime = localStorage.getItem("goodposetimer");
}

//functie om de tijd op te slaan wanneer een slechte pose word aangegeven dit word in een array gestopt
function recordBadPose() {
    var time = new Date();
    var timeconverted = time.toUTCString(); //toLocaleTimeString voor alleen tijd
    badpose_per_session.unshift(timeconverted); //unshift en geen push zodat nieuwste boven te zien is
}

//print de array op het scherm (nieuwste komt boven)
function printBadSession(){
    for (let index = 0; index < badpose_per_session.length; index++) {
        console.log(badpose_per_session[index]);
    }

    text = "<ul>";
    for (i = 0; i < badpose_per_session.length; i++) {
        text += "<li>" + badpose_per_session[i] + "</li>";
            }
        text += "</ul>";
    document.getElementById("demo2").innerHTML = text;
    //document.getElementById("demo3").innerHTML = badposeCounter_per_session;
}

//veranderd de 'houding is correct' van groen -> rood en de tekst
function changeColorToBad() {
    document.getElementById("gwd-div-uhf8").style.backgroundColor = "red";
    document.getElementById("gwd-span-1rvu").innerHTML = "De houding is incorrect!";
}

//veranderd de 'houding is incorrect' van rood -> groen en de tekst
function changeColorToGood() {
    document.getElementById("gwd-div-uhf8").style.backgroundColor= 'rgb(' + 63 + ',' + 255 + ',' + 0 + ')';
    //document.getElementById("gwd-div-uhf8").style.backgroundColor = "lightgreen";
    document.getElementById("gwd-span-1rvu").innerHTML = "De houding is correct!";
}

//met deze functie vullen we de tips veld op het scherm met tips / motivatie
function randomTips(){
    var textField = document.getElementById("tipsText");
    setTimeout(
        function() {
            textField.innerHTML = "Tip 1"
        }, 0.5 * 60 * 1000); //staat nu op een halve minuut moeten voor echte productie tijd nog aanpassen misschien settings optie voor gebruiker?? net als frequente notificatie

    setTimeout(
        function() {
            textField.innerHTML = "Tip 2"
        }, 1 * 60 * 1000); //staat op 1 minuut
    
    setTimeout(
        function() {
            textField.innerHTML = "Tip 3"
        }, 1.5 * 60 * 1000); //staat op anderhalf minuut

    setTimeout(
        function() {
            textField.innerHTML = "Tip 4"
        }, 2.0 * 60 * 1000); //staat op anderhalf minuut
}

//test code geschreven hoef NIET gebruikt te worden misschien in toekomst
//dit checkt elke x seconden of er verandering is (in dit geval op variable d) 
//dit kan in toekomst gebruikt worden als het nodig is eventueel voor nu geen behoefte 
function checkChange(){
    var someValue = d;
    var prevVal = null;             
    var _myInterval = setInterval(function() {
        if(prevVal == someValue) {
            console.log("No change for 2 second", someValue)
            someValue = d;
            //hier kan je iets uitvoeren als er 2 seconden niks veranderd is misschien reminder of timer 
            //kunnen misschien in plaats van == het van elkaar aftrekken en met marges spelen want camera kan shaken door licht inval
        } else {
            console.log("Value was changed between past 2 second prev: ", prevVal, " New: ", someValue)
            prevVal = someValue;
            someValue = d;
            //als values niet gelijk meer zijn dan veranderd de opgeslagen value in de nieuwe value maar 
            //hij kijkt of values PRECIES hetzelfde zijn dus beter spelen met marges
        }
    }, 2000)
}

//functie zodat om de x minuten word gecheckt of de gebruiker in die tijd een foute pose heeft gehad
function checkGoodPose(){
    setTimeout(
        function() {
            rewardGoodPose();
        }, goodPoseTime * 60 * 1000); 
}

//functie om te kijken of de gebruiker een 'reward' krijgt of niet. 
function rewardGoodPose(){
    if (reward_good_pose == 'true')
    {
        console.log("we detected no bad poses for x minutes check")
        Push.create("Keep it up", {
            body: "You had no bad poses for x minutes!",
            icon: 'img/sticker.png',
            onClick: function () {
                this.close();
            }
        });
        checkGoodPose();
    }
    else {
        //moet nog iets komen als er bad pose is
        console.log("we detected a bad pose in the x minutes check")
        reward_good_pose = 'true';
        clearInterval(checkGoodPose);
        checkGoodPose();
    }
}

//functie om de gebruiker de frequente notificaties timer aan te passen
function myFrequentTime() {
    var x = document.getElementById("myFrequentTime");
    frequentTime = x.value;
    clearInterval(randomNotifications); //reset timer voor randomNotifications zodat de functie nog een keer word uitgevoerd maar dan met de nieuwe 'timer'
    randomNotifications();
}

//functie om de gebruiker de good pose detection timer aan te passsen 
function myGoodPoseTime() {
    var x = document.getElementById("myGoodPoseTime");
    goodPoseTime = x.value;
    clearInterval(checkGoodPose); //reset timer voor checkGoodPose zodat de functie nog een keer word uitgevoerd maar dan met de nieuwe 'timer'
}

//plays a sound when called
function playSound(filename){
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
}

function draw() {
    //draw both keypoints and the skeleton for testing purposes.
    drawKeyPoints();
    ////drawSkeleton();
}

function drawKeyPoints() {
    image(video, 0, 0);
        
    try {
        //make keypoints for the point between the shoulders
        ////let midX = shoulderL.position.x + (shoulderR.position.x - shoulderL.position.x) * 0.50;
        ////let midY = shoulderL.position.y + (shoulderR.position.y - shoulderL.position.y) * 0.50;
        
        //trying to check distance eyes
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        
        //fill with color red and create ellipse to show the keypoints
        fill(255,0,0);
        ////ellipse(midX, midY, 34);

        //use d to check distance instead of fixed variable
        ellipse(pose.nose.x, pose.nose.y, d);
        ////ellipse(pose.leftShoulder.x, pose.leftShoulder.y, 30);
        /////ellipse(pose.rightShoulder.x, pose.rightShoulder.y, 30);

        // // console.log(d);
        // // console.log(leanCheck);
        // // console.log(muteCheck);
        // // console.log("reward good pose " + reward_good_pose);
        // // console.log(frequentTime);
        // // console.log(goodPoseTime);
        console.log(badposeCounter_per_session);
        console.log(badpose_per_session);
        console.log(printBadSession());

        //if leaning forward && no notification is showing then show notification 
        //otherwise the notification will loop and crash the browser/application
            if (d > startingD + (badD - startingD) && leanCheck == 0){
                showNotificaton();
                console.log("bad D");
                reward_good_pose = 'false';

                recordBadPose();
                badposeCounter_per_session += 1;

                changeColorToBad();
            } 
    }
    catch (err) {
       //console.log("No pose found!");
    }
}

//function drawSkeleton() {
//    try {
//        //first 2 points in this array are the shoulders. 
//        let a = skeleton[0][0];
//        let b = skeleton[0][1];
//        
//        //put in global variable for drawKeyPoints
//        shoulderL = a;
//        shoulderR = b;
//        
//        //create middle keypoint for check later on
//        let midX = shoulderL.position.x + (shoulderR.position.x - shoulderL.position.x) * 0.50;
//        let midY = shoulderL.position.y + (shoulderR.position.y - shoulderL.position.y) * 0.50;
//        
//        strokeWeight(3);
//        stroke(255);
//        
//        //draw lines
//        line(a.position.x, a.position.y, b.position.x, b.position.y);  
//        line(pose.nose.x, pose.nose.y, midX, midY);
//    }
//    catch(err) {
//      //console.log("No pose found!");
//    }   
//}

function detectOutOfCanvas(){
    const nose = pose.nose;
    const leftShoulder = pose.leftShoulder;
    const rightShoulder = pose.rightShoulder;
    console.log("x"+nose.x);
    console.log("y"+nose.y);
    if (nose && nose.x && nose.y){
        if (nose.x < 0 || nose.x >= 800){
            console.log("nose x position is out of the image");
        }
    }
    if (nose && nose.x && nose.y){
        if (nose.y < 0 || nose.y >= 600){
            console.log("nose y position is out of the image");
        }
    }
    if (leftShoulder && leftShoulder.x && leftShoulder.y){
        if (leftShoulder.y < 0 || leftShoulder.y >= 600){
            console.log("leftShoulder y position is out of the image");
        }
    }
    if (leftShoulder && leftShoulder.x && leftShoulder.y){
        if (leftShoulder.x < 0 || leftShoulder.x >= 800){
            console.log("leftShoulder x position is out of the image");
        }
    }
    if (rightShoulder && rightShoulder.x && rightShoulder.y){
        if (rightShoulder.x < 0 || rightShoulder.x >= 800){
            console.log("rightShoulder x position is out of the image");
        }
    }
    if (rightShoulder && rightShoulder.x && rightShoulder.y){
        if (rightShoulder.y < 0 || rightShoulder.y >= 600){
            console.log("rightShoulder y position is out of the image");
        }
    }
}