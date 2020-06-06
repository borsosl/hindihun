/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const process_ktrans_text_1 = __webpack_require__(1);
const process_unicode_text_1 = __webpack_require__(3);
const isKtransEl = document.querySelector('#is-ktrans');
const inEl = document.querySelector('#in');
const outEl = document.querySelector('#out');
const delayEl = document.querySelector('#delay');
let prev = '';
function inputChange() {
    const text = inEl.value;
    if (text === prev)
        return;
    const isKtrans = isKtransEl.checked;
    outEl.value = isKtrans ? process_ktrans_text_1.processKtrans(text) : process_unicode_text_1.processUnicode(text);
    if (prev && text.startsWith(prev))
        outEl.scrollTop = outEl.scrollHeight;
    prev = text;
}
function debounce(func, delay) {
    let timeoutID;
    return function (...args) {
        if (timeoutID)
            clearTimeout(timeoutID);
        timeoutID = setTimeout(() => func(...args), delay);
    };
}
inEl.onkeyup = debounce(inputChange, 800);
delayEl.onchange = () => {
    let val = parseInt(delayEl.value);
    if (!isNaN(val) && val >= 0)
        inEl.onkeyup = debounce(inputChange, val);
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.processLine = exports.processKtrans = void 0;
const ktrans_to_unicode_map_1 = __webpack_require__(2);
const lineSplitter = /\r?\n/;
const wordSplitter = /\s+/;
const vowelAfterR = /^([aeiouAEOU@]|RI)/;
const vowelsGap = 0x093e - 0x0906;
const upstairsThingy = [0x0908, 0x0910, 0x0911, 0x0913, 0x0914, 0x093f, 0x0940, 0x0945,
    0x0947, 0x0948, 0x0949, 0x094b, 0x094c];
let trans, shortQuote;
// for embedding:
// noinspection JSUnusedGlobalSymbols
function processKtrans(txt) {
    const outLines = [];
    const lines = txt.split(lineSplitter);
    for (const line of lines)
        outLines.push(processLine(line));
    return outLines.join('\r\n');
}
exports.processKtrans = processKtrans;
function processLine(line) {
    trans = true;
    const outWords = [];
    const words = line.split(wordSplitter);
    for (const word of words)
        if (word)
            outWords.push(processWord(word));
    return outWords.join(' ');
}
exports.processLine = processLine;
function processWord(word) {
    let cp = [];
    const len = word.length;
    let syllable = '';
    let consonant = false;
    for (let ix = 0; ix < len; ix++) {
        let ch = word.charAt(ix);
        if (!trans) {
            if (ch === '×')
                trans = true;
            else {
                cp.push(ch.codePointAt(0));
                if (shortQuote)
                    trans = true;
            }
            continue;
        }
        if (ch === '÷' || ch === '`') {
            trans = consonant = false;
            shortQuote = ch === '`';
            continue;
        }
        const prevCons = consonant;
        if (prevCons && (ch === 'a' || ch === "'")) {
            consonant = false;
            syllable += 'a';
            continue;
        }
        let sub = word.substr(ix, 2);
        let c = ktrans_to_unicode_map_1.map[sub];
        if (c)
            ix++;
        else {
            sub = word[ix];
            c = ktrans_to_unicode_map_1.map[sub];
            if (!c) {
                cp.push(sub.codePointAt(0));
                consonant = false;
                syllable = '';
                continue;
            }
        }
        consonant = c >= 0x0915 && c <= 0x0939 || c >= 0x0958 && c <= 0x095e;
        if (consonant) {
            if (prevCons)
                cp.push(ktrans_to_unicode_map_1.map['_']);
            else
                syllable = '';
        }
        else {
            if (!prevCons) {
                const vowel = c >= 0x093e && c <= 0x094c;
                if (vowel) {
                    c -= vowelsGap;
                    syllable = '';
                }
                else if (sub === '~' && cp.length) {
                    const last = cp[cp.length - 1];
                    if (upstairsThingy.indexOf(last) > -1 ||
                        syllable[0] === 'r' && !vowelAfterR.test(syllable.substr(1)))
                        c = ktrans_to_unicode_map_1.map['#'];
                }
            }
        }
        cp.push(c);
        syllable += sub;
    }
    return String.fromCodePoint.apply(null, cp);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
exports.map = {
    '~': 0x0901,
    '#': 0x0902,
    'H': 0x0903,
    'a': 0x0905,
    'k': 0x0915,
    'kh': 0x0916,
    'g': 0x0917,
    'gh': 0x0918,
    'M': 0x0919,
    'c': 0x091a,
    'ch': 0x091b,
    'j': 0x091c,
    'jh': 0x091d,
    'Y': 0x091e,
    'T': 0x091f,
    'Th': 0x0920,
    'D': 0x0921,
    'Dh': 0x0922,
    'N': 0x0923,
    't': 0x0924,
    'th': 0x0925,
    'd': 0x0926,
    'dh': 0x0927,
    'n': 0x0928,
    'p': 0x092a,
    'ph': 0x092b,
    'b': 0x092c,
    'bh': 0x092d,
    'm': 0x092e,
    'y': 0x092f,
    'r': 0x0930,
    'l': 0x0932,
    'v': 0x0935,
    'S': 0x0936,
    'Sh': 0x0937,
    's': 0x0938,
    'h': 0x0939,
    'A': 0x093e,
    'i': 0x093f,
    'ii': 0x0940,
    'u': 0x0941,
    'U': 0x0942,
    'RI': 0x0943,
    'e': 0x0947,
    'E': 0x0948,
    '@': 0x0949,
    'o': 0x094b,
    'O': 0x094c,
    '_': 0x094d,
    'K': 0x0958,
    'Kh': 0x0959,
    'G': 0x095a,
    'z': 0x095b,
    'R': 0x095c,
    'Rh': 0x095d,
    'f': 0x095e,
    '.': 0x0964,
    '0': 0x0966,
    '1': 0x0967,
    '2': 0x0968,
    '3': 0x0969,
    '4': 0x096a,
    '5': 0x096b,
    '6': 0x096c,
    '7': 0x096d,
    '8': 0x096e,
    '9': 0x096f,
    '%': 0x0970
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.processLine = exports.processUnicode = void 0;
const unicode_to_ktrans_map_1 = __webpack_require__(4);
const lineSplitter = /\r?\n/;
const vowelsGap = 0x093e - 0x0906;
const vowelAfterR = /^([aeiouAEOU@]|RI)/;
const upstairsThingy = [0x0908, 0x0910, 0x0911, 0x0913, 0x0914, 0x093f, 0x0940, 0x0945,
    0x0947, 0x0948, 0x0949, 0x094b, 0x094c];
const ktransChar = {};
for (const k of [35, 126, 64, 95, 46, 96, 37]) { // #~@_.`%
    ktransChar[k] = true;
}
// for embedding:
// noinspection JSUnusedGlobalSymbols
function processUnicode(txt) {
    const outLines = [];
    const lines = txt.split(lineSplitter);
    for (const line of lines)
        outLines.push(processLine(line));
    return outLines.join('\r\n');
}
exports.processUnicode = processUnicode;
function processLine(line) {
    let cp = [];
    let trans = true;
    let syllable = '';
    let pending = '';
    let prevLetterCode = 0;
    let prevLetterIx = 0;
    let consonant = false;
    let quoteStart = 0;
    let wordStart = 0;
    let wordBreak = false;
    for (let ix = 0; ix < line.length; ix++) {
        let code = line.codePointAt(ix);
        if (isWhite(code)) {
            endWord(pending, cp.length - wordStart, cp);
            cp.push(code);
            wordBreak = true;
            continue;
        }
        if (wordBreak) {
            wordBreak = false;
            syllable = '';
            pending = '';
            prevLetterCode = 0;
            prevLetterIx = wordStart = cp.length;
            consonant = false;
        }
        if (code >= 0x900 && code < 0x980) {
            if (!trans) {
                endQuote(cp, quoteStart);
                trans = true;
            }
        }
        else if (trans && (isLatin(code)
            || wordStart !== cp.length && code === "'".codePointAt(0))) {
            cp.push('÷'.codePointAt(0));
            trans = false;
            quoteStart = cp.length;
        }
        if (code < 0x900 || code >= 0x980) {
            endWord(pending, cp.length - wordStart, cp);
            pending = '';
            cp.push(code);
            if (code >= 0x10000)
                ix++;
            continue;
        }
        let ch = unicode_to_ktrans_map_1.map[code];
        const prevCons = consonant;
        consonant = code >= 0x0915 && code <= 0x0939 || code >= 0x0958 && code <= 0x095e;
        if (!consonant && !ch)
            ch = unicode_to_ktrans_map_1.map[code + vowelsGap];
        if (ch === '_') {
            pending = '_';
            continue;
        }
        if (code === 0x93c) { // nuqta
            if (prevLetterCode) {
                ch = unicode_to_ktrans_map_1.nuqtaVariant[prevLetterCode];
                cp.length = prevLetterIx;
                for (const k of ch)
                    cp.push(k.codePointAt(0));
            }
            continue;
        }
        if (pending) {
            // write schwa if a consonant came
            if (pending === 'a' && (code < 0x93e || code > 0x94d && code < 0x964 || code > 0x96f)) {
                for (const k of pending)
                    cp.push(k.codePointAt(0));
            }
            pending = '';
        }
        if (!prevCons && consonant)
            syllable = '';
        if (!ch) {
            cp.push(code);
            continue;
        }
        if (ch === '#' && (upstairsThingy.indexOf(prevLetterCode) > -1 ||
            syllable[0] === 'r' && !vowelAfterR.test(syllable.substr(1)))) {
            ch = '~';
        }
        prevLetterCode = code;
        prevLetterIx = cp.length;
        for (const k of ch)
            cp.push(k.codePointAt(0));
        syllable += ch;
        if (consonant)
            pending = 'a';
    }
    if (trans)
        endWord(pending, cp.length - wordStart, cp);
    else
        endQuote(cp, quoteStart);
    return String.fromCodePoint.apply(null, cp);
}
exports.processLine = processLine;
function endQuote(cp, quoteStart) {
    if (cp.length - quoteStart > 10) {
        completeLongQuote(cp);
        return;
    }
    let cp2 = [96, cp[quoteStart]];
    let c = 1;
    for (let i = quoteStart + 1; i < cp.length; i++) {
        if (isLatin(cp[i])) {
            if (++c > 2) {
                completeLongQuote(cp);
                return;
            }
            cp2.push(96, cp[i]);
        }
        else
            cp2.push(cp[i]);
    }
    cp.length = quoteStart - 1;
    cp.push(...cp2);
}
function completeLongQuote(cp) {
    let i = cp.length - 1;
    while (cp[i] === '('.codePointAt(0) || isWhite(cp[i]))
        i--;
    cp.splice(i + 1, 0, '×'.codePointAt(0));
}
function endWord(pending, wordLen, cp) {
    if (!pending)
        return;
    if (pending === '_' || wordLen === 1)
        cp.push(pending.codePointAt(0));
}
function isWhite(code) {
    return code <= 32 || code === 160 || code >= 0x2000 && code <= 0x200a;
}
function isLatin(c) {
    return c >= 0x61 && c <= 0x7a || c >= 0x41 && c <= 0x5a
        || c >= 0x30 && c <= 0x39 || c >= 0xc0 && c < 0x180
        || ktransChar[c];
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.nuqtaVariant = exports.map = void 0;
exports.map = {
    0x0901: '~',
    0x0902: '#',
    0x0903: 'H',
    0x0905: 'a',
    0x0915: 'k',
    0x0916: 'kh',
    0x0917: 'g',
    0x0918: 'gh',
    0x0919: 'M',
    0x091a: 'c',
    0x091b: 'ch',
    0x091c: 'j',
    0x091d: 'jh',
    0x091e: 'Y',
    0x091f: 'T',
    0x0920: 'Th',
    0x0921: 'D',
    0x0922: 'Dh',
    0x0923: 'N',
    0x0924: 't',
    0x0925: 'th',
    0x0926: 'd',
    0x0927: 'dh',
    0x0928: 'n',
    0x092a: 'p',
    0x092b: 'ph',
    0x092c: 'b',
    0x092d: 'bh',
    0x092e: 'm',
    0x092f: 'y',
    0x0930: 'r',
    0x0932: 'l',
    0x0935: 'v',
    0x0936: 'S',
    0x0937: 'Sh',
    0x0938: 's',
    0x0939: 'h',
    0x093e: 'A',
    0x093f: 'i',
    0x0940: 'ii',
    0x0941: 'u',
    0x0942: 'U',
    0x0943: 'RI',
    0x0947: 'e',
    0x0948: 'E',
    0x0949: '@',
    0x094b: 'o',
    0x094c: 'O',
    0x094d: '_',
    0x0958: 'K',
    0x0959: 'Kh',
    0x095a: 'G',
    0x095b: 'z',
    0x095c: 'R',
    0x095d: 'Rh',
    0x095e: 'f',
    0x0964: '.',
    0x0966: '0',
    0x0967: '1',
    0x0968: '2',
    0x0969: '3',
    0x096a: '4',
    0x096b: '5',
    0x096c: '6',
    0x096d: '7',
    0x096e: '8',
    0x096f: '9',
    0x0970: '%'
};
exports.nuqtaVariant = {
    0x0915: 'K',
    0x0916: 'Kh',
    0x0917: 'G',
    0x091c: 'z',
    0x0921: 'R',
    0x0922: 'Rh',
    0x092b: 'f'
};


/***/ })
/******/ ]);