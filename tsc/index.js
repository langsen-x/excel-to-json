"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyFunction = exports.isEmpty = exports.excelToJson = exports.Gen = void 0;
const path = require('path');
const fs = require('fs');
const xlsx = require('node-xlsx');
function _createTypeOf(type) {
    return function (obj) {
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    };
}
function isEmpty(obj) {
    const isString = _createTypeOf('String');
    if (isString(obj)) {
        obj = obj.trim();
    }
    // @ts-ignore
    for (let key in obj) {
        return false;
    }
    return true;
}
exports.isEmpty = isEmpty;
function isEmptyFunction(func) {
    if (typeof func != 'function') {
        return true;
    }
    let str = func.toString().replace(/\s+/g, '');
    str = str.match(/{.*}/g)[0];
    return str === '{}';
}
exports.isEmptyFunction = isEmptyFunction;
class Field {
    constructor(oldF, newF) {
        this.oldF = oldF;
        this.newF = newF;
    }
    getOldF() {
        return this.oldF;
    }
    setOldF(fields) {
        this.oldF = fields;
    }
    getNewF() {
        return this.newF;
    }
    setNewF(fields) {
        this.newF = fields;
    }
}
class Json extends Field {
    constructor(oldF, newF, excelPath, sheetConfig = {
        sheetIndex: 1,
        headLocation: 1,
        startLocation: 2
    }) {
        super(oldF, newF);
        this.originJsonData = [];
        this.handleJsonData = [];
        this.saveJsonDir = path.join(process.cwd(), '/src/excel-to-json');
        this.saveOriginPath = path.join(this.saveJsonDir, '/originJsonData.json');
        this.saveHandlePath = path.join(this.saveJsonDir, '/handleJsonData.json');
        this.rows = Json.sheetRows(excelPath, sheetConfig);
    }
    static sheetRows(path, config) {
        const sheets = xlsx.parse(path);
        const sheet = sheets[config.sheetIndex]; // 单张表格
        const rows = sheet.data; // 所有数据行（一行行读取）
        const rowsLength = rows.length;
        return rows.slice(config.startLocation, rowsLength);
    }
    getRows() {
        return this.rows;
    }
    getOriginJsonData() {
        return this.originJsonData;
    }
    getHandleJsonData() {
        return this.handleJsonData;
    }
    setOriginJsonData(data, isSame) {
        this.originJsonData = data;
        if (isSame) {
            this.handleJsonData = data;
        }
    }
    setHandleJsonData(data) {
        this.handleJsonData = data;
    }
    setSaveJsonDir(dir) {
        this.saveJsonDir = dir;
        this.saveOriginPath = path.join(dir, '/originJsonData.json');
        this.saveHandlePath = path.join(dir, '/handleJsonData.json');
    }
    /**
     * @author: langsen-x
     * @description: 返回初始化的处理的json
     * @param: null
     * @return: Array
     * @date: 2021/12/6 10:10
     */
    genOriginJsonData(rows, isSame) {
        console.log('load parent method genOriginJsonData!');
        // 不需对数据做操作
        rows.forEach(row => {
            let json = {};
            for (let i = 0; i < row.length; i++) {
                json[this.oldF[i]] = (row[i] || '').toString();
            }
            this.originJsonData.push(json);
        });
        let class1Text = '';
        let class2Text = '';
        this.originJsonData.forEach((i) => {
            if (!isEmpty(i[this.oldF[0]])) {
                class1Text = i[this.oldF[0]];
            }
            if (!isEmpty(i[this.oldF[1]])) {
                class2Text = i[this.oldF[1]];
            }
            i[this.oldF[0]] = class1Text;
            i[this.oldF[1]] = class2Text;
        });
        this.saveOriginJsonData(isSame);
    }
    /**
     * @author: langsen-x
     * @description: 返回处理后的json并保存为json文件（等待下一步处理）
     * @param: Array
     * @return: Array
     * @date: 2021/12/6 10:12
     */
    genHandleJsonData() {
        console.log('load parent method genHandleJsonData!');
    }
    /**
     * @author: langsen-x
     * @description: 返回处理后的json并保存为json文件（等待下一步处理）
     * @param: Array
     * @return: Array
     * @date: 2021/12/6 10:12
     */
    saveOriginJsonData(isSame) {
        let savePath = fs.existsSync(this.saveJsonDir);
        if (savePath) {
            console.log('saveJsonDir is exist!');
            fs.readdirSync(this.saveJsonDir).forEach((fileName) => {
                fs.unlinkSync(this.saveJsonDir + '/' + fileName);
            });
        }
        else {
            console.log('saveJsonDir is not exist!');
            fs.mkdirSync(this.saveJsonDir);
        }
        fs.access(this.saveOriginPath, fs.constants.F_OK, (err) => {
            if (!err) {
                // 删除再保存
                console.log('have file, delete originJsonData!');
                fs.unlinkSync(this.saveOriginPath);
            }
            fs.writeFile(this.saveOriginPath, JSON.stringify(this.originJsonData), (err) => {
                if (err) {
                    console.log('save originJsonData fail!');
                    console.log('saveOriginJsonData err:', err);
                }
                else {
                    console.log('save originJsonData success!');
                }
            });
            if (isSame) {
                this.setHandleJsonData(this.originJsonData);
                this.saveHandleJsonData();
            }
        });
    }
    saveHandleJsonData() {
        fs.access(this.saveHandlePath, fs.constants.F_OK, (err) => {
            if (!err) {
                // 删除再保存
                console.log('have file, delete handleJsonData!');
                fs.unlinkSync(this.saveHandlePath);
            }
            fs.writeFile(this.saveHandlePath, JSON.stringify(this.handleJsonData), (err) => {
                if (err) {
                    console.log('save handleJsonData fail!');
                    console.log('saveHandleJsonData err:', err);
                }
                else {
                    console.log('save handleJsonData success!');
                }
            });
        });
    }
}
class Gen extends Json {
    constructor() {
        super(...arguments);
        this.fItem = {};
        this.groupConfig = [];
    }
    genJson(fn, rows, isSame) {
        if (!isEmptyFunction(fn)) { // 重写方法不为空
            fn(rows, isSame);
        }
        else {
            super.genOriginJsonData(rows, isSame);
        }
    }
    genHandleJson(fn, originData) {
        if (isEmptyFunction(fn)) { // 重写方法为空
            throw Error('reload method genHandleJsonData is Empty');
        }
        else {
            fn(originData);
            super.genHandleJsonData();
        }
    }
    saveOriginJsonData(isSame) {
        super.saveOriginJsonData(isSame);
    }
    saveHandleJsonData() {
        super.saveHandleJsonData();
        this.getFinalJson(this.fItem, this.groupConfig);
    }
    setFItem(finalF) {
        this.fItem = finalF;
    }
    setGroupConfig(groupJson) {
        this.groupConfig = groupJson;
    }
    getFinalJson(finalF, groupJson) {
        if (isEmpty(finalF)) {
            throw Error('finalF is empty');
        }
        else {
            if (!finalF['group'] || Object.keys(finalF).length === 1) {
                throw Error('finalF contains key group and finalF need other key');
            }
        }
        if (isEmpty(groupJson)) {
            throw Error('groupJson is empty');
        }
        const obj = {
            fullObj: function (args) {
                let item = {};
                Object.keys(finalF).forEach((key, idx) => {
                    if (key !== 'group') {
                        item[finalF[key]] = args[idx];
                    }
                });
                return item;
            }
        };
        const groupObj = {};
        const promises = [];
        groupJson.forEach(group => {
            let p;
            const pF = obj.fullObj.call(obj, group.objKey);
            const pF_ext = group.ext;
            if (group.type === 'group') {
                p = getGroup(this.handleJsonData, group.groupF, pF, pF_ext);
            }
            else if (group.type === 'unique') {
                p = unique(this.handleJsonData, pF);
            }
            promises.push(p);
        });
        Promise.all(promises).then(results => {
            results.forEach((res, idx) => {
                if (idx === 0) {
                    groupObj[idx] = Object.assign({}, res);
                    writeJson(path.join(this.saveJsonDir, `/group${idx + 1}.json`), res);
                }
                else if (idx !== 0 && idx !== results.length - 1) {
                    const tempGroup = [];
                    for (let [key, value] of Object.entries(Object.assign({}, res))) {
                        if (Array.isArray(value)) {
                            value.map((v) => {
                                if (idx === 1) {
                                    v.children = groupObj[idx - 1][v[finalF['group']]];
                                }
                                else {
                                    v.children = Object.fromEntries(groupObj[idx - 1])[v[finalF['group']]];
                                }
                            });
                            tempGroup.push([key, value]);
                        }
                    }
                    groupObj[idx] = tempGroup;
                    writeJson(path.join(this.saveJsonDir, `/group${idx + 1}.json`), Object.fromEntries(tempGroup));
                }
                else {
                    const final = [].concat(res);
                    final.map((f) => {
                        f.children = Object.fromEntries(groupObj[idx - 1])[f[finalF['group']]];
                    });
                    writeJson(path.join(this.saveJsonDir, `/gen.json`), final);
                }
            });
        }).catch(err => {
            console.log('Promise.all err:', err);
        });
        function getGroup(list, groupF, handleFields, extFields) {
            let group = [];
            return new Promise((resolve) => {
                group = groupBy(list, (attr) => {
                    return attr[groupF];
                }, handleFields, extFields);
                resolve(group);
            }).catch(e => {
                console.log('getGroup err:', e);
            });
        }
        function groupBy(list, fn, handleFields = {}, extFields = []) {
            const groups = {};
            list.forEach((item) => {
                const group = fn(item);
                groups[group] = groups[group] || [];
                groups[group].push(item);
            });
            let newArr = [];
            for (let [key, value] of Object.entries(groups)) {
                value = unique(value, handleFields, extFields);
                newArr.push([key, value]);
            }
            return Object.fromEntries(newArr);
        }
        // 数组对象去重
        function unique(list, obj, extFields = []) {
            let map = new Map();
            list.forEach((item) => {
                let newItem = {}; // 处理原字段
                Object.keys(finalF).forEach((key) => {
                    if (key !== 'group') {
                        newItem[finalF[key]] = item[obj[finalF[key]]];
                    }
                });
                if (extFields.length !== 0) {
                    extFields.forEach(key => {
                        newItem[key] = item[key];
                    });
                }
                if (!map.has(newItem[finalF['group']])) {
                    map.set(newItem[finalF['group']], newItem);
                }
            });
            return [...map.values()];
        }
        function writeJson(path, data) {
            fs.writeFile(path, JSON.stringify(data), (err) => {
                if (err) {
                    console.log('writeJson err:', err);
                }
            });
        }
    }
}
exports.Gen = Gen;
function excelToJson(config) {
    const { gen, isOldEqNew, execGenOrigin } = config;
    try {
        if (isOldEqNew) {
            gen.genJson(null, gen.getRows(), isOldEqNew);
        }
        else {
            gen.genJson(execGenOrigin, gen.getRows(), isOldEqNew);
        }
    }
    catch (e) {
        console.log('excelToJson e:', e);
    }
}
exports.excelToJson = excelToJson;
