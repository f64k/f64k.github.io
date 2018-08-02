'use strict';

window.onmessage = function (event) {
    media_log("window.onmessage:", event.data);
};

var mediaWebRCT_js = (function() {
    'use strict';
    var DEBUG = true;

    function media_log() {
        var strMsg = Array.prototype.join.call(arguments, ", ");
        var logUL = document.getElementById("logUL");
        if (logUL) {
            var li = document.createElement("li");
            li.innerText = strMsg;
            logUL.appendChild(li);
        } else {
            document.body.appendChild(document.createTextNode(strMsg));
            document.body.appendChild(document.createElement("br"));
        }
        console.log.apply(console, arguments);
    }

    /// собственное видео
    function initPageMedia() {
        var divVideo = document.getElementById("videoPanel");
        if (divVideo) {
            if(DEBUG) {
                var buttonTest = document.createElement('button');
                buttonTest.innerHTML = 'TEST';
                buttonTest.style.width = "150px";
                //buttonTest.style.height = "150px";
                divVideo.appendChild(buttonTest);
                buttonTest.onclick = function() {
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(function (stream) {
                            showVideo(stream, divVideo);
                        }).catch(function (err) {
                            media_log(err);
                        });
                };
            }

            navigator.mediaDevices.enumerateDevices()
                .then(function (devices) {
                    //var devicesV = devices.filter(function (d) { return (d.kind == 'videoinput'); });
                    var devicesV = devices.filter(d => d.kind == 'videoinput');
                    devicesV.forEach(function (d) {
                        //media_log(d.kind + ": " + d.label + " id = " + d.deviceId);
                        addOpenVideoButton(d, divVideo);
                    });
                }).catch(function (err) {
                    media_log(err.name + ": " + err.message);
                });
        }    
    }

    function addOpenVideoButton(device, divVideo) {
        if(device && divVideo) {
            var d = device;
            //var divVideo = document.getElementById('videoDiv');
            if (divVideo) {
                var buttonVideo = document.createElement('button');
                buttonVideo.innerHTML = d.label || d.deviceId;
                //buttonVideo.style.width = "150px";
                buttonVideo.style.height = "100px";
                //buttonVideo.id = d.deviceId;
                divVideo.appendChild(buttonVideo);
                buttonVideo.onclick = function() {
                    var constraints = { video: { deviceId: { exact: d.deviceId } } };
                    var promiseCam = navigator.mediaDevices.getUserMedia(constraints);
                    promiseCam.then(function (stream) {
                        /* use the stream */
                        var elVideo = showVideo(stream, divVideo);
                        divVideo.removeChild(buttonVideo);

                        createSourcePeer(elVideo); // PEER источник

                    }).catch(function (err) {
                        media_log(err);
                    });
                };
                //media_log("buttonVideo", buttonVideo);
            }    
        } else { media_log("NOT (device && divVideo)"); }
    }

    function initForeignMedia() {
        var divVideoF = document.getElementById("videoPanelForeign");
        if (divVideoF) {
            var database = firebase.database();
            if(database) {
                var refPresence = database.ref("presence");
                if(refPresence) {
                    refPresence.on('child_added', function (snapshot) {
                        var jsonSnapshot = snapshot.val();
                        media_log("on child_added", snapshot.key); // , JSON.stringify(jsonSnapshot)
                        if(jsonSnapshot.WebRTC) {
                            addForeignVideoButton(snapshot.key, divVideoF);
                        }
                    });
                    refPresence.on('child_changed', function (snapshot) {
                        var jsonSnapshot = snapshot.val();
                        //media_log("on child_changed", snapshot.key); 
                        if(jsonSnapshot.WebRTC && self.pageGuid) {
                            if(snapshot.key != self.pageGuid) {
                                var divUserVideo = document.getElementById(snapshot.key);
                                if(!divUserVideo) {
                                    divUserVideo = addForeignVideoButton(snapshot.key, divVideoF);
                                }
                                divUserVideo.userWebRTC = jsonSnapshot.WebRTC;
                            } else {

                                var objRemote_answer = jsonSnapshot.WebRTC['createAnswer_setLocalDescription'];
                                if(objRemote_answer) {
                                    var elVideo = document.querySelector('video'); // не красиво так. может быть много video
                                    media_log("elVideo", elVideo);
                                    if(elVideo) {
                                        if(elVideo.peerSource) {
                                            if(elVideo.peerSource.setAnswer) {
                                                elVideo.peerSource.setAnswer(objRemote_answer);
                                            } else { media_log("NO elVideo.peerSource.setAnswer"); }
                                        } else { media_log("NO elVideo.peerSource"); }
                                    } else { media_log("NO Source Video"); }
                                }

                            }
                        }
                    });
                    refPresence.on('child_removed', function (snapshot) {
                        var jsonSnapshot = snapshot.val();
                        media_log("on child_removed", snapshot.key); // , JSON.stringify(jsonSnapshot)
                        var divUserVideo = document.getElementById(snapshot.key);
                        if(divUserVideo) {
                            divVideoF.removeChild(divUserVideo);
                        }
                    });
                } else { media_log("NOT database.ref('presence')"); }
            } else { media_log("NOT firebase.database()"); }
        } else { media_log("NOT videoPanelForeign"); }
    }

    function addForeignVideoButton(userKey, divVideo) {
        if(userKey) {
            if (divVideo) {
                var divOpenVideo = document.createElement('div');
                divOpenVideo.id = userKey;
                var buttonVideo = document.createElement('button');
                buttonVideo.innerHTML = userKey;
                //buttonVideo.style.width = "150px";
                buttonVideo.style.height = "50px";
                divOpenVideo.appendChild(buttonVideo);
                divVideo.appendChild(divOpenVideo);
                buttonVideo.onclick = function() {
                    // убрать кнопку
                    divOpenVideo.removeChild(buttonVideo);

                    var userWebRTC = divOpenVideo.userWebRTC;
                    if(userWebRTC) {
                        var peerConnDst = create_webRTCPeerConnection(); // объект типа RTCPeerConnection

                        peerConnDst.onaddstream = function gotRemoteStream(event) {
                            if (event) {
                                var elVideo = showVideo(event.stream, divOpenVideo);
                            }
                        };

                        var objRemote_localDescription = userWebRTC['createOffer_setLocalDescription'];
                        var remoteDescription = new RTCSessionDescription(objRemote_localDescription);
                        if (remoteDescription) {
                            peerConnDst.setRemoteDescription(remoteDescription).then(function () {
                                media_log("peerConnDst.setRemoteDescription OK");
                                if(peerConnDst.localDescription && peerConnDst.localDescription.type) {
                                    media_log("HAS peerConnDst.localDescription"); // пока не должно быть
                                } else {
                                    var promiseLocalDescription = peerConnDst.createAnswer(); // create Answer
                                    promiseLocalDescription.then(function (d) {
                                        var localDesc = peerConnDst.setLocalDescription(d); // and set local description
                                        return localDesc;
                                    }).then(function () {
                                        // записать в Firebase ответ для применения источником видео
                                        writeToFirebaseUserData(userKey, peerConnDst.localDescription, 'createAnswer_setLocalDescription');
                                    });
                                }
                            }).catch(function (e) {
                                alert("Error: peerConnDst.setRemoteDescription:  " + JSON.stringify(e));
                            });
                        }

                        var objRemote_iceCandidate = userWebRTC['iceCandidate'];
                        if (objRemote_iceCandidate) {
                            var candidate = new RTCIceCandidate(objRemote_iceCandidate);
                            if (candidate) {
                                peerConnDst.addIceCandidate(candidate).then(function () {
                                    media_log("addIceCandidate OK");
                                }).catch(function (e) {
                                    alert("Error: addIceCandidate: " + JSON.stringify(e));
                                });
                            }
                        } else { media_log("NOT userWebRTC['iceCandidate']"); }

                    } else { media_log("NOT divOpenVideo.userWebRTC"); }
                };
                //media_log("buttonVideo", buttonVideo);
                return divOpenVideo;
            } else { media_log("NOT divVideo"); }
        } else { media_log("NOT userKey"); }
    }

    function showVideo(stream, divVideo) {
        if (stream) {
            var elemVideo;
            //var divVideo = document.getElementById('videoDiv');
            if (divVideo) {
                elemVideo = document.createElement('video');
                elemVideo.autoplay = true;
                elemVideo.style.width = "200px";
                divVideo.appendChild(elemVideo);
                elemVideo.srcObject = stream;
                //media_log("elemVideo", elemVideo);
                media_log("stream.id=" + stream.id);
            } else {
                media_log("NO divVideo");
                elemVideo = document.querySelector('video');
                if (elemVideo) {
                    //elemVideo.src = URL.createObjectURL(stream);
                    elemVideo.srcObject = stream;
                    //elemVideo.onloadedmetadata = function (e) {
                    //    video.play();
                    //};
                } else {
                }
            }
            return elemVideo;
        } else { alert("showVideo: нет stream!"); }
    }

    function create_webRTCPeerConnection() {
        var webRTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var mediaConstraints = { optional: [{ RtpDataChannels: true }] };
        var servers = { iceServers: [] };
        return new webRTCPeerConnection(servers, mediaConstraints);
    }

    /// записать в Firebase
    function writeToFirebaseUserData(userGuid, objRTC, strKind) {
        if (userGuid) {
            var database = firebase.database();
            if(database) {
                var refPresencePageGuidRtcKind = database.ref("presence").child(userGuid).child("WebRTC").child(strKind);
                if (refPresencePageGuidRtcKind) {
                    var strRtcToSave = JSON.stringify(objRTC);
                    var objRtcToSave = JSON.parse(strRtcToSave);
                    refPresencePageGuidRtcKind.set(objRtcToSave, function onComplete(Error){
                        if(Error) { media_log("set ERROR", Error); }
                    });
                    //media_log(objRtcToSave.type || "set", strKind, objRtcToSave.sdp || objRtcToSave);
                } else { media_log("NOT refPresencePageGuidRtcKind"); }
            } else { media_log("NOT firebase.database()"); }
        } else { media_log("NOT userGuid"); }
    }

    function createSourcePeer(elVideo) {
        if(elVideo) {
            var peerConnSrcNew = create_webRTCPeerConnection(); // объект типа RTCPeerConnection

            var stream = elVideo.srcObject;
            if(stream) {
                peerConnSrcNew.addStream(stream);
            }

            peerConnSrcNew.onicecandidate = function (evt) { //listen for candidate events
                if (evt && evt.candidate) {
                    //media_log("peerConnSrcNew.onicecandidate: " + evt.candidate.candidate);
                    var iceCandidate = evt.candidate;
                    // записать в Firebase iceCandidate
                    writeToFirebaseUserData(self.pageGuid, iceCandidate, 'iceCandidate');
                }
            };

            var promiseLocalDescription = peerConnSrcNew.createOffer(); // create offer

            promiseLocalDescription.then(function (d) {
                var localDesc = peerConnSrcNew.setLocalDescription(d); // and set local description
                return localDesc;
            }).then(function () {
                // записать в Firebase предложение коннекта
                writeToFirebaseUserData(self.pageGuid, peerConnSrcNew.localDescription, 'createOffer_setLocalDescription');
            });

            var objSourcePeer = {
                setAnswer: function(objRemote_answer) {
                    //ответ
                    var peerConnSrc = peerConnSrcNew;
                    var remoteDescription = new RTCSessionDescription(objRemote_answer);
                    if (remoteDescription) {
                        peerConnSrc.setRemoteDescription(remoteDescription).then(function () {
                            media_log("peerConnSrc.setRemoteDescription OK");
                            if(peerConnSrc.localDescription && peerConnSrc.localDescription.type) {
                            } else { media_log("NO peerConnSrc.localDescription"); }
                        }).catch(function (e) {
                            alert("Error: peerConnSrc.setRemoteDescription:  " + JSON.stringify(e));
                        });
                    } else { media_log("NO remoteDescription"); }
                },
            };
            elVideo.peerSource = objSourcePeer; // сохраняем коннект в объекте локального video
            return objSourcePeer;
        } else {
            media_log("NOT elVideo");
        }
    }

    return {
        init: function() {
            initPageMedia();
            initForeignMedia();
        },
    };
})();






