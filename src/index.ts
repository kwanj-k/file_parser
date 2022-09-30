import * as fs from 'fs';
import * as readline from 'readline';
import { Worker } from 'worker_threads';


interface ResultInterface {
    SHORTER_THAN_15: number,
    MOVER_MENTIONS: number,
    SHAKER_MENTIONS: number,
    QUESTIONS: number,
    SPAM: number
}

interface MetricTallyInterface {
    tallyMetric(line: string, total: number): void 
}

class ShorterThan15 implements MetricTallyInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.length < 15){
            total ++;
        }
        return total
    }
}

class MoverMention implements MetricTallyInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.toLowerCase().includes('mover')){
            total ++;
        }
        return total
    }
}

class ShakerMention implements MetricTallyInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.toLowerCase().includes('shaker')){
            total ++;
        }
        return total
    }
}

class QuestionTally implements MetricTallyInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.includes('?')){
            total ++;
        }
        return total
    }
}

class SpamTally implements MetricTallyInterface {

    public tallyMetric(line: string, total: number): number {
        const urlCheck = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
        if(urlCheck.test(line)) {
            total ++;
        }
        return total
    }
}


class CommentAnalyzer {
    public short: ShorterThan15;
    public mover: MoverMention;
    public shaker: ShakerMention;
    public question: QuestionTally;
    public spam: SpamTally;
    public result: ResultInterface = {
        SHORTER_THAN_15: 0,
        MOVER_MENTIONS: 0,
        SHAKER_MENTIONS: 0,
        QUESTIONS: 0,
        SPAM: 0
    }

    constructor (
        short: ShorterThan15,
        mover: MoverMention,
        shaker: ShakerMention,
        question: QuestionTally,
        spam: SpamTally
    ){
        this.short = short
        this.mover = mover
        this.shaker = shaker
        this.question = question
        this.spam = spam
    }

    analyze = (file: string) => new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(file),
            output: process.stdout,
            terminal: false
        });
        rl.on('line', (line) => {
            this.result.SHORTER_THAN_15 = this.short.tallyMetric(line, this.result.SHORTER_THAN_15)
            this.result.MOVER_MENTIONS = this.mover.tallyMetric(line, this.result.MOVER_MENTIONS)
            this.result.SHAKER_MENTIONS = this.shaker.tallyMetric(line, this.result.SHAKER_MENTIONS)
            this.result.QUESTIONS = this.question.tallyMetric(line, this.result.QUESTIONS)
            this.result.SPAM = this.spam.tallyMetric(line, this.result.SPAM)
        });
        rl.on('close', () => resolve(this.result));
        rl.on('error', reject)
    })

    readdir = (dirname: string) => {
        return new Promise((resolve, reject) => {
          fs.readdir(dirname, (error, filenames) => {
            if (error) {
              reject(error);
            } else {
              resolve(filenames);
            }
          });
        });
    };

    chunks = function(a: any, size: number) {
        let arrays: string[] = []
        for (let i = 0; i < a.length; i += size)
            arrays.push(
                a.slice(i, i + size)
            );
        return arrays
      };
      

}
export const analyzerInstance = new CommentAnalyzer(
    new ShorterThan15(),
    new MoverMention(),
    new ShakerMention(),
    new QuestionTally,
    new SpamTally
);
const THREAD_COUNT = 4;

function createWorker(files: string[]) {
    return new Promise(function (resolve, reject) {
      const worker = new Worker("./build/worker.js", {
        workerData: { 
            thread_count: THREAD_COUNT,
            path: './src/worker.ts',
            files: files
        },
      });
      worker.on("message", (data) => {
        resolve(data);
        worker.terminate()
      });
      worker.on("error", (msg) => {
        reject(`An error ocurred: ${msg}`);
        worker.terminate()
      });
    });
  }


(async function() {
    let files: any;
    let chunks: any;
    let workerPromises: any = [];
    const threads = 4;
    files = await analyzerInstance.readdir('./docs')
    const chunkSize = Math.ceil(files.length / threads);
    chunks = analyzerInstance.chunks(files, chunkSize)
    for (let i = 0; i < chunks.length; i ++){
        workerPromises.push(createWorker(chunks[i]));
    }
    const thread_results = await Promise.all(workerPromises);
    let total = {
        SHORTER_THAN_15: 0,
        MOVER_MENTIONS: 0,
        SHAKER_MENTIONS: 0,
        QUESTIONS: 0,
        SPAM: 0
    }
    for (let i = 0; i < thread_results.length; i ++){
        total.SHORTER_THAN_15 += thread_results[i].SHORTER_THAN_15
        total.MOVER_MENTIONS += thread_results[i].MOVER_MENTIONS
        total.SHAKER_MENTIONS += thread_results[i].SHAKER_MENTIONS
        total.QUESTIONS += thread_results[i].QUESTIONS
        total.SPAM += thread_results[i].SPAM
    }
    analyzerInstance.result = total
    console.log(analyzerInstance.result)
}());