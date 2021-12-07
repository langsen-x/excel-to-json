# excel-to-json

基于node的excel转json解析器（可根据需求自定义解析，多用于左边为合并单元格的情况）

## 指南

### 安装

```bash
npm install @langsen-x/excel-to-json 或 yarn add @langsen-x/excel-to-json
```

### 引入

在js文件下引入下面代码，Gen为生成器，excelToJson为生成函数

```js
const {Gen, excelToJson} = require('@langsen-x/excel-to-json');
```

### 参数配置（必填项）

```
oldF: Array // 分类字段集合（从excel读取出来只有内容，用于解析为key-value形式）（左边为合并单元格，会缺失内容）
newF: Array // 新分类字段集合（从oldF中读取的key-value集合中可能需要再次提取，用于生成新的key-value集合）
--------------------
--------------------
finalF: Object // 最终生成json的字段（替换newF的所有分类字段）
eg.
    {key1: String, key2: String, ..., keyN: String, group: String}
    一个分类有几个字段就生成几个key - value, group分类字段(每个item里可以区分的唯一key)必须输入并且为某个key
--------------------
--------------------
groupJson: Array // 分类配置（按照excel表头分类）
eg.
    {objKey: Array, groupF: String, type: String, ext: Array}
    objKey被分类newF字段, groupF分类字段, type类型(value = group表示为执行分类函数, value = unique表示为执行最终合并函数), ext分类需要格外添加的字段(不做处理)
--------------------
--------------------
isOldEqNew: Boolean // 判断分类字段集合与新分类字段集合是否相等（JSON.stringify(oldF) === JSON.stringify(newF)）
input: String // 解析文件路径
output: String // 输出文件夹路径（默认值会在当前项目目录src下生成excel-to-json目录）
--------------------
--------------------
sheetConfig: Object // 带解析文件配置（根据配置解析sheet从何处开始读取内容）
eg.
    {sheetIndex: Number, headLocation: Number, startLocation: Number}
    sheetIndex表格索引(一个excel文件可能有多个sheet), headLocation表头所在索引, startLocation解析开始位置
```

### 函数（非必写项）

```
execGenOrigin() // isOldEqNew === false 生效（必写）
a. 重写根据oldF分类生成json的方法
b. 生成器默认oldF分类方法为, 两分类且isOldEqNew === true, 即使execGenOrigin有函数体也不执行
c. 重写完成需调用下列函数（手动保存json文件）
gen.setOriginJsonData(Array, isOldEqNew)
gen.saveOriginJsonData(isOldEqNew)
--------------------
--------------------
execGenHandle() // isOldEqNew === false 生效（必写）
a. 重写根据newF分类生成json的方法(isOldEqNew === true, 生成器会自动生成)
b. 重写完成需调用下列函数（手动保存json文件）
gen.setHandleJsonData(handleJsonData)
gen.saveHandleJsonData()
c. 重写方法需在execGenOrigin()内部调用
eg.
    if (!isOldEqNew) {
        gen.genHandleJson(execGenHandle, Array)
    }
```

### 使用

```js
const gen = new Gen(oldF, newF, input, sheetConfig)
gen.setFItem(finalF)
gen.setGroupConfig(groupJson)
// gen.setSaveJsonDir(output) // 自定义输出文件夹路径
// 执行
excelToJson({
    gen,
    isOldEqNew,
    execGenOrigin,
})
```

### 完整示例

左边为合并单元格的情况，分三类

