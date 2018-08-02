"use strict";

// сменить тему динамически - https://stackoverflow.com/questions/9121350/how-to-swtich-extjs-themes


/// MAIN
Ext.onReady(function () {
    "use strict";

    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    

    createLocalFilesModels(); // 

    //var mainViewport = new Ext.Viewport({
    var mainViewport = Ext.create('Ext.Viewport', {
        id: 'mainViewport',
        layout: 'border',
        renderTo: Ext.getBody(),
        items: [getHeadPanel(), getLeftPanel(), getCenterPanel(), getRightPanel(), getFooterPanel()]
    });

});

function getHeadPanel() {
    var strAbout = Ext.String.format('{0} {1} {2}/{3}', Ext.name, Ext.versions.ext.version, Ext.os.name, Ext.os.deviceType);
    var strProgTitle = "Оболочка отправки в REST сервис.";
    var headerHtml1 = "<div style='margin:2px;'> <b>" + strAbout + "</b> " + strProgTitle + " </div>";
    var headerHtml2 = "<div style='margin:2px;'> <i> ноябрь 2016 </i> </div>";

    function menuOptions() {
        return {
            text: 'Действия',
            menu: [{
                text: 'Открыть редактор HTML',
                handler: function () {
                    var tabsDocuments = Ext.getCmp('documentsTab');
                    if (tabsDocuments) {
                        var tabNew = tabsDocuments.add({
                            title: 'редактор Html',
                            iconCls: 'x-tree-icon-leaf',
                            closable: true,
                            layout: 'fit',
                            items: [{ xtype: 'htmleditor', }]
                        });
                        tabsDocuments.setActiveTab(tabNew);
                    }
                }
            }, {
                text: 'Очистка Локального Хранилища Файлов',
                handler: function () {
                    var store0 = Ext.data.StoreManager.lookup('store_LocalFiles');
                    var store1 = Ext.data.StoreManager.lookup('store_XmlFiles');
                    var store2 = Ext.data.StoreManager.lookup('store_TextFiles');
                    var store3 = Ext.data.StoreManager.lookup('store_ImageFiles');
                    Ext.Msg.show({
                        title: 'Удалить ВСЁ ?',
                        msg: 'Очистить выбранные ранее файлы из локального хранилища ?',
                        buttons: Ext.MessageBox.YESNO,
                        fn: function (btn, text) {
                            if (btn == 'yes') {
                                if (store0) {
                                    store0.removeAll();
                                    store0.sync();
                                }
                                if (store1) {
                                    store1.removeAll();
                                    store1.sync();
                                }
                                if (store2) {
                                    store2.removeAll();
                                    store2.sync();
                                }
                                if (store3) {
                                    store3.removeAll();
                                    store3.sync();
                                }
                            }
                        },
                        icon: Ext.window.MessageBox.QUESTION
                    });
                }
            }, {
                text: 'Очистка Локального Хранилища Настроек',
                handler: function () {
                    try {
                        Ext.state.Manager.clear('navidationAccord');
                        Ext.state.Manager.clear('rightZone');
                    } catch (ex) {
                        Ext.toast(ex);
                    }
                }
            }, {
                text: 'Дата в статус-бар',
                handler: function () {
                    var date = new Date();
                    statusbarWarning(Ext.Date.format(date, "d.m.Y\ H:i:s"));
                }
            }, {
                text: 'disable Self',
                handler: function (t) {
                    //Ext.Msg.alert('Hello', 'World');
                    t.disable();
                }
            }]
        };
    }

    var regionNorth = Ext.create('Ext.Panel', {
        id: 'headerZone',
        region: 'north',
        //title: ' ', 
        //title: '<hr/>',
        dockedItems: [{
            id: 'headerToolbar',
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
            getFileLoaderButton(processLocalFile),
            getFileSaveButton('Сохранить Файл'),
            '-',
            menuOptions(),
            { xtype: 'tbseparator', id: 'separatorAddNew' },
            {
                flex: 1,
                xtype: 'panel',
                border: false,
                layout: 'hbox',
                items: [{ width: 15 }, { border: false, html: headerHtml1, flex: 1 }, { html: headerHtml2, width: 100 }],
            }, {
                text: 'еще меню',
                menu: getMenu1()
            }, {
                text: 'Файл',
                menu: {
                    items: [
                        { text: 'Открыть ...', xtype: 'filebutton', border: false },
                        { text: ' &nbsp; &nbsp; &nbsp; Сохранить ...' }, // если xtype: 'button' то некрасиво
                    ],
                },
            }, '-', {
                text: '?',
                handler: function () {
                    var tabsDocuments = Ext.getCmp('documentsTab');
                    if (tabsDocuments) {
                        var tabNew = tabsDocuments.add({
                            title: 'README - О Программе',
                            iconCls: 'x-tree-icon-leaf', // знак вопроса поставить
                            closable: true,
                            layout: 'fit',
                            items: [{ loader: { url: 'readme.htm', autoLoad: true } }]
                        });
                        tabsDocuments.setActiveTab(tabNew);
                    }
                }
            }],
        }],
        //bbar: 
    });

    return regionNorth;
}

