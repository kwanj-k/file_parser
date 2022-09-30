import { workerData } from "worker_threads";

const { parentPort } = require("worker_threads");


(async function(){
    let result;
    let files = workerData.files;
    for (let i = 0; i < files.length; i++){
        const { analyzerInstance } = require("./index");
        const filePath = './docs/' + files[i];
        result = await analyzerInstance.analyze(filePath);
    }
    parentPort.postMessage(result);
}())