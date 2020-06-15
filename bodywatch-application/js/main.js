let video;
let poseNet;
let pose;
let options = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 1,
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
let frequentTime = 15; 
let goodPoseTime = 30;
let tipsTime = 10;
let badpose_per_session = [];
let badposeCounter_per_session = 0;
let pausesTaken = 0;
let goodPoseCounter_per_session = 0;
let startTimeVar;
let endTimeVar;
let spendTimeVar;
let used = false;
let diffHrs; 
let diffMins;
var lS_badPosesCounter; 
var lS_goodPosesCounter; 
var lS_pauseTakenCounter;
var lS_diffHrs;
var lS_diffMins;
let startimeChecker = 0;

//1
function setup() {
    //create camera window and webcam usage.
    var canvas = createCanvas(640, 480);
    //connects to the div canvasPosition. 
    canvas.parent('canvasPosition'); 
    //relocate canvas
    canvas.position(0,0);

    video = createCapture(VIDEO);
    poseNet = ml5.poseNet(video, options, check);
    
    poseNet.on('pose', showPoses)
    video.hide();

    randomNotifications();
    checkGoodPose();
    randomTips(); 
    loadStatistics();
}

//simple check to ensure the program will run. Needed a simple function to use proper options for PoseNet. 
//3
function check() {
    console.log('check');
    startTime(); 
}

//if a pose gets detected, create an array with the keypoints and make it visible. this way we can check if a person is out of the screen or still visible.
//2
function showPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        detectOutOfCanvas();
    }
}

//creates a good starting pose which the program uses to check pose. 
//4
function displayStartPose() {
    startingD = d;
    document.getElementById("start").innerHTML = startingD;
}

//creates a bad pose which the programs uses to check pose. 
//5
function displayBadPose() {
    badD = d;
    document.getElementById("bad").innerHTML = badD;
}

//function to show notification split into mute/unmuted can remove one if we choose to let users mute via System
//6
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
        resetLeanCheck();
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
    else if (muteCheck == 'muted' && showPopup == 'false')
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

//random push messages like breaks and motivation.
//7
function randomNotifications() {
    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    openHyperlink();
                    this.close();
                }
            });
        }, frequentTime * 60 * 1000); 

    setTimeout(
        function() {
            Push.create('Time for a break!', {
                body: "Click on this notification to take a break. " + (frequentTime * 2) + " minutes have passed.",
                icon: 'img/breaktime.png',
                onClick: function () {
                    window.location.href = "./timer/timer_index.html"
                    takePause();
                    this.close();
                }
            });
        }, ((frequentTime * 2) * 60 * 1000)
    );

    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    window.open("https://www.youtube.com/watch?v=BdfTuxdfIE8");
                    this.close();
                }
            });
        }, (frequentTime * 3) * 60 * 1000); 

    setTimeout(
        function() {
            Push.create('Time for a break!', {
                body: "Click on this notification to take a break. " + (frequentTime * 4) + " minutes have passed.",
                icon: 'img/breaktime.png',
                onClick: function () {
                    window.location.href = "./timer/timer_index.html"
                    takePause();
                    this.close();
                }
            });
        }, ((frequentTime * 4) * 60 * 1000)
    );

    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    window.open("https://www.youtube.com/watch?v=R86jwm1HIvk");
                    this.close();
                }
            });
        }, (frequentTime * 5) * 60 * 1000); 

    setTimeout(
        function() {
            Push.create('Time for a break!', {
                body: "Click on this notification to take a break. " + (frequentTime * 6) + " minutes have passed.",
                icon: 'img/breaktime.png',
                onClick: function () {
                    window.location.href = "./timer/timer_index.html"
                    takePause();
                    this.close();
                }                   
            });
        }, ((frequentTime * 6) * 60 * 1000),
    );

    setTimeout(
        function() {
            Push.create("Good job!", {
                body: "Do not forget to do some stretches click here for a small routine",
                icon: 'img/stretch.png',
                onClick: function () {
                    window.open("https://www.youtube.com/watch?v=6fnLKyRJsrs");
                    this.close();
                }
            });
        }, (frequentTime * 7) * 60 * 1000); 

        setTimeout(
            function() {
                Push.create('Time for a break!', {
                    body: "Click on this notification to take a break. " + (frequentTime * 8) + " minutes have passed.",
                    icon: 'img/breaktime.png',
                    onClick: function () {
                        window.location.href = "./timer/timer_index.html"
                        takePause();
                        this.close();
                    }                   
                });
            }, ((frequentTime * 8) * 60 * 1000),
        );
}

//opens new tab with a youtube video to show stretch practices.
//8
function openHyperlink() {
    window.open("https://www.youtube.com/watch?v=6lJBZCRlFnI");
}