function getLeftPanel() {

    var regionWest = {
        id: 'navidationAccord',
        stateId: 'navidationAccord',
        stateful: true,
        title: "Локальные файлы",
        region: 'west',
        xtype: 'panel',
        split: true,
        collapsible: true,
        collapsed: true,
        width: 500,
        layout: 'accordion',
        items: [{
            id: 'navPanelXml',
            title: 'XML файлы',
            layout: 'fit',
            items: [getGridLocalFiles('gridXmlFiles','store_XmlFiles')]
        }, {
            id: 'navPanelText',
            title: 'Текстовые файлы',
            layout: 'fit',
            //items: [getViewTextFiles()]
            items: [getGridLocalFiles('gridTextFiles', 'store_TextFiles')]
        }, {
            id: 'navPanelImage',
            title: 'Изображения',
            layout: 'fit',
            //items: [getViewImageFiles()]
            items: [getGridLocalFiles('gridImageFiles', 'store_ImageFiles')]
        }, {
            id: 'navPanelHtml',
            title: 'Html файлы',
            layout: 'fit',
            //items: [getViewHtmlFiles()]
            items: [getGridLocalFiles('gridHtmlFiles', 'store_HtmlFiles')]
        }]
    };
    return regionWest;
}

function getCenterPanel() {
    var regionCenter = {
        id: "documentsTab",
        region: 'center',
        xtype: 'tabpanel',
        items: []
    };
    return regionCenter;
}

function getRightPanel() {
    var regionEast = Ext.getCmp('rightZone');
    if (!regionEast) {
        regionEast = {
            id: 'rightZone',
            stateful: true,
            stateId: 'rightZone',
            title: "Информация",
            region: 'east',
            xtype: 'panel',
            split: true,
            collapsible: true,
            collapsed: true,
            //collapseMode: 'mini',
            //flex: 0.5,
            width: 500,
            layout: 'accordion',
            items: [
                { closable: true, title: 'readme.htm', loader: { url: 'readme.htm', autoLoad: true } },
            ]
        };
    }
    return regionEast;
}

function getFooterPanel() {
    var regionSouth = {
        id: 'footerZone',
        region: 'south',
        xtype: 'panel',
        frame: true, // фон не белый
        html: 'подвал. тут системные сообщения ...'
    };
    return regionSouth;
}

/// кнопка основного меню для сохранения текущего открытого документа
function getFileSaveButton(text) {
    var buttonSave = {
        text: text || 'Save File',
        handler: function () {
            var tabPanel = Ext.getCmp('documentsTab');
            if (tabPanel) {
                var tab = tabPanel.getActiveTab();
                if (tab) {
                    if (tab.fileToSave) {
                        var dataUrl = null, strMsg = '';
                        if (tab.fileToSave.dataUrl) {
                            dataUrl = tab.fileToSave.dataUrl;
                        } else {
                            var blobText = tab.fileToSave.xmlText || tab.fileToSave.fileText;
                            var mimeType = tab.fileToSave.type;
                            dataUrl = textToDataUrl(blobText, mimeType);
                        }
                        if (dataUrl) {
                            var link = document.createElement("a");
                            link.download = tab.fileToSave.name;
                            link.href = dataUrl;
                            link.target = '_blank'; // в Опере диалог сохранения не открывается, но хотя бы содержимое не перетереть
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        } else {
                            alert1(tab.fileToSave.name, 'Не получили dataUrl документа для сохранения.' + strMsg);
                        }
                    } else {
                        alert1('НЕ РЕАЛИЗОВАНО СОХРАНЕНИЕ', tab.title);
                    }
                } else {
                    Ext.toast('Нет активного документа на панели документов.', 'сначала откройте документ', 'br');
                }
            }
        }
    };
    return buttonSave;
}

