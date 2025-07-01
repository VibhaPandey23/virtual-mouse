let bodyPose;
let video;
let poses = [];
let connections;

// Preload the PoseNet model
function preload() {
    bodyPose = ml5.bodyPose();
}

// Setup function for canvas, video, and feedback areas
function setup() {
  const videoContainer = document.getElementById('video-container');

  let canvas = createCanvas(videoContainer.clientWidth, videoContainer.clientHeight);
  canvas.parent('video-container');

  video = createCapture(VIDEO); // Start video capture
  video.size(videoContainer.clientWidth, videoContainer.clientHeight);
  video.hide();

  bodyPose.detectStart(video, gotPoses); 
  connections = bodyPose.getSkeleton(); 
}

function gotPoses(results) {
    poses = results;
}

// wporks on continueus loop
function draw() {
    image(video, 0, 0, 0, 0);

    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i];
        analyzeBodyAlignment(pose); 
        drawSkeleton(pose); 
        drawKeypoints(pose);
    }
}

function analyzeBodyAlignment(pose) {
    let leftShoulder = pose.keypoints[5];
    let rightShoulder = pose.keypoints[6];
    let leftHip = pose.keypoints[11];
    let rightHip = pose.keypoints[12];
    let nose = pose.keypoints[0];
    let leftElbow = pose.keypoints[7];
    let rightElbow = pose.keypoints[8];
    let leftKnee = pose.keypoints[13];
    let rightKnee = pose.keypoints[14];
    let leftAnkle = pose.keypoints[15];
    let rightAnkle = pose.keypoints[16];

    // tp ensure all required keypoints are detected
    if (isValidPose(leftShoulder, rightShoulder, leftHip, rightHip, nose)) {
        analyzeShoulderAlignment(leftShoulder, rightShoulder);
        analyzeHipAlignment(leftHip, rightHip);
        analyzeNeckAlignment(nose, leftShoulder, rightShoulder);
        analyzeKneeAlignment(leftKnee, rightKnee);
        analyzeAnkleAlignment(leftAnkle, rightAnkle);
        analyzeArmAlignment(leftElbow, rightElbow);
    }
}

// to check if all keypoints are valid for analysis
function isValidPose(leftShoulder, rightShoulder, leftHip, rightHip, nose) {
    return leftShoulder.confidence > 0.5 &&
        rightShoulder.confidence > 0.5 &&
        leftHip.confidence > 0.5 &&
        rightHip.confidence > 0.5 &&
        nose.confidence > 0.5;
}

function analyzeShoulderAlignment(leftShoulder, rightShoulder) {
    let shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);

    if (shoulderDiff > 50) {
        showFeedback('shoulder-feedback', "Shoulder Misalignment Detected!", "Recommendation: Level your shoulders.", color(255, 255, 0));
    } else {
        showFeedback('shoulder-feedback', "Good Shoulder Alignment!", "Keep your shoulders relaxed.", color(0, 255, 0));
    }
}

function analyzeHipAlignment(leftHip, rightHip) {
    let hipDiff = Math.abs(leftHip.y - rightHip.y);

    if (hipDiff > 50) {
        showFeedback('hip-feedback', "Hip Misalignment Detected!", "Recommendation: Straighten your hips.", color(255, 0, 0));
    } else {
        showFeedback('hip-feedback', "Good Hip Alignment!", "Maintain level hips.", color(0, 255, 0));
    }
}


function analyzeNeckAlignment(nose, leftShoulder, rightShoulder) {
    let neckAlignment = Math.abs(nose.x - (leftShoulder.x + rightShoulder.x) / 2);

    if (neckAlignment > 30) {
        showFeedback('neck-feedback', "Neck Misalignment Detected!", "Recommendation: Align your neck with your shoulders.", color(255, 140, 0));
    } else {
        showFeedback('neck-feedback', "Good Neck Alignment!", "Keep your neck aligned with your shoulders.", color(0, 255, 0));
    }
}


function analyzeKneeAlignment(leftKnee, rightKnee) {
    let kneeDiff = Math.abs(leftKnee.y - rightKnee.y);

    if (kneeDiff > 50) {
        showFeedback('knee-feedback', "Knee Misalignment Detected!", "Recommendation: Align your knees.", color(255, 165, 0));
    } else {
        showFeedback('knee-feedback', "Good Knee Alignment!", "Ensure knees are in line with hips.", color(0, 255, 0));
    }
}

function analyzeAnkleAlignment(leftAnkle, rightAnkle) {
    let ankleDiff = Math.abs(leftAnkle.y - rightAnkle.y);

    if (ankleDiff > 50) {
        showFeedback('ankle-feedback', "Ankle Misalignment Detected!", "Recommendation: Align your ankles.", color(255, 0, 0));
    } else {
        showFeedback('ankle-feedback', "Good Ankle Alignment!", "Keep your ankles in line with knees.", color(0, 255, 0));
    }
}

function analyzeArmAlignment(leftElbow, rightElbow) {
    let elbowDiff = Math.abs(leftElbow.y - rightElbow.y);

    if (elbowDiff > 50) {
        showFeedback('arm-feedback', "Arm Misalignment Detected!", "Recommendation: Adjust arm positions.", color(255, 255, 0));
    } else {
        showFeedback('arm-feedback', "Good Arm Alignment!", "Keep arms relaxed and at sides.", color(0, 255, 0));
    }
}

//  to show feedback message
function showFeedback(feedbackId, feedbackText, recommendationText, color) {
    let feedbackDiv = select(`#${feedbackId}`);
    feedbackDiv.html(`<p style="color:${color};">${feedbackText}</p><p>${recommendationText}</p>`);
}

// tp draw skeleton connections
function drawSkeleton(pose) {
    for (let j = 0; j < connections.length; j++) {
        let pointAIndex = connections[j][0];
        let pointBIndex = connections[j][1];
        let pointA = pose.keypoints[pointAIndex];
        let pointB = pose.keypoints[pointBIndex];

        if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
            stroke(255, 0, 0);
            strokeWeight(2);
            line(pointA.x, pointA.y, pointB.x, pointB.y);
        }
    }
}

// to draw keypoints on the canvas
function drawKeypoints(pose) {
    for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        if (keypoint.confidence > 0.1) {
            fill(0, 255, 0);
            noStroke();
            circle(keypoint.x, keypoint.y, 10);
        }
    }
}
