'use strict';

// Get information about app instances: https://iid.googleapis.com/iid/info/AIzaSyBn9GqspEjZ60-csGQxm_mkCXiqSBA3SQc

function sendNotification(title, options) {
    // про Notification - https://habrahabr.ru/post/183630/
    // Проверим, поддерживает ли браузер HTML5 Notifications
    if (!("Notification" in window)) {
        alert('Ваш браузер не поддерживает HTML Notifications, его необходимо обновить.');
    }
    else if (Notification.permission === "granted") { // Проверим, есть ли права на отправку уведомлений
        // Если права есть, отправим уведомление
        var notification = new Notification(title, options);

        notification.onclick = function clickFunc() { alert('Пользователь кликнул на уведомление'); };
    }
    else if (Notification.permission !== 'denied') { // Если прав нет, пытаемся их получить
        Notification.requestPermission(function (permission) {
            if (permission === "granted") { // Если права успешно получены, отправляем уведомление
                var notification = new Notification(title, options);
            } else {
                alert('Вы запретили показывать уведомления'); // Юзер отклонил наш запрос на показ уведомлений
            }
        });
    } else {
        // Пользователь ранее отклонил наш запрос на показ уведомлений
        // В этом месте мы можем, но не будем его беспокоить. Уважайте решения своих пользователей.
    }
}

function firebase_log() {
    var strMsg = Array.prototype.join.call(arguments, ", ");
    var logUL = document.getElementById("firebaseLogUL");
    if (logUL) {
        var li = document.createElement("li");
        li.innerText = strMsg;
        logUL.appendChild(li);
    }
    console.log.apply(console, arguments);
    if (false) {
        sendNotification('firebaseTest', {
            body: strMsg,
            icon: "https://f64k.bitbucket.io/images/black-tri-96x96.png",
            dir: 'auto'
        });
    }
}

// Initialize Firebase
function firebase_Init() {
    var q = firebase.initializeApp(self.configFirebase);

    authenticateWithFirebase();

    test_Firebase_Database();

    //test_Firebase_Storage();

    //test_Firebase_Messaging();

    if (self.mediaWebRCT_js && mediaWebRCT_js.init) {
        mediaWebRCT_js.init();
    }

}

function authenticateWithFirebase() {
    var firebase_auth = firebase.auth();
    if (firebase_auth) {
        var cur_user = firebase.auth().currentUser; // всегда null ?

        firebase_auth.onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in.
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var isAnonymous = user.isAnonymous;
                var uid = user.uid;
                var providerData = user.providerData;
                // ...
                firebase_log("onAuthStateChanged user:", displayName);
                if (false) {
                    sendNotification(displayName, {
                        body: email,
                        icon: photoURL,
                        dir: 'auto'
                    });
                }
            } else {
                firebase_log("onAuthStateChanged NO USER");
                // ...
                //authenticateUsingGoogle(); // вход по кнопке
            }
            // апдейт на странице
            if (self.updateUIonLoginLogout) {
                updateUIonLoginLogout(user);
            }
        });

        firebase.auth().onIdTokenChanged(function (user) {
            if (user) {
                firebase_log("onIdTokenChanged user:", user.displayName);
            }
        });
    }
}

function authenticateUsingGoogle() {
    var firebase_auth = firebase.auth();
    if (firebase_auth) {
        var provider = new firebase.auth.GoogleAuthProvider();
        if (provider) {
            //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
            //firebase_auth.languageCode = 'ru';
            if (firebase_auth.useDeviceLanguage) {
                firebase_auth.useDeviceLanguage(); // To apply the default browser preference instead of explicitly setting it.
            }
            //provider.setCustomParameters({
            //    'login_hint': 'user@example.com'
            //});
            var promiseSignIn;
            firebase_log("calling signIn");
            if (true) {
                firebase_auth.signInWithRedirect(provider);
                promiseSignIn = firebase_auth.getRedirectResult();
            } else {
                promiseSignIn = firebase_auth.signInWithPopup(provider);
            }
            if (promiseSignIn) {
                promiseSignIn.then(function (result) {
                    if (result.credential) {
                        // This gives you a Google Access Token. You can use it to access the Google API.
                        var token = result.credential.accessToken;
                        firebase_log("result.credential.accessToken", token);
                    }
                    // The signed-in user info.
                    var user = result.user;
                    firebase_log("signIn then", result, "user:", user);
                    // ...
                }).catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
                    firebase_log("signIn catch", error.message);
                });
            }
        }
    }
}