```js
const path = require('path')
const {
    Gen,
    excelToJson,
    isEmpty,
} = require('excel-to-json')
const oldF = [
    'big',
    'medium',
    'small',
    'text',
    'code',
    'code2',
    'sxRiskLevel',
    'ylxRiskLevel',
    'otherCode',
]
const newF = [
    'bigCode',
    'bigText',
    'mediumCode',
    'mediumText',
    'smallCode',
    'smallText',
    'text',
    'code',
    'code2',
    'sxRiskLevel',
    'ylxRiskLevel',
    'otherCode',
]
const finalF = {
    par1: 'code',
    par2: 'text',
    group: 'code',
}
const groupJson = [
    {
        objKey: ['code', 'text'],
        groupF: 'smallCode',
        type: 'group',
        ext: ['code2', 'sxRiskLevel', 'ylxRiskLevel', 'otherCode'],
    },
    {
        objKey: ['smallCode', 'smallText'],
        groupF: 'mediumCode',
        type: 'group',
        ext: [],
    },
    {
        objKey: ['mediumCode', 'mediumText'],
        groupF: 'bigCode',
        type: 'group',
        ext: [],
    },
    {
        objKey: ['bigCode', 'bigText'],
        groupF: '',
        type: 'unique',
        ext: [],
    },
]
const isOldEqNew = JSON.stringify(oldF) === JSON.stringify(newF)
const input = path.join(__dirname, '/parse.xlsx')
const output = path.join(__dirname, '/toJson')
const sheetConfig = {
    sheetIndex: 0,
    headLocation: 1,
    startLocation: 2,
}
const gen = new Gen(oldF, newF, input, sheetConfig)
gen.setFItem(finalF)
gen.setGroupConfig(groupJson)
gen.setSaveJsonDir(output)

// 重写方法（genOriginJsonData使用），多处理newF与oldF数量不一致的情况
function execGenOrigin(rows, isSame) {
    const originJsonData = []
    const reg1 = / \r\n/g
    const reg2 = /\r\n /g
    const reg3 = /\r\n/g
    rows.forEach(row => {
        const json = {}
        for (let i = 0; i < row.length; i++) {
            if (i === 0) {
                const str = (row[i] || '').replace(reg1, '').replace(reg2, '').replace(reg3, '')
                json[oldF[i]] = str.toString()
            }
            if (i === 3) {
                json[oldF[i]] = (row[i] || '').replace(/\t/g, '').replace(/\n/g, '').toString()
            }
            if (i !== 0 && i !== 3) {
                json[oldF[i]] = (row[i] || '').toString()
            }
        }
        originJsonData.push(json)
    })
    let bigTitle = ''
    let mediumTitle = ''
    let smallTitle = ''
    originJsonData.forEach((i, idx) => {
        if (!isEmpty(i[oldF[0]])) {
            bigTitle = i[oldF[0]]
        }
        if (!isEmpty(i[oldF[1]])) {
            mediumTitle = i[oldF[1]]
        }
        if (!isEmpty(i[oldF[2]])) {
            smallTitle = i[oldF[2]]
        }
        i[oldF[0]] = bigTitle
        i[oldF[1]] = mediumTitle
        i[oldF[2]] = smallTitle
    })
    gen.setOriginJsonData(originJsonData, isOldEqNew)
    gen.saveOriginJsonData(isOldEqNew)
    if (!isSame) { // 如果不相等，必须重写
        gen.genHandleJson(execGenHandle, originJsonData)
    }
}

// 重写方法（genHandleJsonData使用）
function execGenHandle(data) {
    const handleJsonData = []
    data.forEach(i => {
        const json = {}
        // for (let j = 0; j < oldF.length; j++) { // 适用于oldF字段数量相等，字段名称不相等的情况
        //   json[newF[j]] = i[oldF[j]]
        //   json[newF[j]] = i[oldF[j]]
        //   json[newF[j]] = i[oldF[j]]
        //   json[newF[j]] = i[oldF[j]]
        // }
        // else 根据需要自行写代码
        json[newF[0]] = (i[oldF[0]] + '').replace(/[^0-9]/ig, '')
        json[newF[1]] = (i[oldF[0]] + '').replace(json[newF[0]], '')
        json[newF[2]] = (i[oldF[1]] + '').replace(/[^0-9]/ig, '')
        json[newF[3]] = (i[oldF[1]] + '').replace(json[newF[2]], '')
        json[newF[4]] = (i[oldF[2]] + '').replace(/[^0-9]/ig, '')
        json[newF[5]] = (i[oldF[2]] + '').replace(json[newF[4]], '')
        json[newF[6]] = i[oldF[3]]
        json[newF[7]] = i[oldF[4]]
        json[newF[8]] = i[oldF[5]]
        json[newF[9]] = i[oldF[6]]
        json[newF[10]] = i[oldF[7]]
        json[newF[11]] = i[oldF[8]]

        handleJsonData.push(json)
    })
    gen.setHandleJsonData(handleJsonData)
    gen.saveHandleJsonData()
}

excelToJson({
    gen,
    isOldEqNew,
    execGenOrigin,
})

```
