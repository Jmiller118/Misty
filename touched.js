//make misty make noises when she is touched

//this will tell us which location was touched
misty.AddReturnProperty("Touched", "sensorPosition");

//value of isContacted
misty.AddReturnProperty("Touched", "isContacted");

//register new event listener for touchsensor events
misty.RegisterEvent("Touched", "TouchSensor", 50, true);

function _Touched(data) {
	var sensor = data.AdditionalResults[0];
	var isPressed = data.AdditionalResults[1];

	isPressed ? misty.Debug(sensor+ " is Touched") : misty.Debug(sensor+ " is Released");

	if (isPressed) {
		if (sensor == "Chin") {
			misty.PlayAudio("s_PhraseOwwww.wav");
		} else if (sensor == "HeadRight") {
			misty.PlayAudio("s_Love.wav");
		} else if (sensor == "HeadLeft") {
			misty.PlayAudio("s_Boredom");
		} else if (sensor == "HeadFront") {
			misty.PlayAudio("s_Acceptance.wav");
		} else if (sensor == "HeadBack") {
			misty.PlayAudio("s_Disapproval.wav");
		} else if (sensor == "Scruff") {
			misty.PlayAduio("s_Grief.wav");
		} else {
			misty.Debug("Sensor Unknown");
		}

	}

};