/// кнопка выбора и открытия локального файла
function getFileLoaderButton(onFileReady, text) {
    var fileLoader = new Ext.create('Ext.form.field.File', {
        buttonOnly: true,
        hideLabel: true,
        buttonText: text || 'Открыть Файл',
        width: 110,
        listeners: {
            'render': function (t) {
                var input = Ext.get(t.id + '-button-fileInputEl');
                if (input) {
                    input.dom.addEventListener("click", function (e) {
                        input.dom.value = "";
                    });
                }
            },
            'change': function (t) {
                if (t) {
                    var input = Ext.get(t.id + '-button-fileInputEl');
                    var files = input.getAttribute('files');
                    if (files && files.length && files.length > 0) {
                        var file = files[0];
                        if (onFileReady) {
                            var xmlEnc = null; // кодировка, прочитанная из заголовка xml // если пусто, значит еще не перечитывали
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                switch (file.type) {
                                    case 'application/xml':
                                    case 'application/xslt+xml':
                                    case 'application/xaml+xml':
                                    case 'text/xml': {
                                        if (true) { // читаем через readAsText(
                                            var text = e.target.result;
                                            if (xmlEnc == null) { // прочитали в первый раз
                                                var m = /<\?.*encoding\s*=\s*['"](\S+?)['"].*\?>/.exec(text);
                                                if (m) {
                                                    xmlEnc = m[1];
                                                }
                                                if (!xmlEnc) { // старый вариант. взять кодировку от парсера XML. работает только в Chrome
                                                    var domParser = new DOMParser();
                                                    var xmlDoc = domParser.parseFromString(text, 'text/xml');
                                                    xmlEnc = xmlDoc.xmlEncoding || xmlDoc.characterSet;
                                                }
                                                if (xmlEnc.toUpperCase() == 'UTF-8') {
                                                    onFileReady(file, text, null);
                                                } else {
                                                    reader.readAsText(file, xmlEnc); // читаем второй раз
                                                }
                                            } else { // прочитан повторно
                                                onFileReady(file, text, null);
                                            }
                                        } else { // читаем через readAsArrayBuffer(
                                            var arrayBuffer = e.target.result;
                                            var dataView = new DataView(arrayBuffer);
                                            var decoder = new TextDecoder('utf-8');
                                            var decodedString = decoder.decode(dataView);
                                            onFileReady(file, decodedString, null);
                                        }
                                    } break;
                                    case 'text/html':
                                    case 'text/plain': {
                                        var text = e.target.result;
                                        onFileReady(file, text, null);
                                    } break;
                                    case 'image/jpeg':
                                    case 'image/gif':
                                    case 'image/png': {
                                        var dataUrl = e.target.result;
                                        onFileReady(file, null, dataUrl);
                                    } break;
                                    default: {
                                        alert1(file.type); // нет смысла читать неизвестный файл
                                        onFileReady(file);
                                    }
                                }
                            };

                            switch (file.type) {
                                case 'application/xml':
                                case 'application/xslt+xml':
                                case 'application/xaml+xml':
                                case 'text/xml': {
                                    reader.readAsText(file); // вначале читаем без указания кодировки, потом, если она не utf-8, перечитываем
                                } break;
                                case 'text/html': {
                                    reader.readAsText(file);
                                } break;
                                case 'text/plain': {
                                    reader.readAsText(file, 'CP1251'); // часто тексты в 1251, но не обязательно.
                                } break;
                                case 'image/jpeg':
                                case 'image/gif':
                                case 'image/png': {
                                    reader.readAsDataURL(file);
                                } break;
                                default: {
                                    if (false) {
                                        reader.readAsArrayBuffer(file);
                                    } else {
                                        onFileReady(file);
                                    }
                                }
                            }

                        } else {
                            alert1(file.name, file.type);
                        }
                    }
                }
            }
        }
    });
    return fileLoader;
}

