declare function isEmpty(obj: any): boolean;
declare function isEmptyFunction(func: any): boolean;
declare class Field {
    oldF: Array<string>;
    newF: Array<string>;
    constructor(oldF: Array<string>, newF: Array<string>);
    getOldF(): string[];
    setOldF(fields: Array<string>): void;
    getNewF(): string[];
    setNewF(fields: Array<string>): void;
}
declare class Json extends Field {
    originJsonData: Array<any>;
    handleJsonData: Array<any>;
    saveJsonDir: string;
    protected saveOriginPath: string;
    protected saveHandlePath: string;
    private readonly rows;
    constructor(oldF: Array<string>, newF: Array<string>, excelPath: string, sheetConfig?: object);
    private static sheetRows;
    getRows(): any[];
    getOriginJsonData(): any[];
    getHandleJsonData(): any[];
    setOriginJsonData(data: Array<any>, isSame: boolean): void;
    setHandleJsonData(data: Array<any>): void;
    setSaveJsonDir(dir: string): void;
    /**
     * @author: langsen-x
     * @description: 返回初始化的处理的json
     * @param: null
     * @return: Array
     * @date: 2021/12/6 10:10
     */
    protected genOriginJsonData(rows: Array<any>, isSame: boolean): void;
    /**
     * @author: langsen-x
     * @description: 返回处理后的json并保存为json文件（等待下一步处理）
     * @param: Array
     * @return: Array
     * @date: 2021/12/6 10:12
     */
    protected genHandleJsonData(): void;
    /**
     * @author: langsen-x
     * @description: 返回处理后的json并保存为json文件（等待下一步处理）
     * @param: Array
     * @return: Array
     * @date: 2021/12/6 10:12
     */
    protected saveOriginJsonData(isSame: boolean): void;
    protected saveHandleJsonData(): void;
}
declare class Gen extends Json {
    fItem: any;
    groupConfig: Array<any>;
    protected genJson(fn: any, rows: Array<any>, isSame: boolean): void;
    protected genHandleJson(fn: any, originData: Array<any>): void;
    saveOriginJsonData(isSame: boolean): void;
    saveHandleJsonData(): void;
    setFItem(finalF: any): void;
    setGroupConfig(groupJson: Array<any>): void;
    private getFinalJson;
}
declare function excelToJson(config: {
    gen: any;
    isOldEqNew: boolean;
    execGenOrigin: any;
}): void;
export { Gen, excelToJson, isEmpty, isEmptyFunction };
