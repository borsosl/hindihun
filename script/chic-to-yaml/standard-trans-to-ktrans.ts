
// noinspection NonAsciiCharacters
const map: {[key: string]: string} = {
    'ă': 'a',
    'ā': 'A',
    'â': 'A',
    'ê': 'e',
    'ī': 'ii',
    'î': 'ii',
    'ô': 'o',
    'ū': 'U',
    'û': 'U',
    'ḍ': 'D',
    'g̠': 'G',
    'ḥ': 'H',
    'ẖ': 'h',
    'ḵ': 'K',
    'ṁ': '~',
    'ṃ': '#',
    'ṅ': '#',
    'ñ': '#',
    'ṇ': '#',
    'q': 'K',
    'ṛ': 'R',
    'ṣ': 'Sh',
    'ś': 'S',
    'ṭ': 'T',
    'r̥': 'RI'
};

const aiRex = /ai/g;
const auRex = /au|aû/g;
const nyRex = /ñ/g;
const cRex = /c/g;

export function fixKtrans(ktrans: string, std: string) {
    const kstd = stdToKtrans(std);
    let szo = '';
    let atir = std;
    let pk = 0, ps = 0, klen = ktrans.length, slen = kstd.length;
    try {
        while(true) {
            const kend = pk === klen;
            const send = ps === slen;
            if(kend) {
                if(send)
                    break;
                if(kstd[ps] === 'a' && ps === slen-1) {
                    szo += 'a';
                    break;
                }
                throw '1';
            }
            const kc = ktrans[pk];
            if(send) {
                if(ktrans[pk] === '_' && pk === klen-1) {
                    szo += '_';
                    break;
                } else if(kc === 'j' && pk > 0 && ktrans[pk-1] === '#') {
                    szo += 'j';
                    atir += 'j';
                    break;
                }
                throw '1';
            }
            const sc = kstd[ps];
            if(kc === sc) {
                szo += kc;
                ++pk;
                ++ps;
            } else if(kc === '_') {
                szo += kc;
                ++pk;
            } else if(sc === '-') {
                ++ps;
            } else if(kc === 'a') {
                szo += '\'';
                ++pk;
            } else if(kc === '~' && (sc === '#' || sc === 'n' || sc === 'm') || kc === '#' && sc === '~') {
                szo += '#';
                if(kc === '~')
                    ktrans = ktrans.slice(0, pk) + '#' + ktrans.slice(pk+1);
                ++pk;
                ++ps;
            } else if((kc === 'M' || kc === 'Y' || kc === 'N') && sc === '#'
                || kc === '#' && (sc === 'n' || sc === 'm')
            ) {
                szo += kc;
                ++pk;
                ++ps;
            } else if(kc === 'j' && pk > 0 && ktrans[pk-1] === '#') {
                if(std.replace(nyRex, '').length === std.length - 1) {
                    const ix = std.indexOf('ñ');
                    atir = std.slice(0, ix+1) + 'j' + std.slice(ix+1);
                    szo += 'j';
                    ++pk;
                } else
                    throw '1';
            } else if(sc === 'c' && kc === '#' && pk < klen-1 && ktrans[pk+1] === 'c') {
                if(std.replace(cRex, '').length === std.length - 1) {
                    const ix = std.indexOf('c');
                    atir = std.slice(0, ix) + 'ñ' + std.slice(ix);
                    szo += '#';
                    ++pk;
                } else
                    throw '1';
            } else if(kc === '-' && sc === 'a') {
                szo += sc;
                ++ps;
            } else
                throw '1';
        }
    } catch(e) {
        return [`${ktrans} ÷e3×`, std];
    }
    return [szo, atir];
}

function stdToKtrans(std: string) {
    std = std.replace(aiRex, 'E').replace(auRex, 'O');
    let res = '';
    for(let i = 0; i < std.length; i++) {
        if(std.codePointAt(i) === 0x325) {
            res = res.substring(0, res.length-1) + 'RI';
            continue;
        }
        if(std.codePointAt(i) === 0x67 && std.codePointAt(i+1) === 0x320) {
            res += 'G';
            continue;
        }
        if(std.codePointAt(i) === 0x61 && std.codePointAt(i+1) === 0x302) {     // a circum
            res += 'A';
            i++;
            continue;
        }
        if(std.codePointAt(i) === 0x2be || std.codePointAt(i) === 0x2bf) {      // print apos
            continue;
        }
        const k = std[i];
        const c = map[k];
        if(c)
            res += c;
        else
            res += k;
    }
    return res;
}
