/*
 *  MIT License
 *
 *
 *  Copyright (c) 2019 Cameron Henneke
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 * 
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
*/


const TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token";
//const TOKEN_URL = "https://www.googleapis.com/robot/v1/metadata/x509/dialogflow-ltxthn%40misty02-s9fs.iam.gserviceaccount.com"


/* Set to false to use Misty's built-in text-to-speech functionality
 * Using Misty.speak() should make her responses faster, because only 
 * the response text is sent by DialogFlow instead of an audio file
 */


/* 
 * Init in called at the very end of this file to ensure all the
 * necessary functions are defined and available
 */
function Init(){
    misty.Debug("Initializing Conversation skill");
    SetVolumeForSkill();
	CheckAccessToken();
}

/* 
 * Main is run after the googleAccessToken has been verified or acquired
 */
function Main() {
    StartListening();
}

/* 
 * Set the volume to 60% to work around the bug where Misty records silent audio
 * https://community.mistyrobotics.com/t/misty-records-silent-audio-files/2146
 */
function SetVolumeForSkill(){
    misty.SetDefaultVolume(60);
}

/* 
 * Checks if the stored accessToken has expired and gets a new one if necessary
 */
function CheckAccessToken(){

    const BUFFER_IN_SECONDS = 300;
    let currentTimeInSeconds = parseInt((new Date().getTime() / 1000), 10);
    let tokenExpiration = misty.Get("tokenExpiration");

    misty.Debug("tokenExpiration: " + tokenExpiration);

    // if current token is not expired proceed with skill
    if((currentTimeInSeconds + BUFFER_IN_SECONDS) < tokenExpiration){
        Main();
    } else {
        GetAccessToken();
    }

}

/* 
 * Gets a current accessToken to use for accessing the DialogFlow API. 
 * Access Tokens expire after 1 hour.
 */
function GetAccessToken(){

    let claimSet = GetClaimSet();
    let assertion = GetAssertion(claimSet, _params.private_key, _params.private_key_id);

    GetAccessTokenFromGoogle(assertion);

}


/*
 * Returns a claimSet that can be signed and sent to Google 
 * to exchange for an accessToken
 */
function GetClaimSet(){

    const issuedAtTime = Date.now();
	const expireAtTime = issuedAtTime + (60 * 60 * 1000);

    let claimSet = {
        scope: _params.scopes,
        iss:  _params.client_email,
        sub: _params.client_email,
        aud: TOKEN_URL,
        iat: Math.floor(issuedAtTime / 1000),
        exp: Math.floor(expireAtTime / 1000),
    };

    return claimSet;

}


/*
 * Returns a signed JSON Web Token (JWT) that can be sent to Google
 * to get an accessToken
 */
function GetAssertion(claimSet, privateKey, privateKeyId) {

    var header = {alg: "RS256", typ: "JWT", kid : privateKeyId};
    return KJUR.jws.JWS.sign(header.alg, header, claimSet, privateKey);

}


/*
 * Sends a signed JWT to Google to receive a current accessToken
 */
function GetAccessTokenFromGoogle(assertion){

    let params = JSON.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: assertion,
    })

    let contentType = "application/json";

    misty.SendExternalRequest("POST", TOKEN_URL, null, null, params, false, false, null, contentType, "SetAccessToken");

}

/* 
 * Stores the access token for use later with the DialogFlow API.
 * Calls Main() to start the skill
 */
function SetAccessToken(data){

    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Debug("Auth response: " + JSON.stringify(response))

    let accessToken = response.access_token;

    let currentTimeInSeconds = parseInt((new Date().getTime() / 1000), 10);
    let tokenExpiration = currentTimeInSeconds + response.expires_in;

    misty.Set("googleAccessToken", accessToken, true);
    misty.Set("tokenExpiration", tokenExpiration, true);

    Main();

}


/*
 * Activates key phrase recognition
 */
function StartListening() {


    // Registers a listener for VoiceRecord event messages, and adds return
    // properties to event listener so that we get all this data in the
    // _VoiceRecord callback.
    misty.AddReturnProperty("VoiceRecord", "Filename");
    misty.AddReturnProperty("VoiceRecord", "Success");
    misty.AddReturnProperty("VoiceRecord", "ErrorCode");
    misty.AddReturnProperty("VoiceRecord", "ErrorMessage");
    misty.RegisterEvent("VoiceRecord", "VoiceRecord", 10, false);

    misty.RegisterEvent("KeyPhraseRecognized","KeyphraseRecognized", 10, false);

    misty.StartKeyPhraseRecognition();

    misty.Debug("Misty is listening and will beep when she hears 'Hey Misty'.");

}

/* 
 * This gets called after the StartKeyPhrase recording has finished.
 * Use the audio file name to get the audio file and process.
 */
function _VoiceRecord(data) {

    misty.Debug("voice record data: " + JSON.stringify(data));

    // Get data from AdditionalResults array
    var audioFileName = data.AdditionalResults[0];
    var success = data.AdditionalResults[1];
    var errorCode = data.AdditionalResults[2];
    var errorMessage = data.AdditionalResults[3];
 
    if (success = true) {
        misty.Debug("Successfully captured speech to " + audioFileName);
	//misty.GetAudioFile(audioFileName, "ProcessAudioFile");
    	misty.GetAudioFile(audioFileName, true);
    } else {
        misty.Debug("This is a test")
	misty.Debug("Error: " + errorCode + ". " + errorMessage);
    }
 }

