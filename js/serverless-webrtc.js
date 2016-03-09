



function httpGetJSON(url, cb, timeout) {
	timeout = timeout || 3000;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			cb(this.response, this.status);
		} else if (this.readyState === 0) {
			cb(null);
		}
	};
	xhr.onerror = function() {
		cb(null);
	};
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.timeout = timeout;
	xhr.send(null);
}


var httpServer = 'http://' + document.URL.split('://')[1].split(':')[0] + ':8888';
console.info(httpServer);

var cfg = {'iceServers': [{'url': 'stun:23.21.150.121'}]};
var con = { 'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }] };

var pc1 = new RTCPeerConnection(cfg, con);
var dc1 = null;

function error(err) {
  console.info(err);
}

function processIce(iceCandidate){
  peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
}

function processAnswer(answer){
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  console.log("------ PROCESSED ANSWER ------");
};


var g_offer = null;
var g_answer = null;


$('#sendMessage').click(function(e) {
  dc1.send('asssssssssssssssss');
});

$('#setOffer').click(function () {
  pc1.onicecandidate = function(e) {
      if (!pc1 || !e || !e.candidate) return;
      console.info(e.candidate);
      //sendNegotiation("candidate", event.candidate);
  };

  dc1 = pc1.createDataChannel("my channel");

  dc1.onmessage = function (event) {
    console.log("received: " + event.data);
  };

  dc1.onopen = function () {
    console.log("datachannel open");
  };

  dc1.onclose = function () {
    console.log("datachannel close");
  };

  dc1.onerror = function () {
    console.log("datachannel error");
  };

  pc1.createOffer(function(offer) {
    console.info(offer);
    g_offer = offer;
    pc1.setLocalDescription(new RTCSessionDescription(offer), function() {
      //sendNegotiation("offer", offer);
      console.info(g_offer);
      $('#offer').val(JSON.stringify(g_offer));
      var enc_offer = encodeURIComponent(btoa(JSON.stringify(g_offer)));
      //console.info(enc_offer);
      httpGetJSON(httpServer + '/set_offer.json?offer=' + enc_offer, function(response, status) {
          if (status === 200) {
              console.info(response);
          } else {
              console.error('offer failed with status: ' + status);
          }
      });
    }, error);
  }, error, {"offerToReceiveAudio":false, "offerToReceiveVideo":false});
});

$('#getAnswer').click(function () {
  var enc_offer = encodeURIComponent(btoa(JSON.stringify(g_offer)));
  httpGetJSON(httpServer + '/get_answer.json?offer=' + enc_offer, function(response, status) {
      if (status === 200) {
          //console.info(response);
          g_answer = JSON.parse(atob(decodeURIComponent(response)));
          console.info(g_answer);
          $('#answer').val(JSON.stringify(g_answer));
      } else {
          console.error('offer failed .....');
      }
  });
});

$('#getOffer').click(function () {
  httpGetJSON(httpServer + '/get_offers.json', function(response, status) {
      if (status === 200) {
          var offer = response[0];
          g_offer = JSON.parse(atob(decodeURIComponent(offer)));
          $('#offer').val(JSON.stringify(g_offer));
          console.info(g_offer);
          pc1.setRemoteDescription(new RTCSessionDescription(g_offer), function() {
            pc1.createAnswer(function(answer) {
              g_answer = answer;
              $('#answer').val(JSON.stringify(g_answer));
              console.info(g_answer);
              pc1.setLocalDescription(new RTCSessionDescription(answer), function() {

              }, error);
            }, error);
          }, error);
      } else {
          console.error('offer failed .....');
      }
  });
});

$('#setAnswer').click(function () {
  console.info(g_answer);
  console.info(g_offer);
  var enc_answer = encodeURIComponent(btoa(JSON.stringify(g_answer)));
  var enc_offer = encodeURIComponent(btoa(JSON.stringify(g_offer)));
  //console.info(enc_answer);
  //console.info(enc_offer);
  httpGetJSON(httpServer + '/set_answer.json?answer=' + enc_answer + '&offer=' + enc_offer, function(response, status) {
      if (status === 200) {
          console.info(response);
      } else {
          console.error('answer failed .....');
      }
  });
});

/*
var httpServer = 'http://' + document.URL.split('://')[1].split(':')[0] + ':8888';
console.info(httpServer);
var cfg = {'iceServers': [{'url': 'stun:23.21.150.121'}]},
  con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] }

// THIS IS ALICE, THE CALLER/SENDER

var pc1 = new RTCPeerConnection(cfg, con),
  dc1 = null, tn1 = null

// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
var activedc

var pc1icedone = false
var g_offer = null;

function httpGetJSON(url, cb, timeout) {
	timeout = timeout || 3000;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			cb(this.response, this.status);
		} else if (this.readyState === 0) {
			cb(null);
		}
	};
	xhr.onerror = function() {
		cb(null);
	};
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.timeout = timeout;
	xhr.send(null);
}

var sdpConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
}

$('#showLocalOffer').modal('hide')
$('#getRemoteAnswer').modal('hide')
$('#waitForConnection').modal('hide')
$('#createOrJoin').modal('show')
$('#createBtn').attr('disabled', false);
$('#joinBtn').attr('disabled', false);

$('#createBtn').click(function () {
  $('#showLocalOffer').modal('show')
  createLocalOffer()
})

$('#joinBtn').click(function () {
  navigator.getUserMedia({video: true, audio: true}, function (stream) {
    var video = document.getElementById('localVideo')
    video.src = window.URL.createObjectURL(stream)
    video.play()
    pc2.addStream(stream)
  }, function (error) {
    console.log('Error adding stream to pc2: ' + error)
  })
  $('#getRemoteOffer').modal('show')
    httpGetJSON(httpServer + '/get_offers.json', function(response, status) {
        if (status === 200) {
            console.info(response);
            var offer = JSON.parse(atob(decodeURIComponent(response)));
            $('#remoteOffer').val(JSON.stringify(offer));
            $('#offerRecdBtn').attr('disabled', false);
            g_offer = offer;
        } else {
            console.error('offer failed .....');
        }
    });
})

$('#offerSentBtn').click(function () {
  $('#getRemoteAnswer').modal('show')
    var offer = encodeURIComponent(btoa(JSON.stringify(g_offer)));
    httpGetJSON(httpServer + '/get_answer.json?offer=' + offer, function(response, status) {
        if (status === 200) {
            var answer = JSON.parse(atob(decodeURIComponent(response)));
            console.info(answer);
            $('#remoteAnswer').val(JSON.stringify(answer));
            $('#answerRecdBtn').attr('disabled', false);
        } else {
            console.error('offer failed .....');
        }
    });
})

$('#offerRecdBtn').click(function () {
  var offer = $('#remoteOffer').val()
  var offerDesc = new RTCSessionDescription(JSON.parse(offer))
  console.log('Received remote offer', offerDesc)
  writeToChatLog('Received remote offer', 'text-success')
  handleOfferFromPC1(offerDesc)
  $('#showLocalAnswer').modal('show')
})

$('#answerSentBtn').click(function () {
  $('#waitForConnection').modal('show')
    var answer = $('#localAnswer').val();
    answer = JSON.parse(answer);
    console.info(answer);
    console.info(g_offer);

    answer = encodeURIComponent(btoa(JSON.stringify(answer)));
    var offer = encodeURIComponent(btoa(JSON.stringify(g_offer)));
    console.info(answer);
    console.info(offer);
    httpGetJSON(httpServer + '/set_answer.json?answer=' + answer + '&offer=' + offer, function(response, status) {
        if (status === 200) {
            console.info(response);
        } else {
            console.error('answer failed .....');
        }
    });
})

$('#answerRecdBtn').click(function () {
  var answer = $('#remoteAnswer').val()
  var answerDesc = new RTCSessionDescription(JSON.parse(answer))
  handleAnswerFromPC2(answerDesc)
  $('#waitForConnection').modal('show')
})

$('#fileBtn').change(function () {
  var file = this.files[0]
  console.log(file)

  sendFile(file)
})

function fileSent (file) {
  console.log(file + ' sent')
}

function fileProgress (file) {
  console.log(file + ' progress')
}

function sendFile (data) {
  if (data.size) {
    FileSender.send({
      file: data,
      onFileSent: fileSent,
      onFileProgress: fileProgress,
    })
  }
}

function sendMessage () {
  if ($('#messageTextBox').val()) {
    var channel = new RTCMultiSession()
    writeToChatLog($('#messageTextBox').val(), 'text-success')
    channel.send({message: $('#messageTextBox').val()})
    $('#messageTextBox').val('')

    // Scroll chat text area to the bottom on new input.
    $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight)
  }

  return false
}

function setupDC1 () {
  try {
    var fileReceiver1 = new FileReceiver()
    dc1 = pc1.createDataChannel('test', {reliable: true})
    activedc = dc1
    console.log('Created datachannel (pc1)')
    dc1.onopen = function (e) {
      console.log('data channel connect')
      $('#waitForConnection').modal('hide')
      $('#waitForConnection').remove()
    }
    dc1.onmessage = function (e) {
      console.log('Got message (pc1)', e.data)
      if (e.data.size) {
        fileReceiver1.receive(e.data, {})
      } else {
        if (e.data.charCodeAt(0) == 2) {
          // The first message we get from Firefox (but not Chrome)
          // is literal ASCII 2 and I don't understand why -- if we
          // leave it in, JSON.parse() will barf.
          return
        }
        console.log(e)
        var data = JSON.parse(e.data)
        if (data.type === 'file') {
          fileReceiver1.receive(e.data, {})
        } else {
          writeToChatLog(data.message, 'text-info')
          // Scroll chat text area to the bottom on new input.
          $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight)
        }
      }
    }
  } catch (e) { console.warn('No data channel (pc1)', e); }
}

function createLocalOffer () {
  console.log('video1')

  navigator.getUserMedia({video: true, audio: true}, function (stream) {
    var video = document.getElementById('localVideo')
    video.src = window.URL.createObjectURL(stream)
    video.play()
    pc1.addStream(stream)
    console.log(stream)
    console.log('adding stream to pc1')
    setupDC1()
    pc1.createOffer(function (desc) {
      pc1.setLocalDescription(desc, function () {
        console.log('aaaaaa');
      }, function () {
        console.log('bbbbbbb');
      })
      console.log('created local offer', desc)
    },
    function () { console.warn("Couldn't create offer") },
    sdpConstraints)
  }, function (error) {
    console.log('Error adding stream to pc1: ' + error)
  })
}

pc1.onicecandidate = function (e) {
  console.log('ICE candidate (pc1)', e)
  if (e.candidate == null) {
    $('#localOffer').html(JSON.stringify(pc1.localDescription));
    $('#offerSentBtn').attr('disabled', false);
    g_offer = pc1.localDescription;
    var offer = encodeURIComponent(btoa(JSON.stringify(g_offer)));
    httpGetJSON(httpServer + '/set_offer.json?offer=' + offer, function(response, status) {
        if (status === 200) {
            console.info(response);
        } else {
            console.error('offer failed with status: ' + status);
        }
    });
  }
}

function handleOnaddstream (e) {
  console.log('Got remote stream', e.stream)
  var el = document.getElementById('remoteVideo')
  el.autoplay = true
  attachMediaStream(el, e.stream)
}

pc1.onaddstream = handleOnaddstream

function handleOnconnection () {
  console.log('Datachannel connected')
  writeToChatLog('Datachannel connected', 'text-success')
  $('#waitForConnection').modal('hide')
  // If we didn't call remove() here, there would be a race on pc2:
  //   - first onconnection() hides the dialog, then someone clicks
  //     on answerSentBtn which shows it, and it stays shown forever.
  $('#waitForConnection').remove()
  $('#showLocalAnswer').modal('hide')
  $('#messageTextBox').focus()
}

pc1.onconnection = handleOnconnection

function onsignalingstatechange (state) {
  console.info('signaling state change:', state)
}

function oniceconnectionstatechange (state) {
  console.info('ice connection state change:', state)
}

function onicegatheringstatechange (state) {
  console.info('ice gathering state change:', state)
}

pc1.onsignalingstatechange = onsignalingstatechange
pc1.oniceconnectionstatechange = oniceconnectionstatechange
pc1.onicegatheringstatechange = onicegatheringstatechange

function handleAnswerFromPC2 (answerDesc) {
  console.log('Received remote answer: ', answerDesc)
  writeToChatLog('Received remote answer', 'text-success')
  pc1.setRemoteDescription(answerDesc)
}

function handleCandidateFromPC2 (iceCandidate) {
  pc1.addIceCandidate(iceCandidate)
}

// THIS IS BOB, THE ANSWERER/RECEIVER

var pc2 = new RTCPeerConnection(cfg, con),
  dc2 = null

var pc2icedone = false

pc2.ondatachannel = function (e) {
  var fileReceiver2 = new FileReceiver()
  var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
  console.log('Received datachannel (pc2)', arguments)
  dc2 = datachannel
  activedc = dc2
  dc2.onopen = function (e) {
    console.log('data channel connect')
    $('#waitForConnection').modal('hide')
    $('#waitForConnection').remove()
  }
  dc2.onmessage = function (e) {
    console.log('Got message (pc2)', e.data)
    if (e.data.size) {
      fileReceiver2.receive(e.data, {})
    } else {
      var data = JSON.parse(e.data)
      if (data.type === 'file') {
        fileReceiver2.receive(e.data, {})
      } else {
        writeToChatLog(data.message, 'text-info')
        // Scroll chat text area to the bottom on new input.
        $('#chatlog').scrollTop($('#chatlog')[0].scrollHeight)
      }
    }
  }
}

function handleOfferFromPC1 (offerDesc) {
  pc2.setRemoteDescription(offerDesc)
  pc2.createAnswer(function (answerDesc) {
    writeToChatLog('Created local answer', 'text-success')
    console.log('Created local answer: ', answerDesc)
    pc2.setLocalDescription(answerDesc)
  },
  function () { console.warn("Couldn't create offer") },
  sdpConstraints)
}

pc2.onicecandidate = function (e) {
  console.log('ICE candidate (pc2)', e)
  if (e.candidate == null) {
    $('#localAnswer').html(JSON.stringify(pc2.localDescription))
    $('#answerSentBtn').attr('disabled', false);
  }
}

pc2.onsignalingstatechange = onsignalingstatechange
pc2.oniceconnectionstatechange = oniceconnectionstatechange
pc2.onicegatheringstatechange = onicegatheringstatechange

function handleCandidateFromPC1 (iceCandidate) {
  pc2.addIceCandidate(iceCandidate)
}

pc2.onaddstream = handleOnaddstream
pc2.onconnection = handleOnconnection

function getTimestamp () {
  var totalSec = new Date().getTime() / 1000
  var hours = parseInt(totalSec / 3600) % 24
  var minutes = parseInt(totalSec / 60) % 60
  var seconds = parseInt(totalSec % 60)

  var result = (hours < 10 ? '0' + hours : hours) + ':' +
    (minutes < 10 ? '0' + minutes : minutes) + ':' +
    (seconds < 10 ? '0' + seconds : seconds)

  return result
}

function writeToChatLog (message, message_type) {
  document.getElementById('chatlog').innerHTML += '<p class="' + message_type + '">' + '[' + getTimestamp() + '] ' + message + '</p>'
}
*/
