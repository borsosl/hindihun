
import * as cli from 'command-line-args';
import * as fs from "fs";
import {processKtrans} from './process-ktrans-text';
import {processUnicode} from './process-unicode-text';

interface Options {
    reverse: boolean,
    input: string
}

const opt: Options = cli([
    { name: 'reverse', alias: 'r', type: Boolean },
    { name: 'input', type: String, defaultOption: true }
]);

const txt = fs.readFileSync(opt.input).toString();
process.stdout.write(Buffer.from(
    opt.reverse ? processUnicode(txt) : processKtrans(txt)));
