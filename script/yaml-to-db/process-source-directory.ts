import * as fs from 'fs';
import * as YAML from 'yaml';
import {DictEntriesFile, Szavak} from '../common/schema';
import {OrdinalsMap, WordsMap} from './model';

const startsWithNumber = /^\d/;
const startsWithNumberEndsWithYml = /^\d.*\.yml$/;
let words: WordsMap;
let ordinals: OrdinalsMap;

export function processSourceDir(srcPath: string) {
    words = {};
    ordinals = {};
    const names: string[] = fs.readdirSync(srcPath);
    names.sort();
    for(const name of names)
        if (startsWithNumber.test(name))
            processBookDir(srcPath + '/' + name);
    return words;
}

function processBookDir(bookPath: string) {
    const names: string[] = fs.readdirSync(bookPath);
    names.sort();
    for(const name of names)
        if (startsWithNumberEndsWithYml.test(name))
            processFile(bookPath + '/' + name);
}

export function processFile(fname: string) {
    console.log(fname);
    const txt = fs.readFileSync(fname);
    const entries: DictEntriesFile = YAML.parse(txt.toString());

    for(const word of entries.szavak.keys()) {
        const wordEntry = entries.szavak[word];
        normalize(wordEntry);
        if(words[wordEntry.szo]) {
            let ord = ordinals[wordEntry.szo];
            if(ord) {
                ordinals[wordEntry.szo] = ++ord;
                wordEntry.sorsz = ord;
            } else {
                words[wordEntry.szo].sorsz = 1;
                wordEntry.sorsz = ordinals[wordEntry.szo] = 2;
            }
            words[`${wordEntry.szo}÷×${wordEntry.sorsz}`] = wordEntry;
        } else {
            words[wordEntry.szo] = wordEntry;
        }
    }
}

function normalize(wordEntry: Szavak) {
    for(const ford of wordEntry.ford) {
        for(let i = 0; i < ford.ert.length; i++) {
            if(typeof ford.ert[i] === 'string') {
                ford.ert[i] = {
                    szo: ford.ert[i] as string
                }
            }
        }
    }
}
