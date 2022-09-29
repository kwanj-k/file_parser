import * as fs from 'fs';
import * as readline from 'readline';


interface ResultInterface {
    SHORTER_THAN_15: number,
    MOVER_MENTIONS: number,
    SHAKER_MENTIONS: number
}

interface HasMetricInterface {
    tallyMetric(line: string, total: number): void 
}

class ShorterThan15 implements HasMetricInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.length < 15){
            total ++;
        }
        return total
    }
}

class MoverMention implements HasMetricInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.toLowerCase().includes('mover')){
            total ++;
        }
        return total
    }
}

class ShakerMention implements HasMetricInterface {

    public tallyMetric(line: string, total: number): number {
        if (line.toLowerCase().includes('shaker')){
            total ++;
        }
        return total
    }
}


class CommentAnalyzer {
    public short: ShorterThan15;
    public mover: MoverMention;
    public shaker: ShakerMention;
    public result: ResultInterface = {
        SHORTER_THAN_15: 0,
        MOVER_MENTIONS: 0,
        SHAKER_MENTIONS: 0
    }

    constructor (short: ShorterThan15, mover: MoverMention, shaker: ShakerMention){
        this.short = short
        this.mover = mover
        this.shaker = shaker
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


}
const analyzerInstance = new CommentAnalyzer(new ShorterThan15(), new MoverMention(), new ShakerMention());
(async function() {
    let files : any;
    let result;
    files = await analyzerInstance.readdir('./docs')
    for (let i = 0; i < files.length; i++){
        let currFilePath = './docs/' + files[i];
        result = await analyzerInstance.analyze(currFilePath);
        console.log(1, result)
    }
    console.log(result, 'resr')
    return result;
}());