/// обработка открытого файла
function processLocalFile(file, fileText, dataUrl) {
    statusbarWarning(Ext.String.format("файл '{0}' | тип '{1}' | {2} байт", file.name, file.type, file.size));

    var file_name = file.name;
    if (true) { // похоже, что запятая вызывает проблему
        file_name = file_name.replace(',','_');
    }

    var selectedFileID = file_name + ' ' + file.size;

    var fileObjToLocalStorage = {
        fileID: selectedFileID,
        name: file_name,
        size: file.size,
        type: file.type,
        dateMod: file.lastModifiedDate,
    };

    var store, objModel;

    switch (file.type) {
        case 'application/xml':
        case 'application/xslt+xml':
        case 'application/xaml+xml':
        case 'text/xml': {
            fileObjToLocalStorage.xmlText = fileText;
            store = Ext.data.StoreManager.lookup('store_XmlFiles');
            if (store) {
                try {
                    //store.add(fileObjToLocalStorage);
                    objModel = Ext.create('XmlFileModel', fileObjToLocalStorage); // objModel = Ext.ModelManager.create(fileObjToLocalStorage, 'XmlFileModel');
                    objModel.save();
                    store.load();
                    Ext.getCmp('navPanelXml').expand();
                } catch (ex) {
                    if (ex) { alert(ex.message); }
                }
            } else {
                alert("нет хранилища 'store_XmlFiles'");
            }
        } break;
        case 'text/html':
        case 'text/plain': {
            fileObjToLocalStorage.fileText = fileText;
            store = Ext.data.StoreManager.lookup('store_TextFiles');
            if (store) {
                try {
                    //store.add(fileObjToLocalStorage);
                    objModel = Ext.create('TextFileModel', fileObjToLocalStorage); // objModel = Ext.ModelManager.create(fileObjToLocalStorage, 'TextFileModel');
                    objModel.save();
                    store.load();
                    Ext.getCmp('navPanelText').expand();
                } catch (ex) {
                    if (ex) { alert(ex.message); }
                }
            } else {
                alert("нет хранилища 'store_TextFiles'");
            }
        } break;
        case 'image/jpeg':
        case 'image/gif':
        case 'image/png': {
            fileObjToLocalStorage.dataUrl = dataUrl;
            store = Ext.data.StoreManager.lookup('store_ImageFiles');
            if (store) {
                try {
                    //store.add(fileObjToLocalStorage);
                    objModel = Ext.create('ImageFileModel', fileObjToLocalStorage); // objModel = Ext.ModelManager.create(fileObjToLocalStorage, 'ImageFileModel'); 
                    objModel.save();
                    store.load();
                    Ext.getCmp('navPanelImage').expand();
                } catch (ex) {
                    if (ex) { alert(ex.message); }
                }
            } else {
                alert("нет хранилища 'store_ImageFiles'");
            }
        } break;
        default: {
            alert1(file.name, file.type);
        }
    }

    openFileAtTheDocumentPanel(fileObjToLocalStorage);
}

/// открыть файл на панели документов
function openFileAtTheDocumentPanel(file) {
    var tabsDocuments = Ext.getCmp('documentsTab');
    if (tabsDocuments) {
        var contentObj = null;
        switch (file.type) {
            case 'application/xml':
            case 'application/xslt+xml':
            case 'application/xaml+xml':
            case 'text/xml': {
                contentObj = {
                    //xtype: 'tabpanel',
                    //tabPosition: 'bottom',
                    layout: 'border',
                    items: [{
                        region: 'east',
                        split: true,
                        collapsible: true,
                        flex: 1,
                        //title: 'текстовый просмотр',
                        layout: 'fit',
                        items: [{
                            xtype: 'textarea',
                            value: file.xmlText
                        }]
                    }, {
                        region: 'center',
                        flex: 1,
                        //title: 'дерево узлов',
                        layout: 'fit',
                        items: [getXmlTree(file.xmlText)]
                    }]
                };
            } break;
            case 'text/html': {
                contentObj = {
                    autoScroll: true,
                    html: file.fileText,
                };
            } break;
            case 'text/plain': {
                contentObj = {
                    xtype: 'textarea',
                    value: file.fileText,
                };
            } break;
            case 'image/jpeg':
            case 'image/gif':
            case 'image/png': {
                contentObj = {
                    autoScroll: true,
                    html: "<image style='transform: translate(10px,10px) rotate(0deg) ;' src='" + file.dataUrl + "'/>",
                };
            } break;
            default: {
                alert1(file.name, file.type);
            }
        }
        if (contentObj) {
            var tabNew = tabsDocuments.add({
                closable: true,
                iconCls: 'x-tree-icon-leaf',
                title: file.name,
                layout: 'fit',
                items: [contentObj],
            });
            tabNew.fileToSave = file; // прицеп файла к закладке документа
            tabsDocuments.setActiveTab(tabNew);
        }
    } else {
        alert("нет панели 'documentsTab' !");
    }
}

