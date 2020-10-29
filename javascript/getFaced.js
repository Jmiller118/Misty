//test to see if faces are there
//
function getFaces() {
	misty.GetKnownFaces();
}

function _GetKnownFaces(callbackData) {
	var faces = callbackData.Result;
	misty.Debug(faces);
}

getFaces();
