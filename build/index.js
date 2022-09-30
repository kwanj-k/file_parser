"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzerInstance = void 0;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const worker_threads_1 = require("worker_threads");
class ShorterThan15 {
    tallyMetric(line, total) {
        if (line.length < 15) {
            total++;
        }
        return total;
    }
}
class MoverMention {
    tallyMetric(line, total) {
        if (line.toLowerCase().includes('mover')) {
            total++;
        }
        return total;
    }
}
class ShakerMention {
    tallyMetric(line, total) {
        if (line.toLowerCase().includes('shaker')) {
            total++;
        }
        return total;
    }
}
class QuestionTally {
    tallyMetric(line, total) {
        if (line.includes('?')) {
            total++;
        }
        return total;
    }
}
class SpamTally {
    tallyMetric(line, total) {
        const urlCheck = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
        if (urlCheck.test(line)) {
            total++;
        }
        return total;
    }
}
class CommentAnalyzer {
    short;
    mover;
    shaker;
    question;
    spam;
    result = {
        SHORTER_THAN_15: 0,
        MOVER_MENTIONS: 0,
        SHAKER_MENTIONS: 0,
        QUESTIONS: 0,
        SPAM: 0
    };
    constructor(short, mover, shaker, question, spam) {
        this.short = short;
        this.mover = mover;
        this.shaker = shaker;
        this.question = question;
        this.spam = spam;
    }
    analyze = (file) => new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(file),
            output: process.stdout,
            terminal: false
        });
        rl.on('line', (line) => {
            this.result.SHORTER_THAN_15 = this.short.tallyMetric(line, this.result.SHORTER_THAN_15);
            this.result.MOVER_MENTIONS = this.mover.tallyMetric(line, this.result.MOVER_MENTIONS);
            this.result.SHAKER_MENTIONS = this.shaker.tallyMetric(line, this.result.SHAKER_MENTIONS);
            this.result.QUESTIONS = this.question.tallyMetric(line, this.result.QUESTIONS);
            this.result.SPAM = this.spam.tallyMetric(line, this.result.SPAM);
        });
        rl.on('close', () => resolve(this.result));
        rl.on('error', reject);
    });
    readdir = (dirname) => {
        return new Promise((resolve, reject) => {
            fs.readdir(dirname, (error, filenames) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(filenames);
                }
            });
        });
    };
    chunks = function (a, size) {
        let arrays = [];
        for (let i = 0; i < a.length; i += size)
            arrays.push(a.slice(i, i + size));
        return arrays;
    };
}
exports.analyzerInstance = new CommentAnalyzer(new ShorterThan15(), new MoverMention(), new ShakerMention(), new QuestionTally, new SpamTally);
const THREAD_COUNT = 4;
function createWorker(files) {
    return new Promise(function (resolve, reject) {
        const worker = new worker_threads_1.Worker("./build/worker.js", {
            workerData: {
                thread_count: THREAD_COUNT,
                path: './src/worker.ts',
                files: files
            },
        });
        worker.on("message", (data) => {
            resolve(data);
            worker.terminate();
        });
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`);
            worker.terminate();
        });
    });
}
(async function () {
    let files;
    let chunks;
    let workerPromises = [];
    const threads = 4;
    files = await exports.analyzerInstance.readdir('./docs');
    const chunkSize = Math.ceil(files.length / threads);
    chunks = exports.analyzerInstance.chunks(files, chunkSize);
    for (let i = 0; i < chunks.length; i++) {
        workerPromises.push(createWorker(chunks[i]));
    }
    const thread_results = await Promise.all(workerPromises);
    let total = {
        SHORTER_THAN_15: 0,
        MOVER_MENTIONS: 0,
        SHAKER_MENTIONS: 0,
        QUESTIONS: 0,
        SPAM: 0
    };
    for (let i = 0; i < thread_results.length; i++) {
        total.SHORTER_THAN_15 += thread_results[i].SHORTER_THAN_15;
        total.MOVER_MENTIONS += thread_results[i].MOVER_MENTIONS;
        total.SHAKER_MENTIONS += thread_results[i].SHAKER_MENTIONS;
        total.QUESTIONS += thread_results[i].QUESTIONS;
        total.SPAM += thread_results[i].SPAM;
    }
    exports.analyzerInstance.result = total;
    console.log(exports.analyzerInstance.result, 'result');
}());