/// модель данных для файлов
function createLocalFilesModels() {

    var arrCommonFileFields = [{
        name: 'fileID',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'size',
        type: 'int'
    }, {
        name: 'type',
        type: 'string'
    }, {
        name: 'dateMod',
        type: 'date',
        dateFormat: 'd.m.Y'
    }];

    //
    var listenerCfg = {
        'exception': function (proxy, response, operation, eOpts) {
            alert(proxy);
        }
    };

    Ext.define('XmlFileModel', {
        extend: 'Ext.data.Model',
        idProperty: 'fileID',
        fields: arrCommonFileFields.concat([{
            name: 'xmlText',
            type: 'string'
        }]),
        proxy: {
            type: 'localstorage',
            id: 'localXmlFiles',
            listeners: listenerCfg
        }
    });

    Ext.define('TextFileModel', {
        extend: 'Ext.data.Model',
        idProperty: 'fileID',
        fields: arrCommonFileFields.concat([{
            name: 'fileText',
            type: 'string'
        }]),
        proxy: {
            type: 'localstorage',
            id: 'localTextFiles',
            listeners: listenerCfg
        }
    });

    Ext.define('ImageFileModel', {
        extend: 'Ext.data.Model',
        idProperty: 'fileID',
        fields: arrCommonFileFields.concat([{
            name: 'dataUrl',
            type: 'string'
        }]),
        proxy: {
            type: 'localstorage',
            id: 'localImageFiles',
            listeners: listenerCfg
        }
    });

    Ext.create('Ext.data.Store', {
        id: 'store_XmlFiles',
        model: 'XmlFileModel',
        autoLoad: true,
        autoSync: true,
    });

    Ext.create('Ext.data.Store', {
        id: 'store_TextFiles',
        model: 'TextFileModel',
        autoLoad: true,
        autoSync: true,
    });

    Ext.create('Ext.data.Store', {
        id: 'store_ImageFiles',
        model: 'ImageFileModel',
        autoLoad: true,
        autoSync: true,
    });

    // модель для дерева Xml
    Ext.define('XmlDocModel', {
        extend: 'Ext.data.Model',
        fields: [
            //{ name: 'text', mapping: 'nodeName' },
            { name: 'text', mapping: 'localName' },
            { name: 'qtip', mapping: 'nodeName' }, // не появляется tip
            { name: 'leaf', convert: function (v, record) { return (record.data.children == null || record.data.children.length == 0); } },
            { name: 'expanded', defaultValue: true },
            {
                name: 'value', convert: function (v, record) {
                    var strValue = null;
                    var oRec = record.raw || record.data;
                    try {
                        if (oRec.children == null || oRec.children.length == 0) {
                            strValue = oRec.textContent;
                        }
                        if (!strValue) {
                            var attributes = oRec.attributes;
                            if (attributes) {
                                if (attributes.length > 0) {
                                    strValue = '<i>' + Array.prototype.filter.call(attributes, function (a) {
                                        return a.prefix != 'xmlns' && a.name != 'xmlns';
                                    }).map(function (a) {
                                        return '@' + a.name + '=' + a.value;
                                    }).join() + '</i>';
                                } else { strValue = ''; }
                            } else { strValue = '-'; }
                        }
                    } catch (ex) {
                        strValue = ex.toString();
                    }
                    return strValue;
                }
            },
            //{ name: 'children', mapping: 'childNodes' },
            //{ name: 'children', convert: function (v, record) { return record.raw.childNodes; } },
        ],
        //belongsTo: 'XmlDocModel',
        //hasMany: { model: 'XmlDocModel', name: 'children', associationKey: 'childNodes' }
    });
}

///
function getViewTextFiles() {
    var dataviewTextFiles = Ext.create('Ext.view.View', {
        id: 'filesView1',
        store: Ext.data.StoreManager.lookup('store_TextFiles'),
        tpl: '<tpl for=".">' +
                 '<div class="bug-wrapper">' +
                     '<span class="fName">{name}</span>' +
                     '<span class="fType">{type}</span>' +
                     '<span class="description">{dateMod}</span>' +
                     //'<span class="status {[values.status.toLowerCase().replace(" ", "-")]}">{status}</span>' +
                 '</div>' +
             '</tpl>',
        itemSelector: 'div.bug-wrapper',
        emptyText: 'Woo hoo! No Bugs Found!',
        deferEmptyText: false
    });

    dataviewTextFiles.on({
        itemclick: function (view, record, item, index, e, opts) {
            // populate the form with the clicked record
            alert1(record.id);
            //win.show();
        }
    });

    return dataviewTextFiles;
}

