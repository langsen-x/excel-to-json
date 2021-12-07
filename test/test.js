const {Gen, excelToJson} = require('../lib/index.cjs.js');
let oldF = ['class1', 'class2', 'describe', 'classValue'];
let newF = ['class1', 'class2', 'describe', 'classValue'];
const finalF = {
    par1: 'text',
    // par2: 'code'
    group: 'text',
};
const groupJson = [
    {
        objKey: ['describe'],
        groupF: 'class2',
        type: 'group',
        ext: ['classValue']
    },
    {
        objKey: ['class2'],
        groupF: 'class1',
        type: 'group',
        ext: []
    },
    {
        objKey: ['class1'],
        groupF: '',
        type: 'unique',
        ext: []
    }
];
const isOldEqNew = JSON.stringify(oldF) === JSON.stringify(newF);
let gen = new Gen(oldF, newF, './test/parse.xlsx');
gen.setFItem(finalF);
gen.setGroupConfig(groupJson);
gen.setSaveJsonDir('D://MyProjects//excel-to-json//test/toJson');

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
