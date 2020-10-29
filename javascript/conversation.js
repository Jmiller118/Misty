function StartListening() {

    misty.StartKeyPhraseRecognition();
    misty.RegisterEvent("KeyPhraseRecognized","KeyphraseRecognized", 10, false);
    misty.Debug("Misty is listening and will beep when she hears 'Hey Misty'.");

}

function _KeyPhraseRecognized() {

    let audioFileName = "temp_input_audio.wav";

    misty.PlayAudio("002-Weerp.wav", 100);

    misty.StartRecordingAudio(audioFileName);
    misty.ChangeLED(28, 230, 7); //green

    misty.Pause(4000);

    misty.StopRecordingAudio();
    misty.ChangeLED(224, 12, 12); // red

    misty.GetAudioFile(audioFileName, "ProcessAudioFile");

}


function ProcessAudioFile(data) {

    // start listening again while processing audio and responding
    StartListening();

    misty.Debug(JSON.stringify(data));

    let base64 = data.Result.Base64;

    let sessionId = getSessionId();
	let url = "https://dialogflow.googleapis.com/v2/projects/" + _params.projectId + "/agent/sessions/" + sessionId + ":detectIntent";
    let authorizationType =  "Bearer";

    var dialogFlowParams = JSON.stringify({
        "queryInput": {
            "audioConfig": {
                "audioEncoding": "AUDIO_ENCODING_LINEAR_16",
                "languageCode": "en-US",
                "sampleRateHertz": 48000
            }
        },
        "inputAudio": base64,
        outputAudioConfig: {
            audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
            "synthesizeSpeechConfig": {
                "speakingRate": 1,
                "pitch": 5,
                "volumeGainDb": 0,
                "effectsProfileId": [],
                "voice": {
                    "name": "en-US-Wavenet-C",
                    "ssmlGender": "SSML_VOICE_GENDER_FEMALE"
                }
            }
        }
    });

    let accessToken = misty.Get("googleAccessToken");

    misty.SendExternalRequest("POST", url, authorizationType, accessToken, dialogFlowParams, false, false, null, "application/json", "ProcessDialogFlowResponse");

}

function ProcessDialogFlowResponse(data) {

    let response = JSON.parse(data.Result.ResponseObject.Data)

    misty.Debug("DialogFlow response: " + JSON.stringify(response));
    misty.Debug("Input text: " + response.queryResult.queryText);
    misty.Debug("Ouput text: " + response.queryResult.fulfillmentText);

    let audioData = response.outputAudio;

    misty.ChangeLED(0, 173, 239); // blue

    // this skill seems to be more reliable when we cycle through 
    // different audio files instead of using the same one each time
    let outputFilename = getRandomInt(50) + "_temp_output_audio.wav";

    misty.SaveAudio(outputFilename, audioData, true, true);

}