//function to reset leancheck, which you could click on to reset. this way it's automated.
//9
function resetLeanCheck() {
    setTimeout(
    function() {
        leanCheck = 0;
        changeColorToGood();
    }, 15000);
}

//function to mute/unmute sound can remove if we want people to just mute via System
//10
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
//11
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
//12
function showMenu() {
    var x = document.getElementById("myMenu");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else {
        x.style.display = "none";
    }
}

//function to create a save function for the settings users can change. 
//72
function testing_save() { 
    //here we tell where the values can be found that we want to save (where to look for in the HTML code. for example a tag with id "myMute")
    ////sound 
    var sound = document.getElementById("myMute").innerHTML;
    ////notification
    var notification = document.getElementById("myPopup").innerHTML;
    ///frequentietimer
    var frequenttimer = document.getElementById("myFrequentTime").value;
    ///goodposecheck
    var goodposetimer = document.getElementById("myGoodPoseTime").value;
    /// startPose
    var startpositie = document.getElementById("start").innerHTML;
    /// badPose
    var badpositie = document.getElementById("bad").innerHTML;

    //Set, here we create a localStorage with a ("key", "value") pair. For the settings we choose localStorage instead of sesssionStorage
    //Because we want to be able to load the settings even after the browser is closed and opened again.
    localStorage.setItem("sound", sound);
    localStorage.setItem("notification", notification);
    localStorage.setItem("frequenttimer", frequenttimer);
    localStorage.setItem("goodposetimer", goodposetimer);
    localStorage.setItem("startpositie", startpositie);
    localStorage.setItem("badpositie", badpositie);
} 

//function to load the saved values at the corresponding HTML tag
//73
function testing_load(){
     //Retrieve the values visually 
    document.getElementById("myMute").innerHTML = localStorage.getItem("sound");
    document.getElementById("myPopup").innerHTML = localStorage.getItem("notification");
    document.getElementById("myFrequentTime").value = localStorage.getItem("frequenttimer");
    document.getElementById("myGoodPoseTime").value = localStorage.getItem("goodposetimer");
    document.getElementById("start").innerHTML = localStorage.getItem("startpositie");
    document.getElementById("bad").innerHTML = localStorage.getItem("badpositie");

    //Put the saved values at the corresponding variable
    muteCheck = localStorage.getItem("sound");
    showPopup = localStorage.getItem("notification");
    badD = Number(localStorage.getItem("badpositie"));
    startingD = Number(localStorage.getItem("startpositie"))
    frequentTime = localStorage.getItem("frequenttimer");        
    goodPoseTime = localStorage.getItem("goodposetimer");
}

//function to save time and put in an array. shows on the top right div. only used when a bad pose is detected.
//74
function recordBadPose() {
    var time = new Date();
    var timeconverted = time.toUTCString();
    badpose_per_session.unshift(timeconverted);
}

//prints the array from previously made function in the top right div.
//75
function printBadSession(){
    for (let index = 0; index < badpose_per_session.length; index++) {
        //console.log(badpose_per_session[index]);
    }

    text = "<ul>";
    for (i = 0; i < badpose_per_session.length; i++) {
        text += "<li>" + badpose_per_session[i] + "</li>";
            }
        text += "</ul>";
    document.getElementById("demo2").innerHTML = text;
}

//changes color when pose is bad. goes from green to red. changes text as well.
//76
function changeColorToBad() {
    document.getElementById("gwd-div-uhf8").style.backgroundColor = "red";
    document.getElementById("gwd-span-1rvu").innerHTML = "Your posture is wrong!";
}

//changes color when pose is good. goes from red to green. changes text as well.
//77
function changeColorToGood() {
    document.getElementById("gwd-div-uhf8").style.backgroundColor= 'rgb(' + 63 + ',' + 255 + ',' + 0 + ')';
    document.getElementById("gwd-span-1rvu").innerHTML = "Your posture is correct! Good job :)";
}

//function to show the statistics like the save/load function for the settings we tell where to display it in the HTML code
//78
function showStatistics() {
    document.getElementById("badPoses").innerHTML = lS_badPosesCounter;
    document.getElementById("goodPoses").innerHTML = lS_goodPosesCounter;
    document.getElementById("amountBreaks").innerHTML = lS_pauseTakenCounter;
    document.getElementById("timeWorked").innerHTML = lS_diffHrs + "h : " + lS_diffMins + "m";    
}

//function to load the saved files and show the statistic at the 'statistic page' with a little delay.
//79
function displayStatistics(){
    loadLocalStats();
    setTimeout(
        function() {
            showStatistics();
        }, 2200); 
}

