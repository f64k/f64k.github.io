
class XsdManager_1 {
    constructor() {
        this.parser = new DOMParser();
    }

    async getImports(arrImportSchemaLocations, strVersion, dictSchemas) {
        if (arrImportSchemaLocations && strVersion && dictSchemas && dictSchemas.constructor == Object) {
            for (const strLocation of arrImportSchemaLocations) {
                if (!(strLocation in dictSchemas)) {
                    const strUrlXsd = `/xsd_schs/V${strVersion}/${strLocation}`;
                    console.log(strUrlXsd);
                    const resp = await fetch(strUrlXsd);
                    const xsdStr = await resp.text();
                    const xsdDoc = this.parser.parseFromString(xsdStr, "text/xml");
                    dictSchemas[strLocation] = xsdDoc;
                    const arrImports = Array.from(xsdDoc.getElementsByTagNameNS(xsdDoc.documentElement.namespaceURI, 'import'));
                    const arrLocations = arrImports.map(el => el.getAttribute('schemaLocation'));
                    await this.getImports(arrLocations, strVersion, dictSchemas);
                }
            }
        }
    }

    async getXsdSchemas(strDocNamespace) {
        const arrNameVer = strDocNamespace.split(":");
        let strVersion = arrNameVer.pop();
        let strDocName = arrNameVer.pop();
        if (arrNameVer.includes("EEC")) {
            strVersion = "5.25.0";
            strDocName = `EEC_${strDocName}`;
        }
        const strUrlXsd = `/xsd_schs/V${strVersion}/${strDocName}.xsd`;
        console.log(strUrlXsd);
        const resp = await fetch(strUrlXsd);
        if (resp.status == 200) {
            const xsdString = await resp.text();
            const xsdDoc = this.parser.parseFromString(xsdString, "text/xml");
            const dictXsdDocs = { [`${strDocName}.xsd`]: xsdDoc };
            const arrImports = Array.from(xsdDoc.getElementsByTagNameNS(xsdDoc.documentElement.namespaceURI, 'import'));
            const arrImportSchemaLocations = arrImports.map(el => el.getAttribute('schemaLocation'));
            await this.getImports(arrImportSchemaLocations, strVersion, dictXsdDocs);

            const arrXsdDocs = Object.values(dictXsdDocs);
            const arrFirstElements = arrXsdDocs.flatMap(doc => Array.from(doc.documentElement.children));
            const dictTypesByName = arrFirstElements
                .map(el => ({ el, lname: el.localName, aname: el.getAttribute('name') }))
                .filter(el => el.aname)
                .reduce((acc, { lname, aname, el }) => {
                    if (!acc[lname]) { acc[lname] = {}; }
                    const targetNamespace = el.parentElement.getAttribute('targetNamespace');
                    const pref = Array.from(el.parentElement.attributes).find(attr => attr.value == targetNamespace).name.split(":").pop();
                    const anamePref = `${pref}:${aname}`;
                    if (acc[lname][aname] || acc[lname][anamePref]) {
                        debugger;
                        const elPrev = acc[lname][aname];
                        const targetNamespacePrev = elPrev.parentElement.getAttribute('targetNamespace');
                        const prefPrev = Array.from(elPrev.parentElement.attributes).find(attr => attr.value == targetNamespacePrev).name.split(":").pop();
                        if (targetNamespace === targetNamespacePrev) { debugger; }
                        if (pref === prefPrev) { debugger; }
                        if (elPrev.outerHTML === el.outerHTML) {
                            console.log(aname, pref, prefPrev, targetNamespace, targetNamespacePrev);
                            debugger;
                        }
                    }
                    //acc[lname][aname] = el;
                    acc[lname][anamePref] = el;
                    return acc;
                }, {});

            console.log(arrFirstElements.reduce((acc, el) => {
                const name = el.nodeName;
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {}));

            console.log(strDocNamespace, dictTypesByName);
            return dictTypesByName;
        }
        console.log(`статус=${resp.status} загрузки ${strUrlXsd}`)
        debugger;
        return null;
    }

    getParentXsdSchemas(objNodeParent) {
        let objCurrParent = objNodeParent;
        while (objCurrParent && !objCurrParent.dictXsdParts) {
            objCurrParent = objCurrParent.parent;
        }
        return objCurrParent ? objCurrParent.dictXsdParts : null;
    }

    getLocalName(strMayBePrefixed) {
        if (strMayBePrefixed) {
            const arrNameVer = strMayBePrefixed.split(":"); // getLocalName
            return arrNameVer.pop();
        } else {
            return strMayBePrefixed;
        }
    }

    getAnnotation(elXsd) {
        const elAnn = Array.from(elXsd.children).filter(el => el.localName == "annotation");
        if (elAnn && elAnn.length > 0) {
            return elAnn[0].textContent.trim();
        } else {
            return null;
        }
    }

    getChildXsdElement(elComplexType, strLocalName, dictXsdParts) {
        const arrElements = Array.from(elComplexType.getElementsByTagNameNS(elComplexType.namespaceURI, "element"));
        const elChild = arrElements.find(el => el.getAttribute("name") == strLocalName);
        if (elChild) {
            return elChild;
        } else {
            const elChildRef = arrElements.find(el => this.getLocalName(el.getAttribute("ref")) == strLocalName);
            if (elChildRef) {
                const refElement = dictXsdParts["element"][elChildRef.getAttribute("ref")];
                return refElement;
            } else {
                const arrContent = Array.from(elComplexType.getElementsByTagNameNS(elComplexType.namespaceURI, "complexContent"));
                if (arrContent && arrContent.length > 0) {
                    const arrExtension = arrContent.flatMap(el => Array.from(el.getElementsByTagNameNS(el.namespaceURI, "extension")));
                    if (arrExtension && arrExtension.length > 0) {
                        const baseName = arrExtension[0].getAttribute("base");
                        //const baseName = this.getLocalName(arrExtension[0].getAttribute("base"));
                        if (baseName in dictXsdParts["complexType"]) {
                            return this.getChildXsdElement(dictXsdParts["complexType"][baseName], strLocalName, dictXsdParts);
                        } else { return null; }
                    } else { return null; }
                } else { return null; }
            }
        }
    }

    getXsdTypeByName(strTypePrefixedName, dictXsdParts) {
        if (strTypePrefixedName) {

            const arrPrefName = strTypePrefixedName.split(":");
            if (arrPrefName.length != 2) { debugger; }
            const namespaceXsdType = arrPrefName[0];
            const nameXsdType0 = arrPrefName[1];

            const nameXsdType = strTypePrefixedName;
            const elSimpleType = dictXsdParts["simpleType"][nameXsdType];
            const elComplexType = dictXsdParts["complexType"][nameXsdType];
            if (elSimpleType && elComplexType) {
                console.log(strTypePrefixedName, elSimpleType.outerHTML, elComplexType.outerHTML);
                debugger;
            }
            if (elSimpleType) {
                //console.log(this.getAnnotation(elSimpleType));
                return elSimpleType;
            }
            if (elComplexType) {
                //console.log(this.getAnnotation(elComplexType));
                return elComplexType;
            }
        }
        return null;
    }

    linkXsdRecursively(objNode, elementXsd, dictXsdParts) {
        debugger;
        if (!dictXsdParts) { return; }
        objNode.strAnnotationFromElement = this.getAnnotation(elementXsd);
        //const elXsdType = this.getXsdType(elementXsd);
        const strTypePrefixedName = elementXsd.getAttribute("type");
        const elXsdType = getXsdTypeByName(strTypePrefixedName, dictXsdParts);
        if (elXsdType) {
            if (objNode.children) {
                debugger;
                elComplexType = elXsdType;
                for (const child of objNode.children) {
                    const elementXsdChild = this.getChildXsdElement(elComplexType, child.local_name, dictXsdParts);
                    this.linkXsdRecursively(child, elementXsdChild, dictXsdParts);
                }
            } else {
                console.log(objNode.name, elComplexType);
            }
        }
    }

    getRestrictionsRecursively(elXsdType, dictXsdParts) {
        if (elXsdType && dictXsdParts) {
            if (elXsdType.localName != "simpleType") { }
            for (const elRestriction of Array.from(elXsdType.getElementsByTagNameNS(elXsdType.namespaceURI, "restriction"))) {
                const baseName = elRestriction.getAttribute("base");
                const fnCombElemNameAndAttr = (localName, attrName) => (attrName == "value") ? localName : `${localName}+${attrName}`;
                const childRestrictions = Object.fromEntries(Array.from(elRestriction.children).flatMap(el => Array.from(el.attributes).map(attr => [fnCombElemNameAndAttr(el.localName, attr.name), attr.value])));
                if (baseName in dictXsdParts["simpleType"]) {
                    const baseRestrictions = this.getRestrictionsRecursively(dictXsdParts["simpleType"][baseName], dictXsdParts);
                    return Object.assign(childRestrictions, baseRestrictions);;
                } else {
                    childRestrictions["base"] = baseName;
                    return childRestrictions;
                }
            }
        }
    }

} // class XsdManager