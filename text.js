const textData = require('./test/2023年全警实战大练兵理论题Json/gen.json')
const fs = require("fs");

let allText = ''
textData.forEach(item => {
    allText += item.label + '\n'
    item.children.forEach((c, i) => {
        if (item.label === '判断题') {
            allText += (i + 1).toString() + '. ' + c.label + ' ' + (c.answer === 'A' ? '√' : '×') + '\n'
        } else {
            allText += (i + 1).toString() + '. ' + c.label + '\n'
        }
        // allText += '选项个数：' + c.num + '\n'
        if (item.label !== '判断题') {
            if (!!c.A.trim()) {
                allText += 'A：' + c.A + '\n'
            }
            if (!!c.B.trim()) {
                allText += 'B：' + c.B + '\n'
            }
            if (!!c.C.trim()) {
                allText += 'C：' + c.C + '\n'
            }
            if (!!c.D.trim()) {
                allText += 'D：' + c.D + '\n'
            }
            if (!!c.E.trim()) {
                allText += 'E：' + c.E + '\n'
            }
            if (!!c.F.trim()) {
                allText += 'F：' + c.F + '\n'
            }
        }
        if (item.label !== '判断题') {
            allText += '答案：' + c.answer + '\n'
        }
        // allText += '解析：' + c.describe + '\n'
        // allText += '难度：' + c.level + '\n'
        // allText += '分数：' + (c.score || '') + '\n\n'
        allText += '\n'
    })
    allText += '\n\n'
})
console.log({allText})
fs.writeFile('./allText.txt', allText, function (err) {
    if (err) {
        console.log(err)
    }
})
