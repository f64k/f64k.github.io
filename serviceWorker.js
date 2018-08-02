/*  
Генерация страниц сайта средствами сервис-воркеров - https://habrahabr.ru/company/mailru/blog/353232/

как делать service worker - http://prgssr.ru/development/sozdaem-service-worker.html
образец из статьи - https://github.com/lyzadanger/serviceworker-example/blob/master/03-versioning/serviceWorker.js

Web PUSH Notifications быстро и просто - https://habrahabr.ru/post/321924/

https://developer.mozilla.org/ru/docs/Web/API/Service_Worker_API/Using_Service_Workers

шпаргалка - https://mdn.mozillademos.org/files/12638/sw101.png

примеры - https://jakearchibald.github.io/isserviceworkerready/

docs Eng - https://serviceworke.rs/

просмотр - chrome://serviceworker-internals 
+          chrome://inspect/#service-workers


*/
'use strict';
// глобальный config
var config = {
    version: 'qwerty_3',
    staticCacheItems: [
      //'/images/lyza.gif',
      '/css/styles.css',
      //'/js/site.js',
      '/offline/',
      '/'
    ],
    cachePathPattern: /^\/(?:(20[0-9]{2}|about|blog|css|images|js)\/(.+)?)?$/,
    offlineImage: '<svg role="img" aria-labelledby="offline-title"'
      + ' viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">'
      + '<title id="offline-title">Offline</title>'
      + '<g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/>'
      + '<text fill="#9B9B9B" font-family="Times New Roman,Times,serif" font-size="72" font-weight="bold">'
      + '<tspan x="93" y="172">offline</tspan></text></g></svg>',
    offlinePage: '/offline/'
};
/// основное рабочее событие
self.addEventListener('fetch', function onFetch(event) {
    console.log(event);

    function shouldHandleFetch(event, opts) {
        // Should we handle this fetch?
        return false;
    }

    function onFetchInner(event, opts) {
        // … TBD: Respond to the fetch
    }

    if (false) {
        if (shouldHandleFetch(event, config)) {
            onFetchInner(event, config);
        }
        //shouldHandleFetch(event, config)
        //.then(onFetchInner(event, config))
        //.catch(…);
    }
});

self.addEventListener('push', function onPush(event) {
    console.log(event);
});

self.addEventListener('sync', function onSync(event) {
    console.log(event);
});


self.addEventListener('error', function onError(event) {
    console.log(event);
});


function onMessage(event) {
    console.log("Got message in SW", event.data);

    if (event.source) {
        console.log("event.source present");
        event.source.postMessage("Woop!");
    } else {
        if (event.data.port) {
            event.data.port.postMessage("Woop!");
        } else {
            if (self.clients) {
                console.log("Attempting postMessage via clients API");
                clients.matchAll().then(function (clientList) {
                    for (var i = 0 ; i < clients.length ; i++) {
                        var cl = clientList[i];
                        if (cl.url === 'index.html') {
                            cl.openWindow(clientList[i]);
                            cl.postMessage("Whoop! (via client api)");
                        }
                    }
                    //for (var cl in clientList) {
                    //}
                });
            } else {
                console.log('No useful return channel');
            }
        }
    }
};

//self.addEventListener('message', onMessage);
this.onmessage = onMessage;


self.addEventListener('activate', function onActivate(event) {
    console.log(event);

    /// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
    //self.clients.claim(); // start controlling without reloading
    event.waitUntil(clients.claim());

    return caches.keys()
        .then(function(cacheKeys) {
            console.log(cacheKeys);
            //var oldCacheKeys = cacheKeys.filter(key =>        key.indexOf(opts.version) !== 0      );
            //var deletePromises = oldCacheKeys.map(oldKey => caches.delete(oldKey));
            //return Promise.all(deletePromises);
        });
});

self.addEventListener('install', function onInstall(event) {
    console.log(event);

    //function onInstallInner() {
    //    return caches.open('static')
    //        .then(function (cache) {
    //            return cache.addAll([
    //                //'/images/lyza.gif',
    //                //'/js/site.js',
    //                //'/css/styles.css',
    //                //'/offline/',
    //                '/',
    //            ]);
    //        });
    //}
    //// Прикажите событию install не завершаться, пока вы не выполните то, что вы хотите с помощью event.waitUntil
    //event.waitUntil(onInstallInner(event));

    if (event.skipWaiting) {
        event.skipWaiting(); // jump to activating
    }

    SendMessagesToClients();

    return caches.open('static')
        .then(function (cache) {
            console.log(cache);
        });
});

/// рассылка сообщений клиентам
function SendMessagesToClients() {
    clients.matchAll().then(function (clientList) {
        for (var i = 0 ; i < clientList.length ; i++) {
            var cl = clientList[i];
            cl.postMessage(cl.id);
        }
        //for (var cl in clientList) {
        //}
    });
    setTimeout(SendMessagesToClients, 60000);
}