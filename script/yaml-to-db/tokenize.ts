import {SearchType} from '../common/model';

const whiteSplitter = /\s+/;
const trailPunct = /[,;:!…]+$/;
const trailQuestionOrViram = /([^.,;:!]+)([?_])+$/;
const punctSplitter = /[.,;:?!]/;
const number = /^(\d+(([,.0-9]+\d)*\.?))[?)]*$/;
const numberRange = /^(\d+(([-,.0-9]+\d)*\.?))[?)]*$/;
const partiallyParenthesized = /^\((.+)\)(.+)|(.+)\((.+)\)$/;

const ktransChar: {[key: number]: boolean} = {};
for(const k of [35, 126, 64, 95, 37, 42]) {    // #~@_%*
    ktransChar[k] = true;
}

export function tokenize(s: string, type: SearchType) {
    let tokens = s.split(whiteSplitter);
    tokens = splitOnHyphens(tokens, type);
    tokens = splitSpecial(tokens, type);
    tokens = splitOnNonLetters(tokens, type);

    /*
        let s1 = tokens.join(' ');
        if(s1 !== s)
            console.log(`${s} -- ${s1}`);
        else
            console.log(s);
    */
    return tokens.join(' ');
}

function splitOnHyphens(tokens: string[], type: SearchType) {
    const hasHindi = type === SearchType.title || type === SearchType.hindi;
    const tokensExt: string[] = [];
    for(const token of tokens) {
        // szóvégi írásjel kidobás. Pont marad sorszám miatt,
        // kérdőjel marad kérdőszó miatt.
        let tok = token.replace(trailPunct, '');
        if(!tok)
            continue;
        if(!hasHindi)
            tok = tok.toLowerCase();

        // bontás kötőjelnél
        const dashPart = tok.split('-');
        if(dashPart.length === 1) {     // no dashes
            tokensExt.push(tok);
            continue;
        }

        // számok esetén tartomány nem marad meg
        // egyébként teljes kötőjeles kif
        if(!numberRange.test(tok))
            tokensExt.push(tok);      // full dashed expr, non-numbers

        // tagok külön-külön, ha nem mini
        for(const s of dashPart) {
            if(s.length > 3 || (s.length > 1 && (hasHindi || dashPart[0])))
                tokensExt.push(s);
        }
    }
    return tokensExt;
}

function splitSpecial(tokens: string[], type: SearchType) {
    const tokensExt: string[] = [];
    for(const tok of tokens) {
        // számok kezelése
        let rexRes = number.exec(tok);
        if(rexRes) {
            tokensExt.push(rexRes[1]);
            continue;
        }

        // kapcsolódó zárójel 2 szó lesz
        rexRes = partiallyParenthesized.exec(tok);
        if(rexRes) {
            if(rexRes[1]) {
                tokensExt.push(rexRes[2]);
                tokensExt.push(rexRes[1] + rexRes[2]);
            } else {
                tokensExt.push(rexRes[3]);
                tokensExt.push(rexRes[3] + rexRes[4]);
            }
            continue;
        }

        // kérdőjel és virám szó végén: vele és nélküle is felsorol
        rexRes = trailQuestionOrViram.exec(tok);
        if(rexRes) {
            tokensExt.push(rexRes[1]);
            if(type !== SearchType.title || rexRes[2] === '_') {
                tokensExt.push(tok);
            }
            continue;
        }

        // nem-számok írásjeleknél szétválasztása
        const parts = tok.split(punctSplitter);
        for(const s of parts) {
            if(s)
                tokensExt.push(s);
        }
    }
    return tokensExt;
}

function splitOnNonLetters(tokens: string[], type: SearchType) {
    const hasHindi = type === SearchType.title || type === SearchType.hindi;
    const tokensExt: string[] = [];
    for(const token of tokens) {
        let cp: number[] = [];
        let changed = false;
        for(let ix=0; ix < token.length; ix++) {
            let c = token.codePointAt(ix);
            // bizonyos írásjelek megmaradtak számokban és kérdőszókban, stb.
            if(c >= 0x61 && c <= 0x7a || c >= 0x41 && c <= 0x5a                 // a-z A-Z
                || c >= 0xc0 && c < 0x180                                       // áéí...
                || hasHindi && (ktransChar[c] || cp.length > 0 && c === 39)     // #~... '
                || c >= 0x30 && c <= 0x39                                       // 0-9
                || c >= 44 && c <= 46 || c === 63                               // ,-.?
            ) {
                if(c === 39) {      // '
                    cp.push(97);    // a
                    changed = true;
                } else if(c === 35 || c === 126) {      // #~
                    cp.push(110);    // n
                    changed = true;
                } else
                    cp.push(c);
            } else {
                if(cp.length) {
                    tokensExt.push(String.fromCodePoint.apply(null, cp));
                    cp = [];
                }
            }
        }

        const crap = !cp.length || cp.length === 1 && cp[0] >= 0x61 && cp[0] <= 0x7a;
        if(!crap) {
            if(!changed && cp.length === token.length)
                tokensExt.push(token);
            else {
                tokensExt.push(String.fromCodePoint.apply(null, cp));
            }
        }
    }
    return tokensExt;
}