///
function getViewImageFiles() {
    var dataviewImageFiles = Ext.create('Ext.view.View', {
        id: 'filesView2',
        store: Ext.data.StoreManager.lookup('store_ImageFiles'),
        tpl: '<tpl for=".">' +
                 '<div class="bug-wrapper">' +
                     '<span class="fName">{name}</span>' +
                     '<span class="fType">{type}</span>' +
                     '<span class="description">{dateMod}</span>' +
                     //'<span class="status {[values.status.toLowerCase().replace(" ", "-")]}">{status}</span>' +
                 '</div>' +
             '</tpl>',
        itemSelector: 'div.bug-wrapper',
        emptyText: 'Woo hoo! No Bugs Found!',
        deferEmptyText: false
    });

    dataviewImageFiles.on({
        itemclick: function (view, record, item, index, e, opts) {
            // populate the form with the clicked record
            alert1(record.id);
            //win.show();
        }
    });

    return dataviewImageFiles;
}

/// грид - список сохраненных файлов
function getGridLocalFiles(gridId, storeId) {
    var gridLocalFiles = Ext.create('Ext.grid.Panel', {
        id: gridId,
        store: Ext.data.StoreManager.lookup(storeId),
        columns: [{
            header: 'Имя',
            dataIndex: 'name',
            flex: 4,
        }, {
            header: 'Байт',
            dataIndex: 'size',
            flex: 1,
        }, {
            header: 'Дата',
            dataIndex: 'dateMod',
            xtype: 'datecolumn',
            renderer: Ext.util.Format.dateRenderer('d.m.Y'),
            width: 75,
        }, {
            header: 'Тип',
            dataIndex: 'type',
            flex: 1,
        }],
        listeners: {
            select: function (rowModel, record, index, eOpts) {
                //formPanel.loadRecord(record);
            },
            itemdblclick: function (dataview, record, item, index, e) {
                openFileAtTheDocumentPanel(record.data);
            }
        },
    });

    if (gridLocalFiles) {
        var contextMenu = getContextMenu1(gridId);
        if (contextMenu) {
            gridLocalFiles.on({
                itemcontextmenu: function (view, record, item, index, e) {
                    e.stopEvent();
                    var contextMenu = Ext.getCmp('contextMenuOn_' + gridId);
                    if (contextMenu) {
                        contextMenu.showAt(e.getXY());
                    } else { alert('contextMenuOn_' + gridId); }
                }
            });
        }
    }

    return gridLocalFiles;
}

/// контекстное меню для списка локальных файлов
function getContextMenu1(gridName) {

    var contextMenu = Ext.create('Ext.menu.Menu', {
        id: 'contextMenuOn_' + gridName,
        //height: 100,
        //width: 125,
        items: [{
            itemId: 'menuView',
            text: 'Открыть на просмотр',
            iconCls: 'x-group-by-icon',
            handler: function (item, e) {
                var selectedRecords = Ext.getCmp(gridName).getSelectionModel().getSelection();
                if (selectedRecords && selectedRecords.length > 0) {
                    var record = selectedRecords[0];
                    openFileAtTheDocumentPanel(record.data);
                }
            },
        }, {
            itemId: 'menuDelete',
            text: 'Удалить Из Буфера',
            icon: '4.2/images/shared/warning.gif',
            handler: function (item, e) {
                var selectedRecords = Ext.getCmp(gridName).getSelectionModel().getSelection();
                if (selectedRecords && selectedRecords.length > 0) {
                    var record = selectedRecords[0];
                    record.store.remove(record);
                }
            },
        },
        //{ itemId: 'menuEdit', text: 'Edit Invoice', iconCls: 'x-form-invalid-icon' },
        //{ itemId: 'menuSend', text: 'Send To REST Sevice', iconCls: 'x-datepicker-next' },
        ],
        //defaults: {
        //    listeners: {
        //        click: function (item) {
        //            var selectedRecords = Ext.getCmp(gridName).getSelectionModel().getSelection();
        //            if (selectedRecords && selectedRecords.length > 0) {
        //                var record = selectedRecords[0];
        //                switch (item.itemId) {
        //                    case 'menuView': {
        //                        openFileAtTheDocumentPanel(record.data);
        //                    } break;
        //                    case 'menuDelete': {
        //                        record.store.remove(record);
        //                    } break;
        //                    default: {
        //                        alert1(item.itemId, record.data.fileID);
        //                    } break;
        //                }
        //            }
        //        }
        //    }
        //},
    });

    return contextMenu;
}

