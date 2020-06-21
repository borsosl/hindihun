import * as fs from 'fs';
import * as YAML from 'yaml';
import {DictEntriesFile, Szavak} from '../common/schema';
import {OrdinalsMap, SourceFileMap, WordsMap} from './model';
import {analyze} from './analyze';

const startsWithNumber = /^\d/;
const startsWithNumberEndsWithYml = /^\d.*\.yml$/;
let words: WordsMap;
let ordinals: OrdinalsMap;
let sourceFiles: SourceFileMap;

export function processSourceDir(srcPath: string, analyzePath: string) {
    words = {};
    ordinals = {};
    sourceFiles = {};
    const names: string[] = fs.readdirSync(srcPath);
    names.sort();
    for(const name of names)
        if(startsWithNumber.test(name))
            if(processBookDir(srcPath + '/' + name, analyzePath))
                break;
    return words;
}

function processBookDir(bookPath: string, analyzePath: string) {
    const names: string[] = fs.readdirSync(bookPath);
    names.sort();
    for(const name of names)
        if(startsWithNumberEndsWithYml.test(name))
            if(processFile(bookPath + '/' + name, analyzePath))
                return true;
    return false;
}

function processFile(fname: string, analyzePath: string) {
    console.log(fname);
    const analyzeThis = analyzePath && fname.endsWith(analyzePath);
    const txt = fs.readFileSync(fname);
    const entries: DictEntriesFile = YAML.parse(txt.toString());

    for(const word of entries.szavak.keys()) {
        const wordEntry = entries.szavak[word];
        if(wordEntry.lecserel)
            replaceWith(wordEntry, analyzePath, analyzeThis);
        else if(words[wordEntry.szo]) {
            if(analyzeThis) {
                analyze(wordEntry, words, ordinals, sourceFiles);
            }

            let ord = ordinals[wordEntry.szo];
            if(ord) {
                ordinals[wordEntry.szo] = ++ord;
                wordEntry.sorsz = ord;
            } else {
                words[wordEntry.szo].sorsz = 1;
                wordEntry.sorsz = ordinals[wordEntry.szo] = 2;
            }
            const versionKey = `${wordEntry.szo}÷×${wordEntry.sorsz}`;
            words[versionKey] = wordEntry;
            if(analyzePath)
                sourceFiles[versionKey] = fname;
        } else {
            words[wordEntry.szo] = wordEntry;
            if(analyzePath)
                sourceFiles[wordEntry.szo] = fname;
        }
    }
    return analyzeThis;
}

function replaceWith(wordEntry: Szavak, analyzePath: string, analyzeThis: boolean) {
    const replace = wordEntry.lecserel;
    delete wordEntry.lecserel;

    if(!words[wordEntry.szo])
        return;

    const eqSplit = replace.split('=');
    const deleteIx = eqSplit[0].split(',');
    const insertIx = parseInt(eqSplit[1]);
    let ord = ordinals[wordEntry.szo] || 1;
    const newWd: Szavak[] = [];
    const newSrc: string[] = [];
    for(let i = 1; i <= ord; i++) {
        const versionKey = i === 1 ? wordEntry.szo : `${wordEntry.szo}÷×${i}`;
        const oldEntry = words[versionKey];
        if(newWd.length + 1 === insertIx) {
            newWd.push(wordEntry);
            newSrc.push(analyzePath);
        }
        if(!deleteIx.includes(''+i)) {
            newWd.push(oldEntry);
            if(analyzePath)
                newSrc.push(sourceFiles[versionKey]);
        }
        delete words[versionKey];
        if(analyzePath)
            delete sourceFiles[versionKey];
    }
    ord = newWd.length;
    ordinals[wordEntry.szo] = ord;
    for(let i = 1; i <= ord; i++) {
        if(ord === 1)
            delete wordEntry.sorsz;
        else
            wordEntry.sorsz = i;
        const versionKey = i === 1 ? wordEntry.szo : `${wordEntry.szo}÷×${i}`;
        words[versionKey] = newWd[i - 1];
        if(analyzePath)
            sourceFiles[versionKey] = newSrc[i - 1];
    }

    if(analyzeThis) {
        analyze(wordEntry, words, ordinals, sourceFiles);
    }
}