//function to make it easier then putting the whole sequence everytime we want to take a pause
//it adds 1 to the pauseTaken for the statistics and updates the sessionStorage with the ("key", "value") pair for pauses 
//80
function takePause(){
    pausesTaken += 1;
    sessionStorage.setItem("pauseTaken", pausesTaken);
    collectStatistics();
}

//function to collect the values of the statistics we want to collect. 
//Chose for sessionStorage instead of localStorage because we just want to save the statistics for one session each time
//81
function collectStatistics()
{
    sessionStorage.setItem("badPoses", badposeCounter_per_session);
    sessionStorage.setItem("goodPoses", goodPoseCounter_per_session);
    sessionStorage.setItem("startTime", startTimeVar);
    sessionStorage.setItem("startimeChecker", startimeChecker);
    console.log("collected statistics")
}

//put the saved values from the ("key", "value") pair to the corresponding variable
//82
function loadStatistics()
{
    badposeCounter_per_session = Number(sessionStorage.getItem("badPoses"));
    goodPoseCounter_per_session = Number(sessionStorage.getItem("goodPoses"));
    pausesTaken = Number(sessionStorage.getItem("pauseTaken"));
    startTimeVar = Number(sessionStorage.getItem("startTime"));
    startimeChecker = Number(sessionStorage.getItem("startimeChecker"));
    console.log("loaded statistics")
}

//function that is called when you are 'done' and want to see the statistics
//it creates a timestamp for when you are 'done' and calculates the time between the start and the end so you get the statistic 'spendTime'
//and it saves all the stats one more time and pushes you to the statistics page
//83
function loadEndPage()
{
    endTime();
    calculateSpendTime();
    saveLocalStats();
    location.href = "./endpage/index.html";
}

//creates a temporary localStorage of the statistics because there were problems saving / loading sessionStorage when we were testing locally 
//because the domain was 'different' according to the browser you don't share the same 'session'
//84
function saveLocalStats()
{
    localStorage.setItem("lS_badPose", badposeCounter_per_session);
    localStorage.setItem("lS_goodPose", goodPoseCounter_per_session);
    localStorage.setItem("lS_pauseTaken", pausesTaken);
    localStorage.setItem("lS_diffHrs", diffHrs);
    localStorage.setItem("lS_diffMins", diffMins);
}

//creates a temporary localStorage of the statistics because there were problems saving / loading sessionStorage when we were testing locally 
//because the domain was 'different' according to the browser you don't share the same 'session'
//85
function loadLocalStats()
{
    lS_badPosesCounter = Number(localStorage.getItem("lS_badPose"));
    lS_goodPosesCounter = Number(localStorage.getItem("lS_goodPose"));
    lS_pauseTakenCounter = Number(localStorage.getItem("lS_pauseTaken"));
    lS_diffHrs = Number(localStorage.getItem("lS_diffHrs"));
    lS_diffMins = Number(localStorage.getItem("lS_diffMins"));
}

//creates a startTime timestamp when the cam is first started
//after which it creates a check so you do not get a new startTime timestamp everytime you load the cam again for example when going/coming to and from the pause page
//86
function startTime()
{
    if (startimeChecker == 0){
        startTimeVar = Date.now();
        startimeChecker = 1;
    }
    else if (startimeChecker > 0)
    {
        console.log("boe");
    }
    //sessionStorage.setItem("startTime", startTimeVar); 
}

//creates a endTime timestamp to calculate endTime - startTime = spendTime
//87
function endTime() 
{
    startTimeVar = Number(sessionStorage.getItem("startTime"));
    endTimeVar = Date.now();
}

//calculates endTime - startTime to create the statistic spendTime
//88
function calculateSpendTime()
{
    var diffMs = (endTimeVar - startTimeVar);
    var diffDays = Math.floor(diffMs / 86400000); // days
    diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    sessionStorage.setItem("diffHrs", diffHrs);
    sessionStorage.setItem("diffMins", diffMins);
    console.log(diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes spend using this application");
}

//this function rotates random tips for the user within the browser so not as pop up notifications
//here we want to show 'less' important notifications to motivate the user
//89
function randomTips(){
    var textField = document.getElementById("tipsText");
    setTimeout(
        function() {
            textField.innerHTML = "Please take short brakes, dont work for more than two hours at the time"
        }, tipsTime * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "Remember to stretch!"
        }, (tipsTime * 2) * 60 * 1000); 
    
    setTimeout(
        function() {
            textField.innerHTML = "This software is not a medical expert, please see one if needed"
        }, (tipsTime * 3) * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "Stress can cause backpains! Remember to take a break once in a while!"
        }, (tipsTime * 4) * 60 * 1000);

    setTimeout(
        function() {
            textField.innerHTML = "Stuck on something, try to take a little break to clear your mind."
        }, (tipsTime * 5) * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "Did you know that a good pose, also improves your productivity."
        }, (tipsTime * 6) * 60 * 1000); 

    setTimeout(
        function() {
            textField.innerHTML = "A break helps your focus"
            randomTips(); 
        }, (tipsTime * 7) * 60 * 1000); 
}

