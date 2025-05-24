////
// xml-manager.js
////

class XMLParser_3 {
  constructor() { // (xmlString)
    this.parser = new DOMParser();
    //this.setLastXML(xmlString);
  }

  setLastXML_sync(xmlString) {
    debugger;
    if (!xmlString) {
      xmlString = this.loadFromStorage();
      if (!xmlString) {
        xmlString = this.getTestXml(0);
      }
    }
    if (xmlString !== this.currentXmlString) {
      this.currentXmlString = xmlString;
      if (this.currentXmlString != this.getTestXml(0)) {
        this.saveToStorage(this.currentXmlString);
      }
      this.xmlDoc = this.parser.parseFromString(this.currentXmlString, "text/xml");
      //const textContent = this.xmlDoc.documentElement.textContent;
      this.rootTreeObject = this.parseNodeRecursively(this.xmlDoc.documentElement, null);
    }
  }

  async setLastXMLAsync(xmlString, xsdMan) {
    if (!xmlString) {
      xmlString = this.loadFromStorage();
      if (!xmlString) {
        xmlString = this.getTestXml(0);
      }
    }
    if (xmlString !== this.currentXmlString) {
      this.currentXmlString = xmlString;
      if (this.currentXmlString != this.getTestXml(0)) {
        if (this.currentXmlString != this.loadFromStorage()) {
          this.saveToStorage(this.currentXmlString);
        }
      }
      this.xmlDoc = this.parser.parseFromString(this.currentXmlString, "text/xml");
      this.xsdMan = xsdMan;
      this.rootTreeObject = await this.parseNodeRecursively(this.xmlDoc.documentElement, null);
    }
  }


  async setLastXMLAsync_1(xmlString, xsdMan) {
    this.setLastXML(xmlString);
    if (this.rootTreeObject && xsdMan) {
      if (this.rootTreeObject.namespace) {
        const dictXsdParts = await xsdMan.getXsdSchemas(this.rootTreeObject.namespace);
        console.log(dictXsdParts);
        if (dictXsdParts && dictXsdParts.element && this.rootTreeObject.local_name in dictXsdParts.element) {
          this.dictXsdParts = dictXsdParts;
          const elementXsd = dictXsdParts["element"][this.rootTreeObject.local_name];
          xsdMan.linkXsdRecursively(this.rootTreeObject, elementXsd, this.dictXsdParts);
          //this.rootTreeObject = this.parseNodeRecursively(dictXsdParts["element"][this.rootTreeObject.local_name]); // this.xsdDoc.documentElement
        }
      }
    }
  }


  findSiblingComment(nodeSibling) {
    let currSiblingNode = nodeSibling;
    while (currSiblingNode && currSiblingNode.nodeType !== Node.COMMENT_NODE && currSiblingNode.nodeType !== Node.ELEMENT_NODE) {
      currSiblingNode = currSiblingNode.previousSibling;
    }
    return (currSiblingNode && currSiblingNode.nodeType == Node.COMMENT_NODE) ? currSiblingNode : null;
  }

