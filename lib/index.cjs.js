"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const path=require("path"),fs=require("fs"),xlsx=require("node-xlsx");function _createTypeOf(t){return function(s){return Object.prototype.toString.call(s)==="[object "+t+"]"}}function isEmpty(s){const t=_createTypeOf("String");for(var e in s=t(s)?s.trim():s)return!1;return!0}function isEmptyFunction(s){if("function"!=typeof s)return!0;let t=s.toString().replace(/\s+/g,"");return t=t.match(/{.*}/g)[0],"{}"===t}class Field{constructor(s,t){this.oldF=s,this.newF=t}getOldF(){return this.oldF}setOldF(s){this.oldF=s}getNewF(){return this.newF}setNewF(s){this.newF=s}}class Json extends Field{constructor(s,t,e,n={sheetIndex:1,headLocation:1,startLocation:2}){super(s,t),this.originJsonData=[],this.handleJsonData=[],this.saveJsonDir=path.join(process.cwd(),"/src/excel-to-json"),this.saveOriginPath=path.join(this.saveJsonDir,"/originJsonData.json"),this.saveHandlePath=path.join(this.saveJsonDir,"/handleJsonData.json"),this.rows=Json.sheetRows(e,n)}static sheetRows(s,t){const e=xlsx.parse(s)[t.sheetIndex].data;s=e.length;return e.slice(t.startLocation,s)}getRows(){return this.rows}getOriginJsonData(){return this.originJsonData}getHandleJsonData(){return this.handleJsonData}setOriginJsonData(s,t){this.originJsonData=s,t&&(this.handleJsonData=s)}setHandleJsonData(s){this.handleJsonData=s}setSaveJsonDir(s){this.saveJsonDir=s,this.saveOriginPath=path.join(s,"/originJsonData.json"),this.saveHandlePath=path.join(s,"/handleJsonData.json")}genOriginJsonData(s,t){console.log("load parent method genOriginJsonData!"),s.forEach(t=>{let e={};for(let s=0;s<t.length;s++)e[this.oldF[s]]=(t[s]||"").toString();this.originJsonData.push(e)});let e="",n="";this.originJsonData.forEach(s=>{isEmpty(s[this.oldF[0]])||(e=s[this.oldF[0]]),isEmpty(s[this.oldF[1]])||(n=s[this.oldF[1]]),s[this.oldF[0]]=e,s[this.oldF[1]]=n}),this.saveOriginJsonData(t)}genHandleJsonData(){console.log("load parent method genHandleJsonData!")}saveOriginJsonData(t){fs.existsSync(this.saveJsonDir)?(console.log("saveJsonDir is exist!"),fs.readdirSync(this.saveJsonDir).forEach(s=>{fs.unlinkSync(this.saveJsonDir+"/"+s)})):(console.log("saveJsonDir is not exist!"),fs.mkdirSync(this.saveJsonDir)),fs.access(this.saveOriginPath,fs.constants.F_OK,s=>{s||(console.log("have file, delete originJsonData!"),fs.unlinkSync(this.saveOriginPath)),fs.writeFile(this.saveOriginPath,JSON.stringify(this.originJsonData),s=>{s?(console.log("save originJsonData fail!"),console.log("saveOriginJsonData err:",s)):console.log("save originJsonData success!")}),t&&(this.setHandleJsonData(this.originJsonData),this.saveHandleJsonData())})}saveHandleJsonData(){fs.access(this.saveHandlePath,fs.constants.F_OK,s=>{s||(console.log("have file, delete handleJsonData!"),fs.unlinkSync(this.saveHandlePath)),fs.writeFile(this.saveHandlePath,JSON.stringify(this.handleJsonData),s=>{s?(console.log("save handleJsonData fail!"),console.log("saveHandleJsonData err:",s)):console.log("save handleJsonData success!")})})}}class Gen extends Json{constructor(){super(...arguments),this.fItem={},this.groupConfig=[]}genJson(s,t,e){isEmptyFunction(s)?super.genOriginJsonData(t,e):s(t,e)}genHandleJson(s,t){if(isEmptyFunction(s))throw Error("reload method genHandleJsonData is Empty");s(t),super.genHandleJsonData()}saveOriginJsonData(s){super.saveOriginJsonData(s)}saveHandleJsonData(){super.saveHandleJsonData(),this.getFinalJson(this.fItem,this.groupConfig)}setFItem(s){this.fItem=s}setGroupConfig(s){this.groupConfig=s}getFinalJson(l,s){if(isEmpty(l))throw Error("finalF is empty");if(!l.group||1===Object.keys(l).length)throw Error("finalF contains key group and finalF need other key");if(isEmpty(s))throw Error("groupJson is empty");const o={fullObj:function(e){let n={};return Object.keys(l).forEach((s,t)=>{"group"!==s&&(n[l[s]]=e[t])}),n}},h={},a=[];function c(s,n,o=[]){let a=new Map;return s.forEach(t=>{let e={};Object.keys(l).forEach(s=>{"group"!==s&&(e[l[s]]=t[n[l[s]]])}),0!==o.length&&o.forEach(s=>{e[s]=t[s]}),a.has(e[l.group])||a.set(e[l.group],e)}),[...a.values()]}function g(s,t){fs.writeFile(s,JSON.stringify(t),s=>{s&&console.log("writeJson err:",s)})}s.forEach(s=>{let t;var e=o.fullObj.call(o,s.objKey),n=s.ext;"group"===s.type?t=function(t,e,n,o){let a=[];return new Promise(s=>{a=function(s,e,t={},n=[]){const o={};s.forEach(s=>{var t=e(s);o[t]=o[t]||[],o[t].push(s)});let a=[];for(var[i,r]of Object.entries(o))r=c(r,t,n),a.push([i,r]);return Object.fromEntries(a)}(t,s=>s[e],n,o),s(a)}).catch(s=>{console.log("getGroup err:",s)})}(this.handleJsonData,s.groupF,e,n):"unique"===s.type&&(t=c(this.handleJsonData,e)),a.push(t)}),Promise.all(a).then(r=>{r.forEach((s,t)=>{if(0===t)h[t]=Object.assign({},s),g(path.join(this.saveJsonDir,`/group${t+1}.json`),s);else if(0!==t&&t!==r.length-1){const o=[],a=h[t-1];for(var[e,n]of Object.entries(Object.assign({},s)))Array.isArray(n)&&(n.map(s=>{s.children=a[s[l.group]]}),o.push([e,n]));h[t]=o,g(path.join(this.saveJsonDir,`/group${t+1}.json`),Object.fromEntries(o))}else{const i=[].concat(s);i.map(s=>{s.children=Object.fromEntries(h[t-1])[s[l.group]]}),g(path.join(this.saveJsonDir,"/gen.json"),i)}})}).catch(s=>{console.log("Promise.all err:",s)})}}function excelToJson(s){const{gen:t,isOldEqNew:e,execGenOrigin:n}=s;try{e?t.genJson(null,t.getRows(),e):t.genJson(n,t.getRows(),e)}catch(s){console.log("excelToJson e:",s)}}exports.Gen=Gen,exports.excelToJson=excelToJson,exports.isEmpty=isEmpty,exports.isEmptyFunction=isEmptyFunction;