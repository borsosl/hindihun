import * as fs from 'fs';
import * as YAML from 'yaml';
import {DictEntriesFile, Szavak} from '../common/schema';
import {OrdinalsMap, ReplaceHistory, SourceFileMap, WordsMap} from './model';
import {analyze, analyzeAll} from './analyze';

const startsWithNumber = /^\d/;
const startsWithNumberEndsWithYml = /^\d.*\.yml$/;
let eng: boolean;
let words: WordsMap;
let ordinals: OrdinalsMap;
let sourceFiles: SourceFileMap;
let replaceHistory: ReplaceHistory;

export function processSourceDir(srcPath: string, lang: string, analyzePath: string) {
    eng = lang === 'en';
    words = {};
    ordinals = {};
    sourceFiles = {};
    replaceHistory = {};
    if(eng)
        processBookDir(srcPath, analyzePath);
    else {
        const names: string[] = fs.readdirSync(srcPath);
        names.sort();
        for(const name of names)
            if(startsWithNumber.test(name))
                if(processBookDir(srcPath + '/' + name, analyzePath))
                    break;
    }
    if(analyzePath && analyzePath.startsWith('al'))
        analyzeAll(analyzePath, words, ordinals, sourceFiles, replaceHistory);
    return words;
}

function processBookDir(bookPath: string, analyzePath: string) {
    console.log(bookPath);
    const names: string[] = fs.readdirSync(bookPath);
    names.sort();
    for(const name of names)
        if(startsWithNumberEndsWithYml.test(name))
            if(processFile(bookPath + '/' + name, analyzePath))
                return true;
    return false;
}

function processFile(fname: string, analyzePath: string) {
    // if(!fname.endsWith('__.yml')) return false;   // debug yaml file
    // console.log(fname);
    if(eng) {
        const ordPos = fname.lastIndexOf('/');
        const i = parseInt(fname.slice(ordPos, ordPos + 4), 10);
        if(i % 100 === 0)
            console.log(fname);
    }
    const analyzeThis = analyzePath && !analyzePath.startsWith('al') && fname.endsWith(analyzePath);
    const txt = fs.readFileSync(fname);
    const entries: DictEntriesFile = YAML.parse(txt.toString());

    for(const word of entries.szavak.keys()) {
        const wordEntry = entries.szavak[word];
        if(wordEntry.lecserel)
            replaceWith(wordEntry, analyzePath, analyzeThis, fname);
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

function replaceWith(wordEntry: Szavak, analyzePath: string, analyzeThis: boolean, fname: string) {
    const replace = wordEntry.lecserel;
    delete wordEntry.lecserel;

    if(!words[wordEntry.szo])
        return;

    const eqSplit = replace.split('=');
    const deleteIx = eqSplit[0].split(',');
    const targetIx = eqSplit[1].split(';');
    const insertIx = parseInt(targetIx[0]);
    const expectedMaxIndex = targetIx.length > 1 ? parseInt(targetIx[1]) : -1;
    let ord = ordinals[wordEntry.szo] || 1;
    if(insertIx > ord)
        ord++;
    const newWord: Szavak[] = [];
    const newSrc: string[] = [];
    const historyItem: SourceFileMap = {};
    const analyzeAll = analyzePath === 'all';
    for(let i = 1; i <= ord; i++) {
        const versionKey = i === 1 ? wordEntry.szo : `${wordEntry.szo}÷×${i}`;
        const oldEntry = words[versionKey];
        if(newWord.length + 1 === insertIx) {
            newWord.push(wordEntry);
            if(analyzePath)
                newSrc.push(fname);
        }
        if(!deleteIx.includes(''+i)) {
            newWord.push(oldEntry);
            if(analyzePath)
                newSrc.push(sourceFiles[versionKey]);
        }
        delete words[versionKey];
        if(analyzePath) {
            if(analyzeAll)
                historyItem[versionKey] = sourceFiles[versionKey];
            delete sourceFiles[versionKey];
        }
    }
    ord = newWord.length;
    ordinals[wordEntry.szo] = ord;
    if(expectedMaxIndex > -1)
        ordinals[`${wordEntry.szo}÷×Expect`] = expectedMaxIndex;
    for(let i = 1; i <= ord; i++) {
        const word = newWord[i - 1];
        if(ord === 1)
            delete word.sorsz;
        else
            word.sorsz = i;
        const versionKey = i === 1 ? wordEntry.szo : `${wordEntry.szo}÷×${i}`;
        words[versionKey] = word;
        if(analyzePath)
            sourceFiles[versionKey] = newSrc[i - 1];
    }

    if(analyzeAll) {
        if(!replaceHistory[wordEntry.szo])
            replaceHistory[wordEntry.szo] = [];
        replaceHistory[wordEntry.szo].push(historyItem);
    }
    if(analyzeThis) {
        analyze(wordEntry, words, ordinals, sourceFiles);
    }
}