  async parseNodeRecursively(node, parentNode) {
    const objNode = {
      name: node.nodeName,
      local_name: node.localName,
      prefix: node.prefix,
      namespace: node.namespaceURI,
      parent: parentNode,
    };
    const previousCommentSibling = this.findSiblingComment(node.previousSibling);
    if (previousCommentSibling) {
      objNode.previousComment = previousCommentSibling.textContent.trim();
      console.log(objNode.local_name, objNode.previousComment);
    }
    objNode.arrParents = parentNode ? [...parentNode.arrParents, parentNode] : [];
    objNode.isLast = node.nextElementSibling === null;
    const fillSymbol = "░"; // ▦▢▯░▒▓█▓▒░ // "&nbsp;"
    //const fillSymbol = "&nbsp;&nbsp;&nbsp;";
    objNode.textFillParentShift = " ";
    //objNode.textFillParentShift = objNode.arrParents.map(p => "&nbsp;").join(" ");
    //objNode.textFillParentShift = objNode.arrParents.map(p => p.isLast ? fillSymbol : "│").join("") + (objNode.isLast ? "└" : "├");
    //objNode.textFillParentShift = objNode.arrParents.map(p => p.isLast ? fillSymbol : "║").join("") + (objNode.isLast ? "╙" : "╟");
    //objNode.textFillParentShift = objNode.arrParents.map(p => p.isLast ? fillSymbol : "║").join("") + (objNode.isLast ? "╚" : "╠");
    objNode.attributes = null;
    if (node.attributes.length > 0) {
      objNode.attributes = [...node.attributes].map((attr) => ({
        name: attr.nodeName,
        local_name: attr.localName,
        prefix: attr.prefix,
        namespace: attr.namespaceURI,
        value: attr.value,
        parent: objNode,
      }));
    }

    if (objNode.parent && objNode.parent.elXsdType) {
      const dictXsdParts = this.xsdMan.getParentXsdSchemas(objNode.parent);
      if (dictXsdParts) {
        if (objNode.parent.elXsdType.localName === "simpleType") { debugger; }
        objNode.elXsdElem = this.xsdMan.getChildXsdElement(objNode.parent.elXsdType, objNode.local_name, dictXsdParts);
        if (objNode.elXsdElem) {
          objNode.elXsdType = this.xsdMan.getXsdTypeByName(objNode.elXsdElem.getAttribute("type"), dictXsdParts);
          //console.log(objNode.elXsdElem, objNode.elXsdType);
        } else {
          debugger;
          console.log("Не найден элемент в XSD типе", objNode.local_name, objNode.parent.elXsdType);
        }
      }
    } else {
      if (objNode.namespace) {
        const arrUnknownNsParts = ["http", "Envelope", "ED_Container", "CommonAggregateTypes"];
        const arrKnownNsParts = ["EEC", "customs.ru"];
        const arrNamespaceParts = objNode.namespace.split(":");
        const boolToGetXsd = arrNamespaceParts.some(i => arrKnownNsParts.includes(i)) && !arrNamespaceParts.some(i => arrUnknownNsParts.includes(i));
        let boolParentToGetXsd = false;
        if (objNode.parent) {
          const arrParentNamespaceParts = objNode.parent.namespace.split(":");
          boolParentToGetXsd = arrParentNamespaceParts.some(i => arrKnownNsParts.includes(i)) && !arrParentNamespaceParts.some(i => arrUnknownNsParts.includes(i));
        }
        if (objNode.local_name === "ESADout_CU") { debugger; }
        if (boolToGetXsd && !boolParentToGetXsd) {
          if (this.xsdMan) {
            objNode.dictXsdParts = await this.xsdMan.getXsdSchemas(objNode.namespace);
            if (objNode.dictXsdParts && objNode.dictXsdParts.element) {
              if (objNode.dictXsdParts["element"][objNode.name]) { debugger; }
              objNode.elXsdElem = Object.values(objNode.dictXsdParts["element"]).find(el => el.getAttribute("name") === objNode.local_name);
              if (objNode.elXsdElem) {
                objNode.elXsdType = this.xsdMan.getXsdTypeByName(objNode.elXsdElem.getAttribute("type"), objNode.dictXsdParts);
                console.log(objNode.elXsdElem, objNode.elXsdType);
              }
            }
          }
        }
      }
    }

    const arr_children = [];
    for (const child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const newObjNode = await this.parseNodeRecursively(child, objNode);
        arr_children.push(newObjNode);
      }
    }
    objNode.children = arr_children.length === 0 ? null : arr_children;

    objNode.value = arr_children.length === 0 ? node.textContent.trim() : null;

