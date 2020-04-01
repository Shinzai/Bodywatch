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
let skeleton;
let shoulderL;
let shoulderR;

function setup() {
    //create camera window and webcam usage.
    createCanvas(1024, 768);
    video = createCapture(VIDEO);    
    poseNet = ml5.poseNet(video, modelReady);
    
    poseNet.on('pose', showPoses)
    
    video.hide();
}

function showPoses(poses) {
    //show pose x and y variables.
    console.log(poses);
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelReady() {
    //check if model is loaded in.
    console.log('Loaded');
}

function draw() {
    //draw both keypoints and the skeleton for testing purposes.
    drawKeyPoints();
    drawSkeleton();
}

function drawKeyPoints() {
    image(video, 0, 0);
        
    try {
        //make keypoints for the point between the shoulders
        let midX = shoulderL.position.x + (shoulderR.position.x - shoulderL.position.x) * 0.50;
        let midY = shoulderL.position.y + (shoulderR.position.y - shoulderL.position.y) * 0.50;
        
        //fill with color red and create ellipse to show the keypoints
        fill(255,0,0);
        ellipse(midX, midY, 34);
        ellipse(pose.nose.x, pose.nose.y, 34);
        ellipse(pose.leftShoulder.x, pose.leftShoulder.y, 30);
        ellipse(pose.rightShoulder.x, pose.rightShoulder.y, 30);  
    } 
    catch (err) {
//        console.log("no pose found!");
    }
}

function drawSkeleton() {
    try {
        //first 2 points in this array are the shoulders. 
        let a = skeleton[0][0];
        let b = skeleton[0][1];
        
        //put in global variable for drawKeyPoints
        shoulderL = a;
        shoulderR = b;
        
        //create middle keypoint for check later on
        let midX = shoulderL.position.x + (shoulderR.position.x - shoulderL.position.x) * 0.50;
        let midY = shoulderL.position.y + (shoulderR.position.y - shoulderL.position.y) * 0.50;
        
        strokeWeight(3);
        stroke(255);
        
        //draw lines
        line(a.position.x, a.position.y, b.position.x, b.position.y);  
        line(pose.nose.x, pose.nose.y, midX, midY);
    }
    catch(err) {
//        console.log("No pose found!");
    }
    
}