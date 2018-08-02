'use strict';

window.onmessage = function (event) {
    sw_log("window.onmessage:", event.data);
};
navigator.serviceWorker.onmessage = function (event) {
    sw_log("navigator.serviceWorker.onmessage:", event.data);
};

function sw_log() {
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

/// регистрация serviceWorker
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            if (navigator.serviceWorker.register) {
                navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' }).then(function (swReg) {
                    sw_log("registered serviceWorker.js", swReg);
                }).catch(function (err) {
                    sw_log("Error", err);
                });
            }

            if (navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(function (swReg) {
                    try {
                        swReg.active.postMessage("testStr");
                        sw_log("after postMessage", swReg.active);
                        //swReg.active.postMessage({
                        //    text: "Hi!",
                        //    port: messageChannel && messageChannel.port2
                        //}, [messageChannel && messageChannel.port2]);
                    } catch (e) {
                        sw_log(e);
                        // getting a cloning error in Firefox
                        //swReg.active.postMessage({
                        //    text: "Hi!"
                        //});
                    }
                });
            }

        } catch (ex) { alert(ex); }
    } else { alert("NO serviceWorker in navigator"); }
}

//initServiceWorker();
