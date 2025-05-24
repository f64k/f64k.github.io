

/* */
var mApp = function (settings) {

    /// асинхронный запуск Dexie
    function pStartDexie() {
        var db = new Dexie("dexie_database");
        db.version(1).stores({
            v: '++id,dark,prop1,prop2',
            //req_files: 'name,',
        });

        function save(obj) {
            return new Promise(function (resolve, reject) {
                try {
                    if (obj) {
                        if (db && db.v) {
                            try {
                                var test2 = {
                                    testInt: 12345,
                                    testStr: 'str',
                                    testObj: {
                                        testArr: [{ v: 1 }, { v: 2 }, { v: 3 }],
                                    },
                                };
                                var _dark = (obj.v && obj.v.dark !== undefined) ? obj.v.dark.toString() : null;
                                var objFiles = null;
                                if (obj.files && Array.isArray(obj.files)) {
                                    objFiles = { files: obj.files.map(function (i) { return Object.assign({}, i) }) };
                                }
                                var objToSave = {};
                                if (_dark) {
                                    objToSave.dark = _dark;
                                    debugger;
                                }
                                if (objFiles && objFiles.files) {
                                    // клонирование и очистка
                                    objFiles.files.forEach(function (i) {
                                        i.requestFile = Object.assign({}, i.requestFile);
                                        delete (i.xmlDocRoot);
                                        delete (i.requestFile.xmlDocRoot);
                                        if (true) {
                                            delete (i.strFormattedXml);
                                            delete (i.requestFile.strFormattedXml);
                                        }
                                    });
                                    objToSave.prop1 = objFiles;
                                    debugger;
                                }
                                if (false) {
                                    var pclear = db.v.clear();
                                    debugger;
                                    pclear.then(function () {
                                        db.v.put(objToSave)
                                            .then(function () { resolve(); })
                                            .catch(function (e) { debugger; });
                                    }).catch(function (e) { debugger; });
                                } else {
                                    // вариант Обновления записи
                                    var pCount = db.v.toCollection().count();
                                    pCount.then(function (_count) {
                                        if (_count === 0) {
                                            debugger;
                                            db.v.put(objToSave)
                                                .then(function () { resolve(); })
                                                .catch(function (e) { debugger; });
                                        } else {
                                            if (_count === 1) {
                                                // обновление только измененных свойств
                                                db.v.limit(1).modify(objToSave)
                                                    .then(function () {
                                                        resolve();
                                                    })
                                                    .catch(function (e) { debugger; });
                                            } else {
                                                debugger;
                                            }
                                        }
                                    }).catch(function (e) { debugger; });
                                }
                            } catch (e) { debugger; }
                        } else { debugger; }
                    } else { debugger; }
                } catch (e) { debugger; reject(e); }
            });
        }

        return new Promise(function (resolve, reject) {
            if (db && db.v) {
                try {
                    var pva = db.v.toArray();
                    pva.then(function (va) {
                        var _v = {};
                        if (va.length > 0) {
                            if (va.length > 1) { debugger; }
                            _v = va[0];
                        }
                        //debugger;
                        var files = null;
                        if (_v.prop1) {
                            files = _v.prop1.files;
                        }
                        resolve({
                            db: db,
                            save: save,
                            dark: (_v.dark === 'true'),
                            files: files,
                        });
                    }).catch(function (e) { debugger; reject(e); });
                } catch (e) { debugger; reject(e); }
                //myProps.loadedStateFromLocalStore = true; // для того, чтобы после загрузки снова не записывало в хранилище
            }
        });
    }

    /// функция для отложенногог запуска Vue // параметры читаются из локального хранилища
    function startVue(objSavedInitValues) {
        if (!objSavedInitValues) { objSavedInitValues = {}; }
        if (objSavedInitValues.dark === undefined) { objSavedInitValues.dark = false; }
        if (objSavedInitValues.save === undefined) { objSavedInitValues.save = function () { debugger; }; }

        var funcSaveToStore = objSavedInitValues.save;

        var filesArrayFromStorage = (function () {
            if (objSavedInitValues.files === undefined) { return []; }
            var files = objSavedInitValues.files || [];
            var domParser = new DOMParser();
            files.forEach(function (i) {
                var domXmlResp = domParser.parseFromString(i.strXml, 'text/xml');
                var rootResp = domXmlResp.documentElement;
                var rootDocResp = mXml.getInnerDoc(rootResp); // достать, если документ вложенный. если несколько, то первый.
                i.xmlDocRoot = rootDocResp;
                var domXmlRequ = domParser.parseFromString(i.requestFile.strXml, 'text/xml');
                var rootRequ = domXmlRequ.documentElement;
                var rootDocRequ = mXml.getInnerDoc(rootRequ); // достать, если документ вложенный. если несколько, то первый.
                i.requestFile.xmlDocRoot = rootDocRequ;
                if (i.requestFile.localNameDoc !== i.requestFile.xmlDocRoot.localName) {
                    debugger;
                }
                if (true) {
                    i.strFormattedXml = mXml.prettyPrintXmlString(i.strXml);
                    i.requestFile.strFormattedXml = mXml.prettyPrintXmlString(i.requestFile.strXml);
                }
            });
            return files;
        })();

        var objPageScreenParameters = {
            dark: objSavedInitValues.dark,
            dialogClear: false,
            dialogCompare: false,
            dialogCompareTab: 'СравнениеОтветов',
            nav_drawer: {
                visibleLeft: false,
                visibleRight: false,
                //clipped: false,
                //miniVariant: false,
            },
            toast: {
                visible: false,
                text: 'задайте текст сообщения',
            },
            bottomSheet: false,
            fab: false,
        };

        var fMessages = {
            toast: function (message) {
                var that = this; // `this` внутри методов указывает на экземпляр Vue
                that.v.toast.text = message;
                that.v.toast.visible = true;
            },
            setStatus: function (titleText, statusText) {
                var that = this; // `this` внутри методов указывает на экземпляр Vue
                if (titleText) {
                    that.title = titleText;
                    if (statusText) {
                        that.status_text = statusText;
                    } else {
                        that.status_text = titleText;
                    }
                } else {
                    if (statusText) {
                        that.title = that.status_text = statusText;
                    } else {
                        that.title = that.status_text = 'setStatus ПУСТО';
                    }
                }
            },
            greet: function (e) {
                var that = this; // `this` внутри методов указывает на экземпляр Vue
                alert('Привет, ' + that.title + '!');
                // `e` — нативное событие DOM
                //if (e) { alert(e.target.tagName); }
            },
        };

        /// запрос REST сервиса на расчет
        function downloadPostResultFromService(that, item) {
            //var that = this; // `this` внутри методов указывает на экземпляр Vue
            var index = that.tableFiles.testResponseRequestPairs.indexOf(item);
            if (index > -1 && item && item.requestFile) {
                return new Promise(function (resolve, reject) {
                    item.isLoading = true; //Vue.nextTick();
                    Vue.set(that.tableFiles.testResponseRequestPairs, index, item);
                    var url = location.origin;
                    if (url !== 'file://') {
                        //url += '/uploadFile/' + item.requestFile.name;
                        url += '/uploadFile/no_NSIPayResult_flag';
                        var postData = item.requestFile.strXml;
                        var domParser = new DOMParser();
                        axios.post(url, postData, { headers: { 'Content-Type': 'text/xml' } }).then(function (response) {
                            //console.log(response);
                            response.strFormattedXml = mXml.prettyPrintXmlString(response.data);
                            var domXml = domParser.parseFromString(response.data, 'text/xml');
                            //var domXml = domParser.parseFromString(response.strFormattedXml, 'text/xml');
                            var root = domXml.documentElement;
                            response.xmlDocRoot = root;
                            item.responseObj = {
                                strFormattedXml: response.strFormattedXml,
                                xmlDocRoot: response.xmlDocRoot,
                            };
                            var arrayOfDiff = mXml.calcArrayOfXmlDiff(item.xmlDocRoot, item.responseObj.xmlDocRoot);
                            var arrayOfDiffFiltered = mXml.filterArrayOfXmlDiff(arrayOfDiff);
                            item.diff_items = arrayOfDiff;
                            var _diffCount = arrayOfDiffFiltered.length;
                            item.diffCount = _diffCount;
                            // обновить запись в таблице
                            item.isLoading = false;
                            Vue.set(that.tableFiles.testResponseRequestPairs, index, item);
                            resolve();
                        }).catch(function (error) {
                            console.log(error);
                            debugger;
                            that.toast(error.message)
                            // обновить запись в таблице
                            item.isLoading = false;
                            Vue.set(that.tableFiles.testResponseRequestPairs, index, item);
                            resolve();
                        });
                    } else {
                        alert('открыто из файла: location.origin=' + location.origin);
                        debugger;
                        resolve();
                    }
                });
            }
        }

        var fileSelector = null; // визуально скрытый INPUT элемент

        function fileSelectorProblem(e) { // почему то никогда не выводится
            console.log(e);
            debugger;
            //that.toast(e);
        }

        function openLocalFiles(that, bOpenFromFolder) {
            if (that === undefined || that instanceof MouseEvent) { that = this; } // `this` внутри методов указывает на экземпляр Vue
            if (bOpenFromFolder === undefined || bOpenFromFolder === null) { bOpenFromFolder = true; }
            if (fileSelector === null || !bOpenFromFolder) {
                fileSelector = document.createElement('input');
            }
            if (fileSelector.type !== undefined) {
                fileSelector.type = 'file';
            } else {
                fileSelector.setAttribute('type', 'file');
            }
            if (bOpenFromFolder) {
                if (fileSelector.webkitdirectory !== undefined) {
                    fileSelector.webkitdirectory = true;
                } else {
                    fileSelector.setAttribute('webkitdirectory', 'true');
                }
                if (fileSelector.directory !== undefined) {
                    fileSelector.directory = true;
                }
            } else {
                debugger;
                if (fileSelector.accept !== undefined) {
                    fileSelector.accept = '.xml';
                } else {
                    fileSelector.setAttribute('accept', '.xml');
                }
                fileSelector.setAttribute('multiple', 'multiple');
            }

            if (!fileSelector.onerror) { fileSelector.onerror = fileSelectorProblem; }
            if (!fileSelector.onabort) { fileSelector.onabort = fileSelectorProblem; }
            if (!fileSelector.oncancel) { fileSelector.oncancel = fileSelectorProblem; }
            if (!fileSelector.oninvalid) { fileSelector.oninvalid = fileSelectorProblem; }

            if (!fileSelector.onchange) {
                fileSelector.onchange = function (e) {
                    var _files = fileSelector.files;
                    _files = [].slice.call(_files); // преобразовать в массив
                    _files = _files.filter(function (f) { return f.type === 'text/xml'; }); // только XML
                    // можно попробовать открывать ZIP архивы через https://unpkg.com/jszip@3.1.5/ пример http://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
                    that.toast('обрабатывается XML файлов: ' + _files.length);
                    // прочитать все
                    var promisesReading = _files.map(function (f) { return mXml.pFileReader(f) });
                    Promise.all(promisesReading).then(function (filesLoaded) {
                        if (_files.length !== filesLoaded.length) { console.log(filesLoaded); debugger; }

                        var pathPrefix = mStr.getStringArrayCommonPrefix(filesLoaded.map(function (f) { return f.webkitRelativePath }));

                        // парсим считанные xml документы
                        //for (var i0 = 0, len0 = filesLoaded.length; i0 < len0; i0++) {
                        //    var _file = _files[i0];
                        //    var file = filesLoaded[i0];
                        //}

                        // документы запросов - нет refDocumentID
                        var reqFiles = filesLoaded.filter(function (f) { return !f.refDocumentID });
                        // документы ответов - есть refDocumentID
                        var resFiles = filesLoaded.filter(function (f) { return !!f.refDocumentID });
                        for (var i1 = 0, len1 = resFiles.length; i1 < len1; i1++) {
                            var resFile = resFiles[i1];
                            var reqFilesMatch = reqFiles.filter(function (f) {
                                return (f.pathToDir === resFile.pathToDir) && (f.documentID === resFile.refDocumentID);
                            });
                            if (reqFilesMatch && reqFilesMatch.length > 0) {
                                if (reqFilesMatch.length === 1) {
                                    resFile.requestFile = reqFilesMatch[0];
                                    //resFile.hasRequest = '+'; // свойство использовалось при отладке
                                } //else { debugger; }
                            } //else { debugger; }
                        }

                        resFiles = resFiles.filter(function (f) { return !!f.requestFile }); // берем только ответы с единственным найденным запросом

                        resFiles.forEach(function (f) {
                            var found = that.tableFiles.testResponseRequestPairs.find(function (i) {
                                return i.documentID === f.documentID && i.pathToDir === f.pathToDir;
                            });
                            if (!found) {
                                that.tableFiles.testResponseRequestPairs.push(f); // добавляем в результат
                            }
                        });

                        /// сохранить в локальное хранилище
                        funcSaveToStore({
                            files: that.tableFiles.testResponseRequestPairs,
                        });

                        that.setStatus('каталог:' + pathPrefix + '; тестовых пар запрос-ответ: ' + that.tableFiles.testResponseRequestPairs.length);

                    });
                };
            }

            fileSelector.click();
        }

        /// фоновый расчет всех нерасчитанных вариантов
        var objSheduler = (function sheduler(settings) {
            var bIsRunning = false;
            var vm = null;

            function start(_vm) {
                vm = _vm;
                bIsRunning = true;
                vm.toast('начат фоновый расчет');
                nextStep();
            }

            function nextStep() {
                if (vm && vm.tableFiles && vm.tableFiles.testResponseRequestPairs) {
                    var found = vm.tableFiles.testResponseRequestPairs.find(function (i) { return !i.responseObj });
                    if (found) {
                        vm.checkItem(found);
                    } else {
                        if (bIsRunning) {
                            bIsRunning = false;
                            vm.toast('закончен фоновый расчет');
                        }
                    }
                } else { debugger; }
            }

            return {
                start: start,
                nextStep: nextStep,
            };
        })({
            //autorun: false,
        });


        return new Vue({
            el: '#app',
            data: function () {
                return {
                    v: objPageScreenParameters,

                    title: filesArrayFromStorage.length ? ('загружено файлов: ' + filesArrayFromStorage.length) : '<- добавьте файлы для обработки',
                    status_text: 'нет открытых файлов',
                    //strVersions: Vue.version,

                    value: null,

                    tableFiles: {
                        headers: [
                          { text: 'Действия', sortable: false },
                          { text: 'Заголовок каталога', value: 'pathToDir', align: 'left' },
                          { text: 'Имя XML Ответа', value: 'localNameDoc' },
                          { text: 'DocumentID', value: 'documentID', sortable: false },
                          { text: 'RefDocumentID', value: 'refDocumentID' },
                          { text: 'Размер Байт', value: 'size' },
                          { text: 'Дата', value: 'strLastModified', align: 'left' },
                          //{ text: 'hasRequest', value: 'hasRequest' },
                        ],
                        selectedItem: {},
                        testResponseRequestPairs: filesArrayFromStorage,
                    },

                }
            }, // data
            // определяйте методы в объекте `methods`
            methods: {
                loadFromDir: openLocalFiles,
                loadFromFile: function () { return openLocalFiles(this, false); },
                clearLocalStorage: function clearLocalStorage() {
                    var that = this;
                    that.tableFiles.testResponseRequestPairs = []; // сброс
                    /// сохранить в локальное хранилище
                    debugger;
                    funcSaveToStore({
                        files: that.tableFiles.testResponseRequestPairs,
                    });
                    // сообщить
                    that.setStatus('<- добавьте файлы для обработки - файлы были очищены.');
                    that.toast('файлы были очищены');
                },
                calcAll: function () {
                    objSheduler.start(this);
                },

                toast: fMessages.toast,
                greet: fMessages.greet,
                setStatus: fMessages.setStatus,
                /// передать как строковые параметры имена модулей, для которых нужно вывести version
                showVersions: function showVersions() {
                    var strVersions = 'Vue.version: ' + Vue.version;
                    for (var i = 0, len = arguments.length; i < len; i++) {
                        var strTool = arguments[i].toString();
                        if (self[strTool] && self[strTool].version) {
                            var ver = self[strTool].version;
                            if (strVersions) {
                                strVersions += '; ';
                            }
                            strVersions += strTool + '.version: ' + ver;
                        }
                    }
                    return strVersions;
                },
                // запрос к REST сервису
                checkItem: function (item) {
                    var p = downloadPostResultFromService(this, item);
                    if (p) {
                        p.then(function () {
                            objSheduler.nextStep();
                        });
                    }
                },
                // открыть диалоговое окно с результатами
                compareItem: function openDialogCompare(item) {
                    this.tableFiles.selectedItem = item;
                    this.v.dialogCompare = true;
                },
            },
            computed: { //

            },
            watch: {
                "v.dark": function (newVal, oldVal) {
                    //this.toast('');
                    funcSaveToStore({
                        v: { dark: newVal },
                    });
                },
            },
            created: function () {
                var that = this;
            },
            mounted: function () {
                var that = this;
                that.$nextTick(function () {
                    // Code that will run only after the entire view has been rendered
                })
            },
        });
    } // function startVue(objSavedInitValues)

    function run(funcStartBefore) {
        return new Promise(function (resolve, reject) {
            if (funcStartBefore) {
                try { funcStartBefore();}
                catch (e) { console.log(e); debugger; }
            }
            pStartDexie().then(function (readResults) {
                startVue(readResults);
                resolve();
            });
        });
    }

    if (settings.autorun) {
        run();
    }

    return {
        pStartDexie: pStartDexie,
        startVue: startVue,
        run: run,
    };
}({
    autorun: false,
});





/* */
var m0 = function (settings) {

    return {
    };
}({
});
