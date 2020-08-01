import {map, nuqtaVariant} from './unicode-to-ktrans-map';

const lineSplitter = /\r?\n/;
const vowelsGap = 0x093e - 0x0906;
const vowelAfterR = /^([aeiouAEOU@]|RI)/;
const endingDiphtongRex = /([bcdDgGhjkKlmnNprRsStTvy]y|iiy|bhr|bj|chr|Dg|dhr|dhv|dm|dr|Dr|dv|ghr|gm|gr|hm|hn|jr|jY|kth|kv|lv|ml|Nv|Sc|Shm|ShN|ShTr|sr|sv|Sv|tv|vr)$/;
const upstairsThingy = [0x0908, 0x0910, 0x0911, 0x0913, 0x0914, 0x093f, 0x0940, 0x0945,
    0x0947, 0x0948, 0x0949, 0x094b, 0x094c];

const ktransChar: {[key: number]: boolean} = {};
for(const k of [35, 126, 64, 95, 46, 96, 37]) {    // #~@_.`%
    ktransChar[k] = true;
}

// for embedding:
// noinspection JSUnusedGlobalSymbols
export function processUnicode(txt: string) {
    const outLines: string[] = [];
    const lines = txt.split(lineSplitter);
    for(const line of lines)
        outLines.push(processLine(line));
    return outLines.join('\r\n');
}

export function processLine(line: string, doQuote = true) {
    let cp: number[] = [];
    let trans = true;
    let syllable = '';
    let pending = '';
    let prevLetterCode = 0;
    let prevNuqtaCode = 0;
    let prevNuqtaIx = 0;
    let consonant = false;
    let quoteStart = 0;
    let wordStart = 0;
    let wordBreak = false;
    for(let ix=0; ix < line.length; ix++) {
        let code = line.codePointAt(ix);
        if(isWhite(code) || code === 0x2d) {
            endWord(pending, cp.length-wordStart, cp);
            pending = '';
            cp.push(code);
            wordBreak = true;
            continue;
        }
        if(wordBreak) {
            wordBreak = false;
            syllable = '';
            pending = '';
            prevLetterCode = 0;
            prevNuqtaIx = wordStart = cp.length;
            consonant = false;
        }
        if(code >= 0x900 && code < 0x980) {
            if(!trans) {
                if(doQuote)
                    endQuote(cp, quoteStart);
                trans = true;
            }
        } else if(trans && (isLatin(code)
                || wordStart !== cp.length && code === "'".codePointAt(0))) {
            if(doQuote)
                cp.push('÷'.codePointAt(0));
            trans = false;
            quoteStart = cp.length;
        }
        if(code < 0x900 || code >= 0x980) {
            endWord(pending, cp.length-wordStart, cp);
            pending = '';
            cp.push(code);
            if(code >= 0x10000)
                ix++;
            continue;
        }

        let ch = map[code];
        if(ch === '_') {
            pending = '_';
            continue;
        }
        const prevCons = consonant;
        consonant = code>=0x0915 && code<=0x0939 || code>=0x0958 && code<=0x095e;
        if(!consonant && !ch)
            ch = map[code + vowelsGap];
        if(code === 0x93c) {        // nuqta
            if(prevNuqtaCode) {
                const origCh = map[prevNuqtaCode];
                ch = nuqtaVariant[prevNuqtaCode];
                if(cp.length - origCh.length === prevNuqtaIx) {
                    cp.length = prevNuqtaIx;
                    for(const k of ch)
                        cp.push(k.codePointAt(0));
                } else {
                    const after = cp.slice(prevNuqtaIx + origCh.length);
                    cp.length = prevNuqtaIx;
                    for(const k of ch)
                        cp.push(k.codePointAt(0));
                    cp.push(...after);
                }
                prevNuqtaCode = 0;
            }
            continue;
        }
        if(pending) {
            // write schwa if a consonant came
            if(pending === 'a' && (code<0x93e || code>0x94d && code<0x964 || code>0x96f)) {
                for(const k of pending)
                    cp.push(k.codePointAt(0));
                syllable += 'a';
                prevLetterCode = 0;
            }
            pending = '';
        }
        if(!prevCons && consonant) {
            syllable = '';
            prevNuqtaCode = 0;
        }
        if(!ch) {
            cp.push(code);
            continue;
        }
        if(ch === '#' && (upstairsThingy.indexOf(prevLetterCode) > -1 ||
                syllable[0] === 'r' && !vowelAfterR.test(syllable.substr(1)))) {
            ch = '~';
        }
        prevLetterCode = code;
        if(nuqtaVariant[code]) {
            prevNuqtaCode = code;
            prevNuqtaIx = cp.length;
        }
        for(const k of ch)
            cp.push(k.codePointAt(0));
        syllable += ch;
        if(consonant)
            pending = 'a';
    }
    if(trans)
        endWord(pending, cp.length - wordStart, cp);
    else if(doQuote)
        endQuote(cp, quoteStart);
    return String.fromCodePoint.apply(null, cp);
}

function endQuote(cp: number[], quoteStart: number) {
    if(cp.length - quoteStart > 10) {
        completeLongQuote(cp);
        return;
    }
    let cp2 = [96, cp[quoteStart]];
    let c = 1;
    for(let i = quoteStart+1; i < cp.length; i++) {
        if(isLatin(cp[i])) {
            if(++c > 2) {
                completeLongQuote(cp);
                return;
            }
            cp2.push(96, cp[i]);
        } else
            cp2.push(cp[i]);
    }
    cp.length = quoteStart - 1;
    cp.push(...cp2);
}

function completeLongQuote(cp: number[]) {
    let i = cp.length - 1;
    while(cp[i] === '('.codePointAt(0) || isWhite(cp[i]))
        i--;
    cp.splice(i + 1, 0, '×'.codePointAt(0));
}

function endWord(pending: string, wordLen: number, cp: number[]) {
    if(!pending)
        return;
    if(pending === '_' || wordLen === 1)
        cp.push(pending.codePointAt(0));
    else if(pending === 'a') {
        const end = String.fromCodePoint.apply(null, cp.slice(Math.max(cp.length - 5, 0)));
        if(endingDiphtongRex.test(end))
            cp.push(pending.codePointAt(0));
    }
}

function isWhite(code: number) {
    return code <= 32 || code === 160 || code >= 0x2000 && code <= 0x200a;
}

function isLatin(c: number) {
    return c >= 0x61 && c <= 0x7a || c >= 0x41 && c <= 0x5a
        || c >= 0x30 && c <= 0x39 || c >= 0xc0 && c < 0x180
        || ktransChar[c];
}
