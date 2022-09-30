"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const { parentPort } = require("worker_threads");
(async function () {
    let result;
    let files = worker_threads_1.workerData.files;
    for (let i = 0; i < files.length; i++) {
        const { analyzerInstance } = require("./index");
        const filePath = './docs/' + files[i];
        result = await analyzerInstance.analyze(filePath);
    }
    parentPort.postMessage(result);
}());
