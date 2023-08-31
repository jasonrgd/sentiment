console.log(navigator.getDisplayMedia)
var speaker = new MediaStream;

if (navigator.getDisplayMedia) {
    console.log("navigator.displayMedia")
    navigator.getDisplayMedia({
        video: true ,
        audio: true
    }).then(stream => {
        speaker.addTrack(stream.getAudioTracks()[0].clone());
        // stopping and removing the video track to enhance the performance
        stream.getVideoTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
    }).catch(() => {
        console.error('failed')
    });
} else if (navigator.mediaDevices.getDisplayMedia) {
    console.log(navigator.mediaDevices.getDisplayMedia)
    navigator.mediaDevices.getDisplayMedia({
        video: true ,
        audio: true
    }).then(stream => {
        speaker.addTrack(stream.getAudioTracks()[0].clone());
        // stopping and removing the video track to enhance the performance
        stream.getVideoTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
    }).catch(() => {
        console.error('failed')
    });
}
