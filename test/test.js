const {Gen, excelToJson} = require('../lib/index.cjs.js');
const {randomUUID} = require("crypto");
let oldF = ['type', 'project', 'num', 'A', 'B', 'C', 'D', 'E', 'F', 'answer', 'describe', 'level', 'score'];
let newF = ['type', 'project', 'num', 'A', 'B', 'C', 'D', 'E', 'F', 'answer', 'describe', 'level', 'score'];
const finalF = {
    par1: 'label',
    // par2: 'code'
    group: 'label',
};
const groupJson = [
    // {
    //     objKey: ['describe'],
    //     groupF: 'class2',
    //     type: 'group',
    //     ext: ['classValue']
    // },
    {
        objKey: ['project'],
        groupF: 'type',
        type: 'group',
        ext: ['num', 'A', 'B', 'C', 'D', 'E', 'F', 'answer', 'describe', 'level', 'score']
    },
    {
        objKey: ['type'],
        groupF: '',
        type: 'unique',
        ext: []
    }
];
const isOldEqNew = JSON.stringify(oldF) === JSON.stringify(newF);
// const isOldEqNew = false;
let gen = new Gen(oldF, newF, 'D://MyProjects//excel-to-json//test//附件3：2023年全警实战大练兵理论题（解析版）.xls', {
    sheetIndex: 0,
    headLocation: 1,
    startLocation: 2
});
gen.setFItem(finalF);
gen.setGroupConfig(groupJson);
gen.setSaveJsonDir('D://MyProjects//excel-to-json//test/2023年全警实战大练兵理论题Json');

// 重写方法（genOriginJsonData使用），多处理newF与oldF数量不一致的情况
function execGenOrigin(rows, isSame) {
    let originJsonData = [];
    const reg1 = / \r\n/g;
    const reg2 = /\r\n /g;
    const reg3 = /\r\n/g;
    rows.forEach(row => {
        let json = {};
        for (let i = 0; i < row.length; i++) {
            if (i === 0) {
                let str = (row[i] || '').replace(reg1, '').replace(reg2, '').replace(reg3, '');
                json[oldF[i]] = str.toString();
            } else {
                json[oldF[i]] = (row[i] || '').toString();
            }
        }
        // json.value = randomUUID().replace(/-/g, '')
        // json.status = '0'
        originJsonData.push(json);
    });
    if (!isSame) { // 如果不相等，必须重写
        gen.genHandleJson(execGenHandle, originJsonData);
    }
}

// 重写方法（genHandleJsonData使用）
function execGenHandle(data) {
    let handleJsonData = [];
    data.forEach(i => {
        let json = {};
        for (let j = 0; j < oldF.length; j++) { // 适用于oldF字段数量相等，字段名称不相等的情况
            json[newF[j]] = i[oldF[j]];
            json[newF[j]] = i[oldF[j]];
            json[newF[j]] = i[oldF[j]];
            json[newF[j]] = i[oldF[j]];
        }
        // else其他情况根据需要自行写代码
        handleJsonData.push(json);
    });
    gen.setHandleJsonData(handleJsonData);
    gen.saveHandleJsonData();
}

excelToJson({gen, isOldEqNew, execGenOrigin});
