var apn = require('./apn');

var note = apn.notification();
note.badge = 1;
var msg = 'i test';
note.setAlertText("pk[result: " + msg);
note.payload.push_type = 'res';
note.payload.pk_result = 'win';
note.payload.pk_from = 'username';
apn.pushNotification(note, 'b115e358766f5d3347be9bb1eb7784342b63af0b9a06950fd398e995ea9f4da5');