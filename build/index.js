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
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
let readStream = fs.createReadStream('./docs/comments-2018-01-01.txt', 'utf8');
// const file = './docs/comments-2018-01-01.txt';
// interface ResultInterface  {
//     SHORTER_THAN_15?: number,
//     MOVER_MENTIONS?: number,
//     SHAKER_MENTIONS?: number
// }
// const analyze = new Promise((resolve, reject) => {
//     let SHORTER_THAN_15 = 0;
//     let MOVER_MENTIONS = 0;
//     let SHAKER_MENTIONS = 0;
//     const rl = readline.createInterface({
//         input: fs.createReadStream(file),
//         output: process.stdout,
//         terminal: false
//     });
//     rl.on('line', (line) => {
//         if (line.length < 15){
//             SHORTER_THAN_15 ++;
//         }
//         if (line.toLowerCase().includes('mover')){
//             MOVER_MENTIONS ++;
//         }
//         if (line.toLowerCase().includes('shaker')){
//             SHAKER_MENTIONS ++;
//         }
//     });
//     rl.on('close', () => resolve({
//         SHORTER_THAN_15:SHORTER_THAN_15,
//         MOVER_MENTIONS: MOVER_MENTIONS,
//         SHAKER_MENTIONS:SHAKER_MENTIONS
//     }));
//     rl.on('error', reject)
// })
//console.log(analyze(file), 'Return')
// console.log(
//     (async function() {
//         let analysis = await analyze;
//         console.log(analysis, 'analysis');
//     }())
// )
class CommentAnalyzer {
    file;
    constructor(file = './docs/comments-2018-01-01.txt') {
        this.file = file;
    }
    analyze = new Promise((resolve, reject) => {
        let SHORTER_THAN_15 = 0;
        let MOVER_MENTIONS = 0;
        let SHAKER_MENTIONS = 0;
        console.log(this.file, 'ss')
        const rl = readline.createInterface({
            input: fs.createReadStream(this.file),
            output: process.stdout,
            terminal: false
        });
        rl.on('line', (line) => {
            if (line.length < 15) {
                SHORTER_THAN_15++;
            }
            if (line.toLowerCase().includes('mover')) {
                MOVER_MENTIONS++;
            }
            if (line.toLowerCase().includes('shaker')) {
                SHAKER_MENTIONS++;
            }
        });
        rl.on('close', () => resolve({
            SHORTER_THAN_15: SHORTER_THAN_15,
            MOVER_MENTIONS: MOVER_MENTIONS,
            SHAKER_MENTIONS: SHAKER_MENTIONS
        }));
        rl.on('error', reject);
    });
    get_analysis() {
        (async () => {
            let analysis = await this.analyze();
            return analysis;
        })();
    }
    ;
}
const file = './docs/comments-2018-01-01.txt';
const rrr = new CommentAnalyzer(file);
console.log(rrr.get_analysis());