/// дерево-грид для просмотра XML
function getXmlTree(xmlText, xmlDoc) {
    var treeStore = null;
    if (!xmlDoc) {
        if (xmlText) {
            if (true && window.DOMParser) {
                var domParser = new DOMParser();
                //var xmlDoc = domParser.parseFromString(file.xmlText, file.type);
                xmlDoc = domParser.parseFromString(xmlText, 'text/xml');
            }
        }
    }
    if (xmlDoc) {
        treeStore = Ext.create('Ext.data.TreeStore', {
            //root: xmlDoc.documentElement,
            root: xmlDoc,
            model: 'XmlDocModel',
            //autoLoad: true,
        });
    }
    if (treeStore) {
        var treePanel = Ext.create('Ext.tree.Panel', {
            store: treeStore,
            //title: 'Xml дерево',
            rootVisible: false,
            columns: [
                {
                    xtype: 'treecolumn',
                    text: 'Дерево XML',
                    dataIndex: 'text',
                    menuDisabled: true,
                    sortable: false,
                    width: 300,
                    resizable: true,
                },
                { text: 'Значения', dataIndex: 'value', menuDisabled: true, sortable: false, flex: 1 },
            ],
            viewConfig: { deferEmptyText: false, emptyText: 'Нет данных для отображения.', },
            stripeRows: true, // не работает. не задан css ?
            columnLines: true,
            rowLines: true,
        });

        return treePanel;
    }
}

/// MessageBox с копией в статусбар
function alert1(caption, text) {
    statusbarWarning(Ext.String.format("{0}: {1}", caption, text));
    if (text) {
        Ext.MessageBox.alert(caption, text);
    } else {
        Ext.MessageBox.alert('_', caption);
    }
}

/// в нижнюю зону текст
function statusbarWarning(text) {
    var footer = Ext.getCmp('footerZone');
    if (footer) {
        footer.update({ html: text });
    }
}

/// объект file из активного документа.
function getTabDocFile() {
    var tabPanel = Ext.getCmp('documentsTab');
    if (tabPanel) {
        var tab = tabPanel.getActiveTab();
        if (tab) {
            if (tab.fileToSave) {
                return tab.fileToSave;
                //var textToSend = tab.fileToSave.xmlText || tab.fileToSave.fileText;
                //if (textToSend) {
                //    return textToSend;
                //} else { Ext.MessageBox.alert('Нет текста .xmlText или .fileText', tab.title); }
            } else { Ext.MessageBox.alert('Не привязан tab.fileToSave', tab.title); }
        } else { Ext.toast("Нет активного документа на панели документов"); }
    } else { Ext.toast("Нет панели 'documentsTab'"); }
}

/* методы общего назначения */

/// текст в ссылку, пригодную для, например, <iframe src=
function textToDataUrl(blobText, mimeType) {
    var strMsg;
    if (blobText) {
        if (window.Blob) {
            var blob = new Blob([blobText], { type: mimeType });
            if (blob) {
                if (window.URL) {
                    var dataUrl = URL.createObjectURL(blob);
                    return dataUrl;
                } else {
                    if (window.createObjectURL) {
                        var dataUrl = window.createObjectURL(blob);
                        return dataUrl;
                    } else {
                        strMsg = ' Нет window.URL или window.createObjectURL';
                        console.error(strMsg);
                    }
                }
            }
        } else {
            strMsg = ' Нет window.Blob';
            console.error(strMsg);
        }
    }
}


/* эксперименты */

