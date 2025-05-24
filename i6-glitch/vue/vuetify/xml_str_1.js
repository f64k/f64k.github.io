

/* работа с Xml */
var mXml = function (settings) {
    /// из строки в xml документ
    function xmlDocParseFromString(strXmlContent) {
        var domParser = new DOMParser();
        var domXml = domParser.parseFromString(strXmlContent, 'text/xml');
        return domXml.documentElement;
    }
    /// первый потомок
    function findFirstChild(elRoot, localName) {
        var elFound = [].find.call(elRoot.children, function (el) { return el.localName === localName; });
        return elFound;
    }
    /// все потомки
    function getAllChildElements(elRoot, localName) {
        var arrElements = [].filter.call(elRoot.children, function (el) { return el.localName === localName; });
        return arrElements;
    }
    /// достать, если документ вложенный. если несколько, то первый.
    function getInnerDoc(elStore) {
        var elDoc = elStore;
        try {
            if (elStore.localName === "ED_Container") {
                var elContainerDoc = findFirstChild(elStore, 'ContainerDoc');
                var elDocBody = findFirstChild(elContainerDoc, 'DocBody');
                elDoc = elDocBody.children[0];
                //debugger;
            }
            if (elStore.localName === "Envelope") {
                var elEnvBody = findFirstChild(elStore, 'Body');
                debugger;
            }
            if (elStore.localName === "Signature") {
                debugger;
            }
        } catch (e) { console.log(e); debugger; }
        return elDoc;
    }
    /// форматирование текста Xml
    function prettyPrintXmlString(strXml) {
        var is_chrome = /chrome/.test(navigator.userAgent.toLowerCase());
        var is_firefox = /firefox/.test(navigator.userAgent.toLowerCase());
        if (is_chrome) {
            // красивое форматирование Xml - отсюда http://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
            if (self.XSLTProcessor && self.DOMParser && self.XMLSerializer) {
                var processor = new XSLTProcessor();
                var domParser = new DOMParser();
                var xmlSerializer = new XMLSerializer();
                if (processor && domParser) {
                    var docXmlToTransform = domParser.parseFromString(strXml, "text/xml");
                    if (docXmlToTransform && docXmlToTransform instanceof Document) {
                        var strXSLT = [
                            '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
                            '  <xsl:output omit-xml-declaration="yes" indent="yes"/>',
                            '  <xsl:template match="node()|@*">',
                            '    <xsl:copy>',
                            '      <xsl:apply-templates select="node()|@*"/>',
                            '    </xsl:copy>',
                            '  </xsl:template>',
                            '</xsl:stylesheet>',
                        ].join('\n');
                        var styleSheet = domParser.parseFromString(strXSLT, "text/xml");
                        if (styleSheet && styleSheet instanceof Document) {
                            processor.importStylesheet(styleSheet);
                            var newXml = processor.transformToDocument(docXmlToTransform);
                            var strNewXmlDoc = xmlSerializer.serializeToString(newXml);
                            return strNewXmlDoc;
                        }
                    }
                }
            }
        } else {
            return strXml;
        }
    }
    /// номер элемента в массиве одноранговых Xml элементов
    function calcElementSiblingNum(elCurr) {
        if (elCurr.parentElement) {
            var siblings = [].filter.call(elCurr.parentElement.children, function (el) {
                return el.localName === elCurr.localName;
            });
            if (siblings.length > 1) {
                var i = 0;
                for (p = elCurr.previousSibling; p !== null; p = p.previousSibling) {
                    if (p.localName === elCurr.localName) {
                        i++;
                    }
                }
                return i;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    /// рекурсивно развернуть дерево XML
    function calcArrayOfXmlPathValues(currPath, xmlNode, buff) {
        [].forEach.call(xmlNode.children, function (el) {
            var elNum = calcElementSiblingNum(el);
            var elPath = currPath + '/' + el.localName;
            if (elNum !== null) {
                elPath += '[' + elNum + ']';
            }
            if (el.children && el.children.length > 0) {
                calcArrayOfXmlPathValues(elPath, el, buff);
            } else {
                var strVal = el.textContent;
                strVal = strVal.trim();
                strVal = strVal.replace(/(\r\n)/gm, '\n'); // без этого многострочные комменты не совпадали - разный перевод строк
                //if (el.localName.includes('Comment')) { var strEsc = escape(strVal); debugger; }
                buff.push({ path: elPath, val: strVal });
            }
        });
    }
    /// разница двух XML
    function calcArrayOfXmlDiff(xmlDocRoot1, xmlDocRoot2) {
        var arrayDiff = [];
        try {
            var nodes1 = [], nodes2 = [];
            if (xmlDocRoot1) {
                calcArrayOfXmlPathValues('', xmlDocRoot1, nodes1);
            } else { debugger; }
            if (xmlDocRoot2) {
                calcArrayOfXmlPathValues('', xmlDocRoot2, nodes2);
            } else { debugger; }
            if (nodes1.length > 0 && nodes2.length > 0) {
                if (true) {
                    arrayDiff = fullJoin2(nodes1, nodes2);
                    debugger;
                } else {
                    debugger;
                    //var nodesDiff1 = nodes1.filter(function (i1) {
                    //    return nodes2.find(function (i2) { return i1.path == i2.path && i1.val != i2.val })
                    //    || !nodes2.find(function (i2) { return i1.path == i2.path });
                    //});
                    //var nodesDiff2 = nodes2.filter(function (i2) {
                    //    return nodes1.find(function (i1) { return i1.path == i2.path && i1.val != i2.val })
                    //    || !nodes1.find(function (i1) { return i1.path == i2.path });
                    //});
                    //var arrayDiff1 = nodesDiff1.map(function (i1, in1) {
                    //    var n2 = nodesDiff2.find(function (i2) { return i1.path == i2.path });
                    //    var in2 = nodesDiff2.indexOf(n2);
                    //    var val1 = i1.val;
                    //    var val2 = n2 ? n2.val : null;
                    //    //var valP = mStr.getStringArrayCommonPrefix([val1, val2]);
                    //    return {
                    //        path: i1.path,
                    //        val1: val1,
                    //        val2: val2,
                    //        in1: in1,
                    //        in2: in2,
                    //    };
                    //});
                    //var arrayDiff2 = nodesDiff2.map(function (i2, in2) {
                    //    var n1 = nodesDiff1.find(function (i1) { return i1.path == i2.path });
                    //    var in1 = nodesDiff1.indexOf(n1);
                    //    var val1 = n1 ? n1.val : null;
                    //    var val2 = i2.val;
                    //    //var valP = mStr.getStringArrayCommonPrefix([val1, val2]);
                    //    return {
                    //        path: i2.path,
                    //        val1: n1 ? n1.val : null,
                    //        val2: i2.val,
                    //        in1: in1,
                    //        in2: in2,
                    //    };
                    //});
                    //arrayDiff = fullJoin(arrayDiff1, arrayDiff2);
                    //debugger;
                }
            } else { debugger; }
        } catch (e) {
            console.log(e);
            debugger;
        }
        return arrayDiff;
    }

    /// слияние двух массивов. оставляем разницу с двух сторон
    function fullJoin2(array1, array2) {
        var join = [];
        var i1 = 0, i2 = 0, l1 = array1.length, l2 = array2.length;
        // параллельное слияние
        while (i1 < l1 || i2 < l2) {
            var o1, o2;
            var i12, i21;
            if (i1 < l1) { o1 = array1[i1]; }
            if (i2 < l2) { o2 = array2[i2]; }
            if (o1 && o2) {
                if (o1.path === o2.path) {
                    if (o1.val !== o2.val) {
                        join.push({
                            path: o1.path,
                            val1: o1.val,
                            val2: o2.val,
                            in1: i1,
                            in2: i2,
                        });
                    } else {
                        //debugger; // значения равны, не сохраняем
                    }
                    i1++;
                    i2++;
                } else {
                    // индексы таких записей в другом массиве
                    var o21 = array2.find(function (_o2) { return o1.path === _o2.path });
                    if (o21) {
                        i21 = array2.indexOf(o21);
                        if (i21 < i1) { debugger; } // перестраховка при отладке
                    } else {
                        join.push({
                            path: o1.path,
                            val1: o1.val,
                            val2: null,
                            in1: i1,
                            in2: -1,
                        });
                        i1++;
                    }

                    var o12 = array1.find(function (_o1) { return _o1.path === o2.path });
                    if (o12) {
                        i12 = array1.indexOf(o12);
                        if (i12 < i2) { debugger; } // перестраховка при отладке
                        debugger;
                    } else {
                        join.push({
                            path: o2.path,
                            val1: null,
                            val2: o2.val,
                            in1: -1,
                            in2: i2,
                        });
                        i2++;
                    }
                }
            } else {
                if (o1) {
                    debugger; // нормально. просто раньше такого не случалось.
                    join.push({
                        path: o1.path,
                        val1: o1.val,
                        val2: null,
                        in1: i1,
                        in2: -1,
                    });
                    i1++;
                }
                if (o2) {
                    debugger; // нормально. просто раньше такого не случалось.
                    join.push({
                        path: o2.path,
                        val1: null,
                        val2: o2.val,
                        in1: -1,
                        in2: i2,
                    });
                    i2++;
                }
            }
        }
        return join;
    }

    /// исключить Неинформативные и Заведомо разные
    function filterArrayOfXmlDiff(arrayDiff) {
        var arrayDiffFiltered = arrayDiff.filter(function (i) {
            var boolAlwaysDiff = (i.path === '/DocumentDateTime') || (i.path === '/DocumentID');
            var boolComment = (i.path.includes('/Comment'));
            var boolCheckDate = (i.path === '/CheckDate');
            return !(boolAlwaysDiff || boolComment || boolCheckDate);
        });
        return arrayDiffFiltered;
    }

    /// обертка для FileReader для чтения XML документа из файла
    function pFileReader(file) {
        return new Promise(function (resolve, reject) {
            var fr = new FileReader();
            fr.onload = function (e) {
                //console.log(e); debugger;
                //resolve(e); // если надо вернуть совсем без обработки
                var strXml = e.target.result;
                var domParser = new DOMParser();
                var domXml = domParser.parseFromString(strXml, 'text/xml');
                var root = domXml.documentElement;
                var rootDoc = getInnerDoc(root); // достать, если документ вложенный. если несколько, то первый.
                // заполнение рабочего объекта для открытого файла
                fileObj = {
                    name: file.name,
                    size: file.size,
                    webkitRelativePath: file.webkitRelativePath,
                    lastModifiedDate: file.lastModifiedDate,
                };
                // добавляем в объект fileObj
                var elDocumentID = findFirstChild(rootDoc, 'DocumentID');
                fileObj.documentID = elDocumentID ? elDocumentID.textContent : null;
                var elRefDocumentID = findFirstChild(rootDoc, 'RefDocumentID');
                fileObj.refDocumentID = elRefDocumentID ? elRefDocumentID.textContent : null;
                fileObj.localNameDoc = rootDoc.localName;
                fileObj.strXml = strXml;
                fileObj.strFormattedXml = mXml.prettyPrintXmlString(strXml);
                fileObj.xmlDocRoot = rootDoc;
                fileObj.pathToDir = file.webkitRelativePath.substr(0, file.webkitRelativePath.lastIndexOf('/'));
                //fileObj.pathToDir = fileObj.pathToDir.substr(pathPrefix.length);
                fileObj.isLoading = false;
                fileObj.diffCount = 0;
                // формат даты
                var m = moment(file.lastModified);
                fileObj.strLastModified = m.format('DD.MM.YYYY HH:mm:ss');
                // возвращаем
                resolve(fileObj);
            };
            fr.onerror = function (e) {
                console.log(e);
                debugger;
                if (false) {
                    reject(e);
                }
            };
            //fr.readAsDataURL(file);
            fr.readAsText(file);
        });
    }

    return {
        pFileReader: pFileReader, // кажется, что надо перенести отсюда, это только для локальных файлов

        xmlDocParseFromString: xmlDocParseFromString,
        getInnerDoc: getInnerDoc,
        prettyPrintXmlString: prettyPrintXmlString,
        filterArrayOfXmlDiff: filterArrayOfXmlDiff,

        findFirstChild: findFirstChild,
        getAllChildElements: getAllChildElements,

        calcElementSiblingNum: calcElementSiblingNum,
        calcArrayOfXmlPathValues: calcArrayOfXmlPathValues,
        calcArrayOfXmlDiff: calcArrayOfXmlDiff,
        fullJoin2: fullJoin2,
    };
}({
});


/* */
var mStr = function (settings) {
    /// для массива строк вычисляет общий префикс - символы в начале каждой строки, совпадающие для всех строк
    function getStringArrayCommonPrefix(arrStr) {
        var resultPrefix = null;
        if (arrStr && arrStr.length > 0) {
            resultPrefix = arrStr[0];
            for (var i = 1, len0 = arrStr.length; i < len0; i++) {
                var currStr = arrStr[i];
                for (var j = 0, len1 = resultPrefix.length; j < len1; j++) {
                    if (currStr.length < j || resultPrefix.charAt(j) !== currStr.charAt(j)) {
                        resultPrefix = resultPrefix.substr(0, j);
                        break;
                    }
                }
            }
        }
        return resultPrefix;
    }

    function compareVersions(installed, required) {

        var a = installed.split('.');
        var b = required.split('.');
        var i, numb;
        for (i = 0; i < a.length; ++i) {
            numb = a[i].match(/\d/g);
            numb = numb.join("");
            a[i] = Number(numb);
        }
        for (i = 0; i < b.length; ++i) {
            numb = b[i].match(/\d/g);
            numb = numb.join("");
            b[i] = Number(numb);
        }
        if (a.length === 2) {
            a[2] = 0;
        }

        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;

        if (a[1] > b[1]) return 1;
        if (a[1] < b[1]) return -1;

        if (a[2] > b[2]) return 1;
        if (a[2] < b[2]) return -1;

        return 0;
    }

    return {
        getStringArrayCommonPrefix: getStringArrayCommonPrefix,
        compareVersions: compareVersions,
    };
}({
});


/* разбор XSD. формирование */
var mXsd = function (settings) {

    /// все импорты без повторов в объект-словарь
    function asyncLoadImportsList(xmlRoot, dictDistinct, fnPromiseGetXsdV) {
        return new Promise(function (resolve, reject) {
            var arrImportNames = mXml.getAllChildElements(xmlRoot, 'import').map(el => el.getAttribute('schemaLocation'));
            arrImportNames = arrImportNames.filter(s => !dictDistinct[s]); // еще не загруженные
            if (arrImportNames && arrImportNames.length > 0) {
                var promisesImports = arrImportNames.map(fnPromiseGetXsdV);
                Promise.all(promisesImports).then(arr => {
                    var promisesArrSubimports = arr.map(i => {
                        var xsdImp = i.length === 1 ? i[0] : null;
                        dictDistinct[xsdImp.name] = xsdImp;
                        xsdImp.root = mXml.xmlDocParseFromString(xsdImp.content);
                        return asyncLoadImportsList(xsdImp.root, dictDistinct, fnPromiseGetXsdV);
                    });
                    Promise.all(promisesArrSubimports).then(_ => {
                        resolve();
                    });
                });
            } else {
                resolve();
            }
        });
    }

    /// [Obsolete] первая попытка, импорты для каждого xsd в дереве зависимостей. плохо - повторы.
    function asyncLoadImportsTree(xsdRootObj, fnPromiseGetXsdV) {
        return new Promise(function (resolve, reject) {
            xsdRootObj.arrImports = []; 
            var arrImportNames = mXml.getAllChildElements(xsdRootObj.root, 'import').map(el => el.getAttribute('schemaLocation'));
            if (arrImportNames && arrImportNames.length > 0) {
                var promisesImports = arrImportNames.map(fnPromiseGetXsdV);
                Promise.all(promisesImports).then(arr => {
                    var promisesArrSubimports = arr.map(i => {
                        var xsdImp = i.length === 1 ? i[0] : null;
                        xsdRootObj.arrImports.push(xsdImp);
                        xsdImp.root = mXml.xmlDocParseFromString(xsdImp.content);
                        return asyncLoadImportsTree(xsdImp, fnPromiseGetXsdV);
                    });
                    Promise.all(promisesArrSubimports).then(_ => {
                        //debugger;
                        resolve();
                    });
                });
            } else {
                //debugger;
                resolve();
            }
        });
    }

    function makeDictByAttribute(arrTypesElements, attrName) {
        var objComplexTypeDict = {};
        arrTypesElements.forEach(function (el) {
            var name = el.getAttribute(attrName);
            objComplexTypeDict[name] = el;
        });
        return objComplexTypeDict;
    }

    function getElements(el) {
        try {
            var arrXmlEl = mXml.getAllChildElements(el, 'element');
            var objElements = {};
            arrXmlEl.forEach(function (el,index) {
                var objEl = { index: index };
                [].forEach.call(el.attributes, a => { objEl[a.name] = a.value; });
                objElements[objEl.name] = objEl;
            });
            return objElements;
        } catch (e) { debugger; }
    }

    function getAnnotation(xmlEl) {
        var strAnnotation;
        var arrAnn = mXml.getAllChildElements(xmlEl, 'annotation');
        arrAnn.forEach(function (elA) {
            var arrDoc = mXml.getAllChildElements(elA, 'documentation');
            arrDoc.forEach(function (elD) {
                if (strAnnotation) {
                    strAnnotation += '\n' + elD.textContent;
                } else {
                    strAnnotation = elD.textContent;
                }
            });
        });
        return strAnnotation;
    }

    function getLocalName(strWithPrefix) {
        var arr = strWithPrefix.split(':');
        if (arr && arr.length > 0) {
            if (arr && arr.length > 1) {
                return arr[1];
            } else {
                return arr[0];
            }
        } else { return strWithPrefix;  }
    }

    function getPrefix(strWithPrefix) {
        var arr = strWithPrefix.split(':');
        if (arr && arr.length > 0) {
            if (arr && arr.length > 1) {
                return arr[0];
            } else {
                debugger; return null;
            }
        } else { debugger; return null; }
    }

    function buildTypeSchemaTree(xsdTypeName, arrSchemas) {
        var retObj = {
            annotations: [],
            types: [xsdTypeName], 
        };
        if (xsdTypeName) {
            try {
                var localName = getLocalName(xsdTypeName);
                var arrFound = arrSchemas.map(function (sc) {
                    var elType = sc.objComplexTypes[localName];
                    if (elType) {
                        return {
                            elType: elType,
                            schema: sc,
                            typeKind: elType.localName,
                        };
                    } else {
                        elType = sc.objSimpleTypes[localName];
                        if (elType) {
                            return {
                                elType: elType,
                                schema: sc,
                                typeKind: elType.localName,
                            };
                        } else {
                            //debugger;
                        }
                    }
                });
                arrFound = arrFound.filter(o => o);
                if (arrFound.length > 1) {
                    // поиск с учетом неймспейса в случае дублей имен
                    var prefix = getPrefix(xsdTypeName);
                    arrFound = arrFound.filter(o => o.schema.ns[prefix] && o.schema.ns[prefix] === o.schema.ns.targetNamespace);
                }
                if (arrFound.length > 0) {
                    if (arrFound.length !== 1) { debugger; }
                    var oFound = arrFound[0];
                    var annot = getAnnotation(oFound.elType);
                    retObj.annotations.push(annot); 
                    var arrInner = [].filter.call(oFound.elType.children, function (el) { return el.localName !== 'annotation'; });
                    if (arrInner.length !== 1) { debugger; }
                    var elInner = arrInner[0];
                    var baseObject;
                    var elSequence;
                    var elRestriction;
                    switch (elInner.localName) {
                        case 'complexContent': {
                            var elExtension = elInner.children[0];
                            baseObject = buildTypeSchemaTree(elExtension.getAttribute('base'), arrSchemas);
                            elSequence = mXml.findFirstChild(elExtension, 'sequence');
                            var elAttribute = mXml.findFirstChild(elExtension, 'attribute');
                            if (elAttribute) {
                                debugger;
                            }
                        } break;
                        case 'sequence': {
                            elSequence = elInner;
                        } break;
                        case 'restriction': {
                            elRestriction = elInner;
                            baseObject = buildTypeSchemaTree(elRestriction.getAttribute('base'), arrSchemas);
                            // обработка ограничений

                            //debugger;
                        } break;
                        default: { debugger; }
                    }

                    if (elSequence) {
                        var objElements = getElements(elSequence);
                        Object.keys(objElements).forEach(key => {
                            var _val = objElements[key];
                            if (!_val) { debugger; }
                            _val.typeObject = buildTypeSchemaTree(_val.type, arrSchemas);

                            //debugger;
                        });
                        if (baseObject) {
                            // сдвинуть номера свойств и слить в один объект
                            var numParentProps = Object.keys(baseObject.properties).length; 
                            Object.keys(objElements).forEach(function (key) {
                                objElements[key].index += numParentProps;
                            });
                            retObj.properties = Object.assign(baseObject.properties, objElements);
                            debugger;
                        } else {
                            retObj.properties = objElements;
                            debugger;
                        }

                    } else {
                        if (baseObject && baseObject.types) {
                            retObj.types = retObj.types.concat(baseObject.types);
                            retObj.annotations = retObj.annotations.concat(baseObject.annotations);
                        } else {
                            //retObj = {};
                            debugger;
                        }
                    }

                } else {
                    if (getPrefix(xsdTypeName) !== 'xs') { debugger; }
                    //debugger; // не найдено в наших схемах - это базовый
                }
            } catch (e) { retObj = e; debugger; }
        }
        return retObj;
    }

    function xsdToObject(strName, fnPromise_GetXsd, version) {
        return new Promise(function (resolve, reject) {
            try {
                var p = fnPromise_GetXsd(strName, version);
                p.then(arr => {
                    if (arr && arr.length === 1) {
                        var xsdMain = arr[0];
                        xsdMain.root = mXml.xmlDocParseFromString(xsdMain.content);
                        //asyncLoadImportsTree(xsdMain, name => fnPromise_GetXsd(name, version)).then(_ => {
                        //    var _xsdMain = xsdMain;
                        //    debugger;
                        //});
                        var _dictImports = {};
                        asyncLoadImportsList(xsdMain.root, _dictImports, name => fnPromise_GetXsd(name, version)).then(_ => {
                            xsdMain.dictImports = _dictImports;
                            // разбираем дерево схемы
                            var objElements = getElements(xsdMain.root);
                            if (Object.keys(objElements).length === 1) {
                                xsdMain.element = objElements[Object.keys(objElements)[0]]; // пипец конструкция какая!
                                xsdMain.annotation = getAnnotation(xsdMain.root);
                                // общий массив схем
                                var arrSchemas = Object.keys(xsdMain.dictImports).map(key => xsdMain.dictImports[key]);
                                arrSchemas.unshift(xsdMain);
                                // разбираем в словари типы импортированных схем
                                arrSchemas.forEach(function (objSchema) {
                                    //objSchema.targetNamespace = objSchema.root.getAttribute('targetNamespace');
                                    objSchema.ns = {};
                                    [].forEach.call(objSchema.root.attributes, a => {
                                        if (true) {
                                            objSchema.ns[a.localName] = a.value;
                                        }
                                    });
                                    objSchema.objComplexTypes = makeDictByAttribute(mXml.getAllChildElements(objSchema.root, 'complexType'), 'name');
                                    objSchema.objSimpleTypes = makeDictByAttribute(mXml.getAllChildElements(objSchema.root, 'simpleType'), 'name');
                                });

                                xsdMain.schemaTree = buildTypeSchemaTree(xsdMain.element.type, arrSchemas);

                                debugger;
                            } else { debugger; }
                        });
                    } else {
                        debugger;
                        alert('не найден ' + strName);
                    }
                });
            } catch (e) { debugger; reject(e); }
        });
    }

    return {
        xsdToObject: xsdToObject,
    };
}({
});


/* */
var m0 = function (settings) {

    function promiseCall(param1) {
        return new Promise(function (resolve, reject) {
            try {
                debugger;
            } catch (e) { debugger; reject(e); }
        });
    }

    return {
    };
}({
});
