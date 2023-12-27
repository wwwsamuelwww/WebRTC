const PRE = "DELTA";
const SUF = "MEET";
var room_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null;
var screenSharing = false;
var activeCalls = [];

if (activeCalls.length > 1) {
    document.getElementById('user-list').classList.add('multiple-users');
} else {
    document.getElementById('user-list').classList.remove('multiple-users');
}

function crearSala() {
    console.log("Creando Sala")
    let room = document.getElementById("room-input").value;
    if (room == " " || room == "") {
        alert("Por favor, ingresa el número de la sala");
        return;
    }
    room_id = PRE + room + SUF;
    peer = new Peer(room_id);
    peer.on('open', (id) => {
        console.log("Par conectado con ID: ", id);
        hideModal();
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setLocalStream(local_stream);
            notify("Esperando a que otros participantes se unan.");
        }, (err) => {
            console.log(err);
        });
    });
    peer.on('call', (call) => {
        call.answer(local_stream);
        handleCall(call);
    });
}

function handleCall(call) {
    if (!document.getElementById(call.peer)) {
        call.on('stream', (stream) => {
            addUserToUserList(call.peer, stream);
        });
        call.on('close', () => {
            removeUserFromUserList(call.peer);
        });
        activeCalls.push(call);
        activeCalls.forEach(existingCall => {
            callExistingUser(existingCall, call.peer, local_stream);
        });
    }
}

function callExistingUser(existingCall, peerId, stream) {
    if (existingCall.peer !== peerId) {
        existingCall.answer(stream);
    }
}

function setLocalStream(stream) {
    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.play();
}

function setRemoteStream(stream) {
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play();
}

function hideModal() {
    document.getElementById("entry-modal").hidden = true;
}

function notify(msg) {
    let notification = document.getElementById("notification");
    notification.innerHTML = msg;
    notification.hidden = false;
    setTimeout(() => {
        notification.hidden = true;
    }, 3000);
}

function unirseASala() {
    console.log("Uniéndose a la Sala");
    let room = document.getElementById("room-input").value;
    if (room == " " || room == "") {
        alert("Por favor, ingresa el número de la sala");
        return;
    }
    room_id = PRE + room + SUF;
    hideModal();
    peer = new Peer();
    peer.on('open', (id) => {
        console.log("Conectado con ID: " + id);
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setLocalStream(local_stream);
            notify("Uniéndose a otros participantes");
            window.alert(activeCalls.length);
            // Llamar a los participantes existentes
            activeCalls.forEach(existingCall => {
                
                callExistingUser(existingCall, peer.id, local_stream);
            });

            // Esperar un breve momento antes de realizar la llamada a la sala
            setTimeout(() => {
                let call = peer.call(room_id, stream);
                handleCall(call);
            }, 2000);
        }, (err) => {
            console.log(err);
        });
    });
}



function addUserToUserList(userId, stream) {
    let userList = document.getElementById("user-list");

    if (!document.getElementById(userId)) {
        let video = document.createElement("video");
        video.id = userId;
        video.srcObject = stream;
        video.play();
        userList.appendChild(video);
    }
}


function removeUserFromUserList(userId) {
    let userList = document.getElementById("user-list");
    let video = document.getElementById(userId);
    if (video) {
        video.srcObject.getTracks().forEach(track => track.stop());
        userList.removeChild(video);
    }
}



