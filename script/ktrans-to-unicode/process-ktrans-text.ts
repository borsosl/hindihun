import {map} from './ktrans-to-unicode-map';

const lineSplitter = /\r?\n/;
const wordSplitter = /\s+/;
const vowelAfterR = /^([aeiouAEOU@]|RI)/;
const vowelsGap = 0x093e - 0x0906;
const upstairsThingy = [0x0908, 0x0910, 0x0911, 0x0913, 0x0914, 0x093f, 0x0940, 0x0945,
        0x0947, 0x0948, 0x0949, 0x094b, 0x094c];
let trans: boolean, shortQuote: boolean;

// for embedding:
// noinspection JSUnusedGlobalSymbols
export function processKtrans(txt: string) {
    const outLines: string[] = [];
    const lines = txt.split(lineSplitter);
    for(const line of lines)
        outLines.push(processLine(line));
    return outLines.join('\r\n');
}

export function processLine(line: string) {
    trans = true;
    const outWords: string[] = [];
    const words = line.split(wordSplitter);
    for(const word of words)
        if(word)
            outWords.push(processWord(word));
    return outWords.join(' ');
}

function processWord(word: string) {
    let cp: number[] = [];
    const len = word.length;
    let syllable = '';
    let consonant = false;
    for(let ix=0; ix < len; ix++) {
        let ch = word.charAt(ix);
        if(!trans) {
            if(ch === '×')
                trans = true;
            else {
                cp.push(ch.codePointAt(0));
                if(shortQuote)
                    trans = true;
            }
            continue;
        }
        if(ch === '÷' || ch === '`') {
            trans = consonant = false;
            shortQuote = ch === '`';
            continue;
        }
        const prevCons = consonant;
        if(prevCons && (ch === 'a' || ch === "'")) {
            consonant = false;
            syllable += 'a';
            continue;
        }
        let sub = word.substr(ix, 2);
        let c = map[sub];
        if(c)
            ix++;
        else {
            sub = word[ix];
            c = map[sub];
            if(!c) {
                cp.push(sub.codePointAt(0));
                consonant = false;
                syllable = '';
                continue;
            }
        }
        consonant = c>=0x0915 && c<=0x0939 || c>=0x0958 && c<=0x095e;
        if(consonant) {
            if(prevCons)
                cp.push(map['_']);
            else
                syllable = '';
        } else {
            if(!prevCons) {
                const vowel = c>=0x093e && c<=0x094c;
                if(vowel) {
                    c -= vowelsGap;
                    syllable = '';
                }
                else if(sub === '~' && cp.length) {
                    const last = cp[cp.length-1];
                    if(upstairsThingy.indexOf(last) > -1 ||
                            syllable[0] === 'r' && !vowelAfterR.test(syllable.substr(1)))
                        c = map['#'];
                }
            }
        }
        cp.push(c);
        syllable += sub;
    }
    return String.fromCodePoint.apply(null, cp);
}
