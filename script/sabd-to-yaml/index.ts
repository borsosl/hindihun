import * as cli from 'command-line-args';
import * as fs from "fs";
import {sabdToYaml} from './sabd-to-yaml';

interface Options {
    input: string
}

const opt: Options = cli([
    { name: 'input', type: String, defaultOption: true }
]);

const txt = fs.readFileSync(opt.input).toString();
process.stdout.write(Buffer.from(sabdToYaml(txt)));
