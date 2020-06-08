import {DictEntriesFile, Ford, Szavak} from '../common/schema';
import * as YAML from 'yaml';

const enum Section {
    SourceLang,
    Grammar,
    Meaning
}

const boundary = [' ', ',', ';', '(', ')'];
const grammatical = ['hn', 'nn', 'szn', 'nv', 't', 'tl', 'nt', 'mn', 'tbsz', 'kt', 'ht', 'nvált', 'elölj'];

const lineSplitter = /\r?\n/;
const uppercasedWord = /^[A-Z]/;
const meaningWithComment = /(.*)\((.*)\)$/;

const entriesFile = {
    datum: new Date().toISOString().substr(0, 10),
    forras: {
        nev: 'Vinód',
        fejezet: 1
    },
    szavak: []
} as DictEntriesFile;

let entry: Szavak;

export function sabdToYaml(txt: string) {
    const lines = txt.split(lineSplitter);
    for(const line of lines)
        processLine(line);
    cleanupEntry();
    return YAML.stringify(entriesFile);
}

function processLine(line: string) {
    const hindiEnd = line.lastIndexOf('÷');
    if(hindiEnd === -1)
        return;
    let hindi = line.substr(0, hindiEnd).trim().replace(/[÷×]/g, '');
    let hun = line.substring(hindiEnd+1, line.length).trim().replace(/[÷×]/g, '');
    let isExpr = false;
    if(hindi[0] === '←') {
        // source word with own entry
        hindi = hindi.substring(1).trim();
    } if(hindi[0] === '→') {
        hindi = hindi.substring(1).trim();
        isExpr = true;
    }
    if(!isExpr) {
        cleanupEntry();
        entry = {
            szo: hindi,
            szarm: '',
            ford: []
        };
        entriesFile.szavak.push(entry);
    }

    let p = 0,
        word = '',
        inParen = false,
        sec: number = Section.SourceLang,
        ford = newFord();
    if(isExpr)
        ford.kif = hindi;
    while(true) {
        const end = p === hun.length;
        if(!end && !boundary.includes(hun[p])) {
            word += hun[p++];
            continue;
        }
        const sep = end ? '' : hun[p];
        if(word) {
            if(sec === Section.SourceLang) {
                if(uppercasedWord.test(word)) {
                    if(entry.szarm)
                        entry.szarm += ', ';
                    entry.szarm += word;
                } else
                    sec = Section.Grammar;
            }
            if(sec === Section.Grammar) {
                if(grammatical.includes(word)) {
                    if(ford.nyt)
                        ford.nyt += ' ';
                    ford.nyt += word;
                } else
                    sec = Section.Meaning;
            }
            if(sec === Section.Meaning) {
                if(end || !inParen && (sep === ',' || sep === ';')) {
                    const rexRes = meaningWithComment.exec(word);
                    if(rexRes) {
                        ford.ert.push({
                            szo: rexRes[1].trim(),
                            megj: rexRes[2].trim()
                        });
                    } else
                        ford.ert.push(word);
                    if(sep === ';') {
                        entry.ford.push(ford);
                        ford = newFord();
                        sec = Section.Grammar;
                    }
                } else {
                    word += sep;
                    p++;
                    if(sep === '(')
                        inParen = true;
                    else if(sep === ')')
                        inParen = false;
                    continue;
                }
            }
            word = '';
        } else if(sep === '(') {
            word += sep;
            inParen = true;
        }
        if(end)
            break;
        p++;
    }
    entry.ford.push(ford);
    // console.log(entry.szo);
}

function newFord() {
    return {
        kif: '',
        nyt: '',
        ert: []
    } as Ford;
}

function cleanupEntry() {
    if(!entry)
        return;
    if(!entry.szarm)
        delete entry.szarm;
    for(let ford of entry.ford) {
        if(!ford.kif)
            delete ford.kif;
        if(!ford.nyt)
            delete ford.nyt;
    }
}
