document.domain = 'localhost';
setTimeout(function(){

    var qa3Frame = document.getElementById('qa3');
    var aiFrame = document.getElementById('local');

    console.log(qa3Frame)
    console.log(aiFrame)
    console.log(aiFrame.contentWindow.document.getElementById('root'));

}, 3000);