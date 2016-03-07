var attachMediaStream = null
var reattachMediaStream = null
var webrtcIsFirefox = false;

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.msGetUserMedia

if (navigator.mozGetUserMedia) {
  console.log('This appears to be Firefox')

  webrtcIsFirefox = true;

  // Attach a media stream to an element.
  attachMediaStream = function (element, stream) {
    element.mozSrcObject = stream
    element.play()
  }

  reattachMediaStream = function (to, from) {
    to.mozSrcObject = from.mozSrcObject
    to.play()
  }

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function () {
    return []
  }

  MediaStream.prototype.getAudioTracks = function () {
    return []
  }
} else if (navigator.webkitGetUserMedia) {
  console.log('This appears to be Chrome')

  // The RTCPeerConnection object.
  RTCPeerConnection = webkitRTCPeerConnection

  // Attach a media stream to an element.
  attachMediaStream = function (element, stream) {
    element.src = URL.createObjectURL(stream)
  }

  reattachMediaStream = function (to, from) {
    to.src = from.src
  }

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function () {
      return this.videoTracks
    }
    webkitMediaStream.prototype.getAudioTracks = function () {
      return this.audioTracks
    }
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function () {
      return this.localStreams
    }
    webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
      return this.remoteStreams
    }
  }
} else {
  console.error('Browser does not appear to be WebRTC-capable')
}