    this.addNodeMethods(objNode)
    return objNode;
  }

  parseNodeRecursively_0(node, parentNode) {
    const objNode = {
      name: node.nodeName,
      local_name: node.localName,
      prefix: node.prefix,
      namespace: node.namespaceURI,
      parent: parentNode,
    };
    const previousCommentSibling = this.findSiblingComment(node.previousSibling);
    if (previousCommentSibling) {
      objNode.previousComment = previousCommentSibling.textContent.trim();
      console.log(objNode.local_name, objNode.previousComment);
    }
    objNode.arrParents = parentNode ? [...parentNode.arrParents, parentNode] : [];
    objNode.isLast = node.nextElementSibling === null;
    const fillSymbol = "░"; // ▦▢▯░▒▓█▓▒░ // "&nbsp;"; // ⟓⟓⟓ ⌟⌟⌟⌟
    //const fillSymbol = "&nbsp;&nbsp;&nbsp;";
    objNode.textFillParentShift = " ";
    //objNode.textFillParentShift = objNode.arrParents.map(p => "&nbsp;").join(" ");
    //objNode.textFillParentShift = objNode.arrParents.map(p => p.isLast ? fillSymbol : "│").join("") + (objNode.isLast ? "└" : "├");
    //objNode.textFillParentShift = objNode.arrParents.map(p => p.isLast ? fillSymbol : "║").join("") + (objNode.isLast ? "╙" : "╟");
    //objNode.textFillParentShift = objNode.arrParents.map(p => p.isLast ? fillSymbol : "║").join("") + (objNode.isLast ? "╚" : "╠");
    objNode.attributes = null;
    if (node.attributes.length > 0) {
      objNode.attributes = [...node.attributes].map((attr) => ({
        name: attr.nodeName,
        local_name: attr.localName,
        prefix: attr.prefix,
        namespace: attr.namespaceURI,
        value: attr.value,
        parent: objNode,
      }));
    }
    const arr_children = [];
    for (const child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const newObjNode = this.parseNodeRecursively_0(child, objNode);
        arr_children.push(newObjNode);
      }
    }
    objNode.value = arr_children.length === 0 ? node.textContent.trim() : null;
    objNode.children = arr_children.length === 0 ? null : arr_children;

    this.addNodeMethods(objNode)
    return objNode;
  }

  addNodeMethods(objNode) {

    objNode.getTwisterSymbol = function () {
      //return this.isOpen ? "◪" : "◩"; // ◢◤ // ▲▼ // ⛛ // ▷
      //return this.isOpen ? "⊿" : "▷";
      return this.isOpen ? "◢" : "➤"; // ▶ // ➤
      //return this.isOpen ? "⊟" : "⊞";
      //return this.isOpen ? "⊖" : "⊕";
      //return this.isOpen ? "⛛" : "▷";
      //return this.isOpen ? "▼" : "▶";
      //return this.isOpen ? "➖" : "➕";
    };

    objNode.setRowsDisplay = function () {
      if (this.elementTableRow) {
        if (this.arrParents.every((p) => p.isOpen)) {
          this.elementTableRow.style.display = "";
        } else {
          this.elementTableRow.style.display = "none";
        }
        if (this.children) {
          for (let child of this.children) {
            child.setRowsDisplay();
          }
        }
      }
    };

    objNode.toggleOpen = function () {
      if (objNode.isOpen == true) {
        objNode.isOpen = false;
      } else {
        objNode.isOpen = true;
      }
      if (this.elementDetails) {
        this.elementDetails.open = objNode.isOpen;
      }
      if (this.elementTableRow) {
        if (this.children) {
          const divNodeZone = this.elementTableRow.querySelector('.node-zone');
          if (divNodeZone) {
            if (objNode.isOpen == true) {
              divNodeZone.classList.remove("node-is-closed");
              divNodeZone.classList.add("node-is-open");
            } else {
              divNodeZone.classList.remove("node-is-open");
              divNodeZone.classList.add("node-is-closed");
            }
          }
          const spanTwister = this.elementTableRow.querySelector('.twister');
          if (spanTwister) {
            spanTwister.textContent = this.getTwisterSymbol();
          }
        }
      }
      this.setRowsDisplay();
    };

    objNode.annotationFromElement = function (xsdMan) {
      if (this.elXsdElem && xsdMan) {
        return xsdMan.getAnnotation(this.elXsdElem);
      }
    };

  } // addNodeMethods()

  nodeToggleEventHandler(objNode, eventToggle) {
    const bDoNothing = (eventToggle.newState == "open") == objNode.isOpen;
    if (bDoNothing) {
      console.log("nodeToggleEventHandler - bDoNothing");
    } else {
      objNode.toggleOpen();
      console.log("nodeToggleEventHandler", objNode);
    }
  }

  nodeRowClicked(objNode, spanNodeZone, spanTwister) {
    console.log("nodeRowClicked", objNode);
    objNode.toggleOpen();
  }

  nodeToRow(objNode) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.classList.add("xml-name-tree-cell");
    //const nameDivContainer = document.createElement("div");
    //nameDivContainer.classList.add("xml-name-container");
    //nameCell.appendChild(nameDivContainer);
    const spanParentShift = document.createElement("span");
    if (objNode.textFillParentShift.includes("&nbsp;")) {
      spanParentShift.innerHTML = objNode.textFillParentShift;
    } else {
      spanParentShift.textContent = objNode.textFillParentShift;
    }
    const intLevel = objNode.arrParents.length;
    spanParentShift.classList.add("left-shift");
    spanParentShift.classList.add(`parent-width-${intLevel}`);
    if (objNode.previousComment) {
      const divPreviousComment = document.createElement("div");
      divPreviousComment.className = "div-previous-comment-0";
      divPreviousComment.textContent = objNode.previousComment;
      spanParentShift.append(divPreviousComment);
    }
    const divNodeZone = document.createElement("div");
    divNodeZone.className = "node-zone";
    divNodeZone.classList.add(`parent-shift-${intLevel}`);
    const spanTwister = document.createElement("span");
    spanTwister.className = "twister";
    const spanNodeText1 = document.createElement("span");
    spanNodeText1.className = "node-text1";
    divNodeZone.append(spanTwister, spanNodeText1);
    const isLeaf = !objNode.children || !objNode.children.length;
    if (isLeaf) {
      divNodeZone.classList.add("span-leaf-node");
      spanTwister.textContent = " ";
    } else {
      objNode.isOpen = true;
      divNodeZone.classList.add("node-is-open");
      divNodeZone.style.cursor = "pointer";
      divNodeZone.style.userSelect = "none";
      divNodeZone.addEventListener("click", (e) => this.nodeRowClicked(objNode, divNodeZone, spanTwister));
      spanTwister.textContent = objNode.getTwisterSymbol();
    }
    spanNodeText1.textContent = objNode.local_name; // `${objNode.local_name}`;
    spanNodeText1.title = objNode.namespace;
    const strAnnotation = objNode.annotationFromElement(this.xsdMan);
    if (strAnnotation) {
      //spanNodeText1.title = strAnnotation;
      const divAnnotationElem = document.createElement("div");
      divAnnotationElem.className = "div-annotation-elem";
      divAnnotationElem.textContent = strAnnotation;
      divNodeZone.append(divAnnotationElem);
    }
    //nameDivContainer.append(spanParentShift, spanNodeZone);
    nameCell.append(spanParentShift, divNodeZone);
    row.appendChild(nameCell);

    const valueCell = document.createElement("td");
    valueCell.className = "xml-value-td-cell";
    if (objNode.value) {
      const divNodeValue = document.createElement("div");
      divNodeValue.className = "div-node-value";
      divNodeValue.textContent = objNode.value;
      valueCell.append(divNodeValue);
    }
    if (false && objNode.previousComment) {
      const divPreviousComment = document.createElement("div");
      divPreviousComment.className = "div-previous-comment-1";
      divPreviousComment.textContent = objNode.previousComment;
      valueCell.append(divPreviousComment);
    }
    //if (objNode.local_name == "TransportMeansRegId") { debugger; }
    if (objNode.elXsdType) {
      const dictXsdParts = this.xsdMan.getParentXsdSchemas(objNode.parent);
      const dictRestrictions = this.xsdMan.getRestrictionsRecursively(objNode.elXsdType, dictXsdParts);
      if (dictRestrictions && Object.keys(dictRestrictions).length > 0) {
        const strRestrictions = Object.keys(dictRestrictions).map(key => `${key}=${dictRestrictions[key]}`).join("\n");
        const divRestrictionType = Object.assign(document.createElement("div"), { className: "div-restriction-type", textContent: strRestrictions });
        valueCell.append(divRestrictionType);
      } else {
        //console.log(objNode.elXsdType.outerHTML);
        console.log(objNode.elXsdType.lastElementChild.localName);
      }
      const strAnnotationType = this.xsdMan.getAnnotation(objNode.elXsdType);
      if (strAnnotationType) {
        const divAnnotationType = document.createElement("div");
        divAnnotationType.className = "div-annotation-type";
        divAnnotationType.textContent = strAnnotationType;
        valueCell.append(divAnnotationType);
      }
    }
    row.appendChild(valueCell);

    const prefixCell = document.createElement("td");
    prefixCell.classList.add("xml-prefix-cell");
    //const arrData = [objNode.prefix, objNode.annotationFromElement, objNode.annotationFromType]; // objNode.namespace
    const arrData = [objNode.prefix];
    for (let data of arrData) {
      if (data) {
        const divNodeValue = document.createElement("div");
        divNodeValue.className = "div-node-value";
        divNodeValue.textContent = data;
        prefixCell.append(divNodeValue);
      }
    }
    row.appendChild(prefixCell);

    const attributesCell = document.createElement("td");
    attributesCell.classList.add("xml-attr-cell");
    if (objNode.attributes) {
      const arrXmlns = objNode.attributes.filter(attr => attr.namespace == "http://www.w3.org/2000/xmlns/");
      const arrAttrNotXmlns = objNode.attributes.filter(attr => !arrXmlns.includes(attr));
      if (arrAttrNotXmlns.length) {
        attributesCell.textContent = arrAttrNotXmlns.map(attr => `${attr.name}="${attr.value}"`).join(" ");
      } else {
        attributesCell.textContent = arrXmlns.map(attr => `${attr.local_name}`).join(" ");
      }
    }
    row.appendChild(attributesCell);

    objNode.elementTableRow = row;
    return row;
  }

  appendNodeRecursively(node, tbody) {
    const row = this.nodeToRow(node);
    tbody.appendChild(row);
    if (node.children) {
      for (let child of node.children) {
        this.appendNodeRecursively(child, tbody);
      }
    }
  }

  buildTreeRecursively(objNode, parent) {
    const details = document.createElement("details");
    objNode.isOpen = true;
    details.open = objNode.isOpen;
    details.className = "xml-node-details";
    const summary = document.createElement("summary");
    summary.className = "xml-node-summary";
    if (objNode.name) {
      const elSummaruName = document.createElement("span");
      elSummaruName.className = "xml-node-name";
      elSummaruName.textContent = `${objNode.local_name}`;
      //elSummaruName.textContent = `${objNode.local_name} № ${objNode.children.length}`;
      //elSummaruName.textContent = `${objNode.local_name} 【${objNode.namespace}】`;
      const strAnnotation = objNode.annotationFromElement(this.xsdMan);
      if (strAnnotation) {
        elSummaruName.title = strAnnotation;
      } else {
        elSummaruName.title = `${objNode.namespace}`;
      }
      summary.append(elSummaruName);
    }
    if (objNode.previousComment) {
      const elPreviousComment = document.createElement("span");
      elPreviousComment.className = "previous-comment-summary";
      elPreviousComment.textContent = objNode.previousComment;
      summary.append(elPreviousComment);
    }
    const table = document.createElement("table");
    table.classList.add("xml-node-table");
    //const tbody = document.createElement("tbody");
    //table.appendChild(tbody);
    details.append(summary, table);
    for (let child of objNode.children) {
      const row = table.insertRow(); // const row = tbody.insertRow();
      if (!child.children || !child.children.length) {
        // Простые элементы - две ячейки
        const nameCell = row.insertCell();
        nameCell.classList.add("xml-name-cell");
        nameCell.textContent = child.local_name;
        const valueCell = row.insertCell();
        valueCell.classList.add("xml-value-cell");
        valueCell.textContent = child.value;
      } else {
        // Вложенные элементы - объединенная ячейка
        const cellSpan = row.insertCell();
        cellSpan.classList.add("xml-group-cell");
        cellSpan.colSpan = 2;
        this.buildTreeRecursively(child, cellSpan);
      }
    }
    parent.appendChild(details);
    details.addEventListener("toggle", (e) => this.nodeToggleEventHandler(objNode, e));
    objNode.elementDetails = details;
  }

  renderXML1(data, parent) {
    const container = document.createElement('div');
    container.className = 'xml-node';

    if (data.children) {
      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');
      summary.textContent = `${data.name}`;
      details.appendChild(summary);

      data.children.forEach(child => this.renderXML1(child, details));
      container.appendChild(details);
    } else {
      const table = document.createElement('table');
      table.innerHTML = `
            <tr>
                <td>${data.name}</td>
                <td>${data.value || 'N/A'}</td>
            </tr>
        `;
      container.appendChild(table);
    }

    parent.appendChild(container);
  }

  insertStylesInHead() {
    const style = document.createElement('style'); // Создаем элемент <style>
    // Добавляем CSS-правила (безопасно через textContent)
    style.textContent = `
      details.xml-node-details {
        margin: 0px 0px 0px 0px;
      }
      summary.xml-node-summary {
        cursor: pointer;
        background-color: #f2f2f2;
        margin: 1px 2px 3px 4px;
      }
      table.xml-node-table {
        /*border-collapse: collapse;*/
        /*border-spacing: 2px;*/
        margin: 0px 0px 6px 0px;
        width: 100%;
        background-color: #f8f8f8;
        box-shadow: 1px 1px 6px;
        /*transform: translateX(6px);*/
        position:relative;
        left: 12px;
      }
      td.xml-group-cell {
        padding: 0px 0px 0px 0px;
      }
      td.xml-name-cell {
        padding: 0px 6px 0px 6px;
        vertical-align: top;
      }
      td.xml-value-cell {
        padding: 0px 6px 0px 6px;
        width: 100%;
        box-shadow: inset 0px 0px 2px;
      }
    `;
    // Вставляем в head документа
    document.head.appendChild(style);
  }

  getTestXml(nSample) {
    const testXML_1 = `
      <data-test xmlns:p0="namespace-p0" version="1.0">
        <p0:id>id123-456-7890</p0:id>
        <person>
          <name>Тестовый пользователь 0</name>
          <age>30</age>
          <address>
            <street>Тестовая улица</street>
            <city>Тестовый город</city>
          </address>
        </person>
        <person>
          <name>Двустрочный \n пользователь &#13; проверка </name>
          <age>31</age>
          <address>
            <street>Тестовая улица 1</street>
            <city>Тестовый город 1</city>
          </address>
        </person>
      </data-test>
    `;
    const testXML_2 = `<?xml version="1.0"?>
      <!-- комментарий перед root -->
      <catalog>
          <!-- коммент bk 101 -->
          <book id="bk101">
              <author>Гамбургер, А.Б.</author>
              <title>XML для начинающих</title>
              <price>19.99</price>
          </book>
          <book id="bk102">
              <author>Рильке, Р. М.</author>
              <title>Продвинутый XML</title>
              <!-- коммент <price>29.99</price> -->
              <price>29.99</price>
          </book>
      <!-- комментарий хвоста -->
      </catalog>`;
    return testXML_2;
  }

  saveToStorage(xmlString) {
    localStorage.setItem("lastXML", xmlString);
  }

  loadFromStorage() {
    return localStorage.getItem("lastXML");
  }

} // class XMLParser_3