function userSignOut() {
    firebase.auth().signOut().then(function () {
        firebase_log("Sign-out successful.");
    }).catch(function (error) {
        firebase_log("An error happened.", error);
    });
}


///
function test_Firebase_Database(user) {
    var database = firebase.database();
    if (database) {
        //firebase_log("database.persistenceEnabled", database.persistenceEnabled); // нет такого
        var dbref = database.ref(); // 'test2'
        firebase_log("dbref.key", dbref.key, "dbref.toJSON()", dbref.toJSON());

        if (false) {
            dbref.on('value', function (snapshot) {
                var jsonSnapshot = snapshot.val();
                firebase_log("on value", snapshot.key, JSON.stringify(jsonSnapshot));
                if (false) {
                    snapshot.forEach(function (childSnapshot) {
                        var childData = childSnapshot.val();
                        firebase_log("childData", childData);
                    });
                }
            });
        }

        // эти события срабатывают
        if(false) {
            dbref.on('child_added', function (snapshot) {
                var jsonSnapshot = snapshot.val();
                firebase_log("on child_added", snapshot.key, JSON.stringify(jsonSnapshot));
            });
            dbref.on('child_changed', function (snapshot) {
                var jsonSnapshot = snapshot.val();
                firebase_log("on child_changed", snapshot.key, JSON.stringify(jsonSnapshot));
            });
        }

        // похоже, что не срабатывают такие события
        if (true) {
            dbref.on('child_removed', function (snapshot) {
                var jsonSnapshot = snapshot.val();
                firebase_log("on child_removed", snapshot.key, JSON.stringify(jsonSnapshot));
            });
            dbref.on('child_moved', function (snapshot) {
                var jsonSnapshot = snapshot.val();
                firebase_log("on child_moved", snapshot.key, JSON.stringify(jsonSnapshot));
            });
        }

        /// определение дисконнекта и присутствия
        /// https://firebase.googleblog.com/2013/06/how-to-build-presence-system.html
        if (self.pageGuid) {
            var refConnected = database.ref(".info/connected");
            var refPresencePageGuid = database.ref("presence").child(self.pageGuid); //.ref("presence/"+self.pageGuid);
            if (refConnected && refPresencePageGuid) {
                refConnected.on("value", function (snap) {
                    var snap_val = snap.val();
                    if (snap_val) {
                        refPresencePageGuid.onDisconnect().remove();
                        var timestamp = new Date();
                        timestamp = timestamp.toString();
                        //var timestamp = firebase.database.ServerValue.TIMESTAMP;
                        refPresencePageGuid.set({ connectedAt: timestamp });
                        //refPresencePageGuid.push(timestamp);
                    }
                });
            } else {
                firebase_log("NOT refConnected && refPresencePageGuid");
            }
        }

        // посмотреть .info
        // serverTimeOffset - the value, in milliseconds, that Firebase Realtime Database clients add to the local reported time (epoch time in milliseconds) to estimate the server time
        var dbrefInfo = database.ref(".info");
        if (dbrefInfo) {
            dbrefInfo.on("value", function (snap) {
                var snap_val = snap.val();
                if (snap_val) {
                    firebase_log("on value '.info'", snap.key, JSON.stringify(snap_val));
                } else {
                    firebase_log("NO .info snap.val()");
                }
            });
        } else {
            firebase_log("NO database.ref('.info')");
        }
    }
    /*
    ref.onDisconnectRemoveValue()
    ref.queryOrdered(
    */
    /// аналоги или похожее https://www.rethinkdb.com/  https://pouchdb.com/
}