/// демонстрационное меню
function getMenu1() {

    function onItemCheck(item, checked) {
        Ext.toast('Item Check', Ext.String.format('You {1} the "{0}" menu item.', item.text, checked ? 'checked' : 'unchecked'));
    }

    var dateMenu = Ext.create('Ext.menu.DatePicker', {
        handler: function (dp, date) {
            Ext.toast('Date Selected', Ext.String.format('You choose {0}.', Ext.Date.format(date, 'j M, Y')));
        }
    });

    var colorMenu = Ext.create('Ext.menu.ColorPicker', {
        handler: function (cm, color) {
            alert1('Color Selected', Ext.String.format('<span style="color:#' + color + ';">You choose {0}.</span>', color));
        }
    });

    var fileMenu = Ext.create('Ext.form.field.File', {
        //buttonOnly: true,
        //hideLabel: true,
        //buttonText: text || 'Открыть Файл',
        handler: function (a, b, c) {
            alert1(Ext.String.format('a={0};b={1};c={2};', a, b, c));
        }
    });

    var menu = Ext.create('Ext.menu.Menu', {
        id: 'mainMenu',
        style: {
            overflow: 'visible'     // For the Combo popup
        },
        items: [
            {
                text: 'I like Ext',
                checked: true,       // when checked has a boolean value, it is assumed to be a CheckItem
                checkHandler: onItemCheck
            }, '-', {
                text: 'Radio Options',
                menu: {        // <-- submenu by nested config object
                    items: [
                        // stick any markup in a menu
                        '<b class="menu-title">Choose a Theme</b>',
                        {
                            text: 'Aero Glass',
                            checked: true,
                            group: 'theme',
                            checkHandler: onItemCheck
                        }, {
                            text: 'Vista Black',
                            checked: false,
                            group: 'theme',
                            checkHandler: onItemCheck
                        }, {
                            text: 'Gray Theme',
                            checked: false,
                            group: 'theme',
                            checkHandler: onItemCheck
                        }, {
                            text: 'Default Theme',
                            checked: false,
                            group: 'theme',
                            checkHandler: onItemCheck
                        }
                    ]
                }
            }, {
                text: 'Choose a Date',
                iconCls: 'calendar',
                menu: dateMenu // <-- submenu by reference
            }, {
                text: 'Choose a Color',
                menu: colorMenu // <-- submenu by reference
            }
            //, { text: 'File', menu: fileMenu }
            , { text: 'Открыть ...', xtype: 'filebutton' }
        ]
    });

    return menu;
}

/// попытка прочитать Xml из dataUrl в надежде на автоматическую правильную кодировку. Не получилось.
function readFromDataUrlWithXHR(dataUrlXml) {
    //var dataUrlXml = e.target.result;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', dataUrlXml, true);
    //xhr.responseType = 'document';
    //xhr.overrideMimeType(file.type); // overrideMimeType() can be used to force the response to be parsed as XML
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                console.log(xhr.response);
                console.log(xhr.responseXML);
                onFileReady(file, xhr.responseText, null);
            }
        }
    };
    xhr.send(null);
}


/* XSLT */

///
function getXsltTransform(xmlDoc, funcOnXsltProcessorReady) {
    var xsltProcessor = null;
    if (xmlDoc.documentElement) {
        if (xmlDoc.documentElement.tagName == 'GuaranteeCalculationResult' || xmlDoc.documentElement.tagName == 'DebtCalculationResult') {
            var attrDocumentModeID = xmlDoc.documentElement.getAttribute('DocumentModeID');
            if (attrDocumentModeID) {
                var verAlbum = xmlDoc.documentElement.namespaceURI;
                if (verAlbum) {
                    var m = /.+:(\d+\.\d+\.\d+).*/.exec(verAlbum);
                    if (m) {
                        verAlbum = m[1];
                        loadXsltFromServer(verAlbum, attrDocumentModeID, xmlDoc.documentElement.tagName, function (xsltXml, xsltText) {
                            if (xsltXml) {
                                xsltProcessor = new XSLTProcessor();
                                if (xsltProcessor) {
                                    try {
                                        xsltProcessor.importStylesheet(xsltXml);
                                        var resultDocument = xsltProcessor.transformToDocument(xmlDoc);
                                        if (funcOnXsltProcessorReady && resultDocument) {
                                            funcOnXsltProcessorReady(resultDocument);
                                        }
                                    } catch (ex) {
                                        console.log(ex);
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }
}

///
function loadXsltFromServer(verAlbum, attrDocumentModeID, localName, funcOnXsltTemplateReady) {
    var filename = 'get/xslt/' + verAlbum + '/' + attrDocumentModeID + '_' + localName;
    Ext.Ajax.request({
        url: filename,
        method: "GET",
        success: function (response) {
            var xml = response.responseXML;
            var text = response.responseText;
            // process server response here
            if (funcOnXsltTemplateReady) {
                funcOnXsltTemplateReady(xml, text);
            }
        }
    });
}