/* 
 * Sends the audio file as Base64 to the DialogFlow project where speech-to-text
 * is used to determine what the person said, match it with an intent, and then
 * send back an appropriate audio response using text-to-speech.
 */
function ProcessAudioFile(data) {

    // Set this to false to use Misty's internal TTS functionality, which will
    // be faster, because audio must not be sent in the response.  However, using
    // Google for speech gives you more control over the sound of the voice.
    const USE_GOOGLE_VOICE_FOR_SPEECH = true

    misty.Debug(JSON.stringify(data));

    let base64 = data.Result.Base64;

    let sessionId = getSessionId();
	let url = "https://dialogflow.googleapis.com/v2/projects/" + _params.projectId + "/agent/sessions/" + sessionId + ":detectIntent";
    let authorizationType =  "Bearer";

    var dialogFlowParams = {
        "queryInput": {
            "audioConfig": {
                "audioEncoding": "AUDIO_ENCODING_LINEAR_16",
                "languageCode": "en-US",
                "sampleRateHertz": 16000
            }
        },
        "inputAudio": base64

    };

    if(USE_GOOGLE_VOICE_FOR_SPEECH){
        dialogFlowParams.outputAudioConfig = {
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
        };
    }

    dialogFlowParams = JSON.stringify(dialogFlowParams);

    let accessToken = misty.Get("googleAccessToken");

    misty.SendExternalRequest("POST", url, authorizationType, accessToken, dialogFlowParams, false, false, null, "application/json", "ProcessDialogFlowResponse");

}


/* 
 * Get the audio response from DialogFlow, save it to Misty and play immediately
 */
function ProcessDialogFlowResponse(data) {

    let response = JSON.parse(data.Result.ResponseObject.Data)

    misty.Debug("DialogFlow response: " + JSON.stringify(response));
    misty.Debug("Input text: " + response.queryResult.queryText);
    misty.Debug("Ouput text: " + response.queryResult.fulfillmentText);

    let audioData = response.outputAudio;
    let fulfillment = response.queryResult.fulfillmentText;

    if(fulfillment === "batteryLevel"){

        misty.GetBatteryLevel("ProcessBatteryLevel");
        return;

    }

    misty.ChangeLED(0, 173, 239); // blue

    // if no audio data in the response, then have Misty
    // speak the text response with built-in TTS
    if(!audioData){
        misty.Speak(fulfillment);
    } else {
        // this skill seems to be more reliable when we cycle through 
        // different audio files instead of using the same one each time
        let outputFilename = getRandomInt(50) + "_temp_output_audio.wav";
        misty.SaveAudio(outputFilename, audioData, true, true);
    }

    // start listening again while processing audio and responding
    StartListening();

}


function getSessionId(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/*
 * This function allows you to ask Misty her battery level.  To make this work:
 * 1. Enable Google Cloud Text-to-Speech API in your Google Cloud project:
 *        https://console.cloud.google.com/flows/enableapi?apiid=texttospeech.googleapis.com
 * 2. Create an intent in DialogFlow called misty.battery
 * 3. Add the training phrase "What's your battery level?"
 * 4. Add a text response "batteryLevel"
 * 
 * When ProcessDialogFlowResponse gets a response text of "batteryLevel", it calls this function
 * which get's Misty's battery level and then generates an speech response
*/
function ProcessBatteryLevel(data){
    
    //misty.Debug("Process Battery Level:" + JSON.stringify(data));
    let chargePercent = data.Result.ChargePercent;

    misty.Debug("Battery Level:" + chargePercent);

    let chargeText = (chargePercent * 100);
    chargeText = parseInt(chargeText, 10);

    misty.Debug("charge  text:" + chargeText);

    let batteryText = "My battery is at " + chargeText + " percent.";

    GetSpeech(batteryText);

}


function GetSpeech(inputText){

    var speechParams = JSON.stringify({
        'input':{
            'text': inputText
          },
          'voice':{
            'languageCode':'en-US',
            "name": "en-US-Wavenet-C",
            "ssmlGender": "FEMALE"
          },
          'audioConfig':{
            'audioEncoding':'LINEAR16',
            "speakingRate": 1,
                "pitch": 5,
                "volumeGainDb": 0,
            "effectsProfileId": []
          }
    });

    let url = "https://texttospeech.googleapis.com/v1beta1/text:synthesize";
    let authorizationType =  "Bearer";
    let accessToken = misty.Get("googleAccessToken");

    misty.SendExternalRequest("POST", url, authorizationType, accessToken, speechParams, false, false, null, "application/json", "ProcessSpeechResults");

}


function ProcessSpeechResults(data){

    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Debug("Speech response: " + JSON.stringify(response));

    let audioData = response.audioContent;

    misty.ChangeLED(0, 173, 239); // blue

    // this skill seems to be more reliable when we cycle through 
    // different audio files instead of using the same one each time
    let outputFilename = getRandomInt(50) + "_temp_output_audio.wav";

    misty.SaveAudio(outputFilename, audioData, true, true);

}

Init();