///
function test_Firebase_Storage() {
    var storage0 = firebase.app().storage();
    // Get a reference to the storage service, which is used to create references in your storage bucket
    var storage = firebase.storage();
    if (storage) {
        firebase_log("firebase.storage()", storage);
        // Create a storage reference from our storage service
        var storageRef = storage.ref();
        if (storageRef) {
            // Create a reference to the file whose metadata we want to retrieve
            var ref_IMP_PRIM_DBF = storageRef.child('test2/IMP_PRIM.DBF');
            if (ref_IMP_PRIM_DBF) {
                // Get metadata properties
                ref_IMP_PRIM_DBF.getMetadata().then(function (metadata) {
                    // Metadata now contains the metadata for 'images/forest.jpg'
                    firebase_log("ref_IMP_PRIM_DBF.getMetadata().then", metadata.fullPath, metadata.customMetadata, metadata);
                }).catch(function (error) {
                    firebase_log("ref_IMP_PRIM_DBF.getMetadata().then", error);
                });
            }
        } else {
            firebase_log("НЕТ storage.ref()");
        }

        var storageRef1 = storage.ref('test1');
        if (storageRef1) {
            if (storageRef1.list) {
                var list = storageRef1.list();
                if (list) {
                    firebase_log("storageRef1.list()", list);
                }
            } else {
                // Get metadata properties
                storageRef1.getMetadata().then(function (metadata) {
                    firebase_log("storageRef1.getMetadata().then", metadata.fullPath, metadata.customMetadata, metadata);
                }).catch(function (error) {
                    firebase_log("storageRef1.getMetadata().then", error);
                });
            }
        } else {
            firebase_log("НЕТ storage.ref('test1')");
        }
    } else {
        firebase_log("НЕТ firebase.storage()");
    }


}

// CALL Initialize Firebase
window.addEventListener('DOMContentLoaded', function () {
    firebase_Init();
}, false);





///
function test_Firebase_Messaging() {
    // Retrieve Firebase Messaging object.
    var messaging = firebase.messaging();
    if (messaging) {
        firebase_log("messaging=", messaging);

        if (false) { // пока диалог не показываем
            // displays a consent dialog to let users grant your app permission to receive notifications in the browser
            messaging.requestPermission().then(function (a, b) {
                firebase_log('Notification permission granted.', a, b);
                // TODO(developer): Retrieve an Instance ID token for use with FCM.
                Retrieve_Instance_ID_token_for_FCM(messaging);
            })
            .catch(function (err) {
                firebase_log('Unable to get permission to notify.', err);
            });
        }

        if (false) {
            // Callback fired if Instance ID token is updated.
            messaging.onTokenRefresh(function (a, b) {
                firebase_log('messaging.onTokenRefresh', a, b);
                messaging.getToken()
                .then(function (refreshedToken) {
                    firebase_log('Token refreshed.');
                    // Indicate that the new Instance ID token has not yet been sent to the
                    // app server.
                    setTokenSentToServer(false);
                    // Send Instance ID token to app server.
                    sendTokenToServer(refreshedToken);
                    // ...
                })
                .catch(function (err) {
                    firebase_log('Unable to retrieve refreshed token ', err);
                    showToken('Unable to retrieve refreshed token ', err);
                });
            });
        }

        messaging.onMessage(function (payload) {
            firebase_log("Message received", payload);
        });

        if (true) {
            messaging.getToken().then(function (currentToken) {
                if (currentToken) {
                    firebase_log('messaging.getToken() then', currentToken);
                    //sendTokenToServer(currentToken);
                    //updateUIForPushEnabled(currentToken);
                } else {
                    // Show permission request.
                    firebase_log('No Instance ID token available. Request permission to generate one.');
                    // Show permission UI.
                    //updateUIForPushPermissionRequired();
                    //setTokenSentToServer(false);
                }
            })
            .catch(function (err) {
                firebase_log('messaging.getToken() catch', err);
                //showToken('Error retrieving Instance ID token. ', err);
                //setTokenSentToServer(false);
            });
        }
    }
}


// Get Instance ID token. Initially this makes a network call, once retrieved subsequent calls to getToken will return from cache.
function Retrieve_Instance_ID_token_for_FCM(messaging) {
    messaging.getToken()
    .then(function (currentToken) {
        if (currentToken) {
            firebase_log("currentToken=", currentToken);
            if (currentToken) {
                sendTokenToServer(currentToken);
            } else {
                console.warn('Не удалось получить токен.');
                setTokenSentToServer(false);
            }
        } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
            // Show permission UI.
            updateUIForPushPermissionRequired();
            setTokenSentToServer(false);
        }
    })
    .catch(function (err) {
        firebase_log('An error occurred while retrieving token. ', err);
        showToken('Error retrieving Instance ID token. ', err);
        setTokenSentToServer(false);
    });
}

// отправка ID на сервер
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Отправка токена на сервер...');
        var url = ''; // адрес скрипта на сервере который сохраняет ID устройства
        $.post(url, {
            token: currentToken
        });
        setTokenSentToServer(currentToken);
    } else {
        console.log('Токен уже отправлен на сервер.');
    }
}

// используем localStorage для отметки того, что пользователь уже подписался на уведомления
function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
    window.localStorage.setItem('sentFirebaseMessagingToken', currentToken ? currentToken : '');
}