// agGrid.Grid














class XMLManager {
  static STORAGE_KEY = 'last-xml';

  static async loadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static convertToTree(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const root = doc.documentElement;

    return [this._parseNode(root)];
  }

  static _parseNode(node, path = '0') {
    const nodeData = {
      name: node.nodeName,
      key: path,
      children: []
    };

    // Обработка атрибутов
    if (node.attributes.length) {
      nodeData.children.push(...Array.from(node.attributes).map((attr, i) => ({
        name: `@${attr.name}`,
        value: attr.value,
        key: `${path}-attr-${i}`
      })));
    }

    // Обработка дочерних элементов
    Array.from(node.childNodes).forEach((child, index) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        nodeData.children.push(
          this._parseNode(child, `${path}-${index}`)
        );
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        nodeData.value = child.textContent.trim();
      }
    });

    return nodeData;
  }

  static saveToStorage(xml) {
    localStorage.setItem(this.STORAGE_KEY, xml);
  }

  static loadFromStorage() {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static testXml1() {
    const testXML = `<?xml version="1.0"?>
  <catalog>
      <!-- комментарий xml -->
      <book id="bk101">
          <author>Гамбургер, А.</author>
          <title>XML для начинающих</title>
          <price>19.99</price>
      </book>
      <book id="bk102">
          <author>Рильке, Р. М.</author>
          <title>Продвинутый XML</title>
          <price>29.99</price>
      </book>
  </catalog>`;
    return testXML;
  }
}
















class XMLManager_1 {
  constructor() {
    this.testXML = `<?xml version="1.0"?>
  <catalog>
      <book id="bk101">
          <author>Гамбургер, А.</author>
          <title>XML для начинающих</title>
          <price>19.99</price>
      </book>
      <book id="bk102">
          <author>Рильке, Р. М.</author>
          <title>Продвинутый XML</title>
          <price>29.99</price>
      </book>
  </catalog>`;

    this.subscribers = [];
  }

  updateXML(xml) {
    try {
      const parsed = this.parseXML(xml);
      this.notifySubscribers(parsed);
    } catch (error) {
      console.error("Ошибка парсинга XML:", error);
    }
  }

  parseXML(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");

    if (doc.documentElement.nodeName === "parsererror") {
      throw new Error("Некорректный XML");
    }

    return new XMLSerializer().serializeToString(doc);
  }

  onUpdate(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers(xml) {
    this.subscribers.forEach((cb) => cb(xml));
  }
}



























//export { XMLManager, XMLManager_1, XMLParser,  };