//function to check if the person has been sitting correctly for the past minute(s).
//90
function checkGoodPose(){
    setTimeout(
        function() {
            rewardGoodPose();
        }, goodPoseTime * 60 * 1000); 
}

//function to reward the user for keeping it's good pose for x minutes.
//91
function rewardGoodPose(){
    if (reward_good_pose == 'true')
    {
        Push.create("Keep it up", {
            body: "You had no bad poses for " + goodPoseTime + " minutes!",
            icon: 'img/sticker.png',
            onClick: function () {
                this.close();
            }
        });
        goodPoseCounter_per_session += 1;
        clearTimeout(checkGoodPose);
        checkGoodPose();
    }
    else {
        Push.create("Dont give up", {
            body: "You had a bad poses in the last " + goodPoseTime + " minutes!",
            icon: 'img/hanginthere.png',
            onClick: function () {
                this.close();
            }
        });
        reward_good_pose = 'true';
        clearTimeout(checkGoodPose);
        checkGoodPose();
    }
}

//function to let the user change the time between the random notifications. 
//92
function myFrequentTime() {
    var x = document.getElementById("myFrequentTime");
    frequentTime = Number(x.value);
    clearTimeout(randomNotifications); 
    randomNotifications();
}

//function to let the user change the time between the good pose notification.
//93
function myGoodPoseTime() {
    var x = document.getElementById("myGoodPoseTime");
    goodPoseTime = Number(x.value);
    clearTimeout(checkGoodPose); 
    clearTimeout(rewardGoodPose);
    checkGoodPose();
}

//function to let the user change the time between tips notification
//94
function myTipsTime() {
    var x = document.getElementById("myTipsTime");
    tipsTime = Number(x.value);
    clearTimeout(randomTips);
    randomTips();
}

//plays a sound when called
//95
function playSound(filename){
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
}

//draws the keypoints so the camera can manage the good poses and bad poses
function draw() {
    drawKeyPoints();
    newDrawKeyPoints();
}

//function to make the nose bigger, how closer the person is to the camera. 
//96
function drawKeyPoints() {
    image(video, 0, 0);
        
    try {
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        //97
        if (d > startingD + (badD - startingD) && leanCheck == 0){
            showNotificaton();
            reward_good_pose = 'false';

                recordBadPose();
                printBadSession();
                badposeCounter_per_session += 1;
                changeColorToBad();
            } 
    }
    catch (err) {
       console.log("No pose found.");
    }
    
}

function newDrawKeyPoints(){
    try {
        //variables needed for the checks
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        let shoulderR = pose.shoulderR;
        let shoulderL = pose.shoulderL;
        let nose = pose.nose;
        distanceright = dist(eyeR.x, shoulderR.x, eyeR.y, shoulderR.y);
        distanceleft = dist(eyeL.x, shoulderL.x, eyeL.y, shoulderL.y);
        distancenoseleft = dist(nose.x, shoulderL.x, nose.y, shoulderL.y);
        distancenoseright = dist(nose.x, shoulderR.x, nose.y, shoulderR.y);
        //measurement for the posture
        if (distanceright > (distanceleft - 5) && leanCheck == 0){
            showNotificaton();
            reward_good_pose = 'false';

                recordBadPose();
                printBadSession();
                badposeCounter_per_session += 1;
                changeColorToBad();
        }
    }
    catch (err) {
       console.log("Nothing wrong going on.");
    }
    // || distanceleft > distanceright || distancenoseleft > distancenoseright || distancenoseright > distancenoseleft
}


//function gives a notification where you can click on if the person is still there. 
//will trigger after 10 seconds by going to the break page if notification is not clicked.
//98
function personNotFound() {
    if (used == false) {
        console.log("Nobody is behind the camera.");
        let timeout = setTimeout(
                        function() { 
                            takePause();
                            window.location.href ="./timer/timer_index.html" },
                             10000);

        Push.create('Are you still here?', {
            body: "Click on this notification if you are here.",
            onClick: function () {
                clearTimeout(timeout);
                console.log("Person back.");
                used = false;
                this.close();
            }
        });
        used = true;
    }    
}

//checks if the nose is still visible on the camera. if not found, calls personNotFound to create a notification.
//99
function detectOutOfCanvas(){
    const nose = pose.nose;
    if (nose && nose.x && nose.y){
        if (nose.x < 0 || nose.x >= 640){
            personNotFound();
        }
    }
}