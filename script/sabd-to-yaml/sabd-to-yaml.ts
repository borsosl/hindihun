import {DictEntriesFile, Ford, Szavak} from '../common/schema';
import * as YAML from 'yaml';
import {processLine as devaToKtrans} from '../ktrans-to-unicode/process-unicode-text';

const enum Section {
    SourceLang,
    Grammar,
    Meaning
}

const boundary = [' ', ',', ';', '(', ')'];
const hunGram = ['hn', 'nn', 'szn', 'nv', 't', 'tl', 'nt', 'mn', '1sz', 'tbsz', 'kt', 'ht', 'nvált', 'elölj'];
// noinspection NonAsciiCharacters
const engGram: {[key: string]: string} = {
    m: 'hn', f: 'nn', tr: 't', it: 'tl', intr: 'tl',
    adj: 'mn', adv: 'ht', ppos: 'nt', prep: 'elölj',
    sing: '1sz', p: 'tbsz', pl: 'tbsz', i: 'nvált', inv: 'nvált',
    v: '', inf: '', fml: '', 'közel': '', 'távol': ''};

const lineSplitter = /\r?\n/;
const uppercasedWord = /^[A-Z]/;
const meaningWithComment = /(.*) \((.*)\)$/;
const commonLineParts = /(([^;:=]*);)?([^:=]*)(:([^:=]*))?(:([^:=]*))?(:([^:=]*))?=?(.*)/;
const commaSplitter = /\s*,\s*/;
const nonAlphaSplitter = /\W+/;

const entriesFile = {
    datum: new Date().toISOString().substr(0, 10),
    forras: {
        nev: 'Vinód',
        fejezet: 1
    },
    szavak: []
} as DictEntriesFile;

let entry: Szavak;

export function sabdToYaml(txt: string, fmt: string) {
    const lines = txt.split(lineSplitter);
    for(let line of lines) {
        line = devaToKtrans(line, false);
        fmt === 'vi' ? processVinodLine(line) : processCommonLine(line);
    }
    cleanupEntry();
    return YAML.stringify(entriesFile);
}

function processVinodLine(line: string) {
    let hindiEnd = line.lastIndexOf('÷');
    if(hindiEnd === -1)
        hindiEnd = line.length;
    let hindi = line.substr(0, hindiEnd).trim().replace(/[÷×]/g, '');
    if(!hindi)
        return;
    let hun = hindiEnd === line.length ? ''
        : line.substring(hindiEnd+1, line.length).trim().replace(/[÷×]/g, '');
    let isExpr = false;
    if(hindi[0] === '←' || hindi[0] === '<') {
        // source word with own entry
        hindi = hindi.substring(1).trim();
    } if(hindi[0] === '→' || hindi[0] === '>') {
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
                if(hunGram.includes(word)) {
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
}

function processCommonLine(line: string) {
    const parts = commonLineParts.exec(line.replace(/[÷×]/g, ''));
    let [,, title, hindi,, nyt,, szarm,, alt, hun] = parts;
    if(!hindi)
        return;
    else
        hindi = hindi.trim();
    if(title)
        title = title.trim();
    if(nyt)
        nyt = nyt.trim();
    if(szarm)
        szarm = szarm.trim();
    if(hun)
        hun = hun.trim();

    if(!title)
        if(hindi[0] === '>')
            hindi = hindi.substring(1).trim();
        else
            title = hindi;
    if(title) {
        cleanupEntry();
        entry = {
            szo: title,
            szarm,
            ford: []
        };
        if(alt)
            entry.alt = alt.split(commaSplitter);
        entriesFile.szavak.push(entry);
    }
    let nytSzarm;
    [nyt, nytSzarm] = parseGrammar(nyt);
    if(nytSzarm)
        entry.szarm = entry.szarm ? `${entry.szarm} ${nytSzarm}` : nytSzarm;

    let p = 0,
        word = '',
        inParen = false,
        sec: number = Section.Grammar,
        ford = newFord();
    if(!title)
        ford.kif = hindi;
    ford.nyt = nyt;
    while(true) {
        const end = p === hun.length;
        if(!end && !boundary.includes(hun[p])) {
            word += hun[p++];
            continue;
        }
        const sep = end ? '' : hun[p];
        if(word) {
            if(sec === Section.Grammar) {
                if(hunGram.includes(word)) {
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
}

function parseGrammar(nyt: string) {
    if(!nyt)
        return [null, null];
    const pt = nyt.split(nonAlphaSplitter);
    const nytArr: string[] = [];
    const szarmArr: string[] = [];
    for(const p of pt) {
        if(!p)
            continue;
        if(uppercasedWord.test(p))
            szarmArr.push(p);
        else {
            const conv = engGram[p];
            if(conv !== '')
                nytArr.push(conv ? conv : p);
        }
    }
    return [nytArr.join(' '), szarmArr.join(' ')];
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
