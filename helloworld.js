misty.Debug("Hello world!")

//misty.Speak("Hello world!");

/*
function getRandomInt(min,max) {
	return Math.floor(Math.random() * (max-min+1)) + min;
}

function _look_around(repeat=true) {
	misty.MoveHeadDegrees(
		getRandomInt(-40,20),
		getRandomInt(-30,30),
		getRandomInt(-40,40),
		nulll,
		1);

	if (repeat) misty.RegisterTimerEvent(
		"look_around",
		getRandomInt(5,10)*1000,
		false);
}

//move her head
misty.RegisterTimerEvent("look_around", getRandomInt(5,10) * 1000, false);

//making Misty appear to breath
misty.TransitionLED(140,0,220,0,0,0, "Breathing", 1000);

//making Misty talk
misty.PlayAudio("s_Amazement.wav", 100);
misty.Pause(3000);

*/
//move her arm to wave
function waveRightArm() {
	misty.MoveArmDegrees("right", -80, 30);
	misty.Pause(1000);
	misty.MoveArmDegrees("both", 80, 30);
}

//waveRightArm();




//facial recongition
function _registerFaceRec() {
	misty.StopFaceRecognition();
	misty.StartFaceRecognition();
	
	//make sure we are getting the good data
	//if facerec event includes a label, then do _facerec callback
	misty.AddPropertyTest("FaceRec", "Label", "exists", "", "string");
	misty.RegisterEvent("FaceRec", "FaceRecognition", 1000, false);
}

function _FaceRec(data) {
	//stores the value of the detected face
	var faceDetected = data.PropertyTestResults[0].PropertyParent.Label;
	misty.Debug("Misty sees " + faceDetected);

	if (faceDetected == faceDetected) {
		misty.DisplayImage("e_Joy.jpg");
		misty.PlayAudio("s_Joy3.wav");
		waveRightArm();
		misty.Speak("Hello" + faceDetected);
	} else if (faceDetected == "unknown person") {
		misty.DisplayImage("e_Contempt.jpg");
		misty.PlayAudio("s_DisorientedConfused4.wav");
		

		//misty.StartFaceTraining("Jordan");
		//misty.StopFaceTraining();
	};

	misty.RegisterTimerEvent("registerFaceRec", 7000, false);
}

_registerFaceRec();

