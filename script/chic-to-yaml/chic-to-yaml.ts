import {DictEntriesFile, Ford, Szavak} from '../common/schema';
import * as fs from 'fs';
import * as YAML from 'yaml';
import {processLine as devaToKtrans} from '../ktrans-to-unicode/process-unicode-text';
import {fixKtrans} from './standard-trans-to-ktrans';

const enum Section {
    Headword,
    Transliteration,
    Derivation,
    GlobalLabels,
    Gloss,
    End
}

interface EntryContext {
    entry: Szavak;
    line: string;
    p: number;
    section: Section;
    ford: Ford;
    skipTransFix: boolean;
}

const lineSplitter = /\s*\r?\n/;
const hwLine = /^\s*<hw>/;
const ordinalRex = /\s*<sp>(\d+)<\/sp>/y;
const headwordRex = /\s*(<kt>(.*?)<\/kt>)?<deva>(.*?)<\/deva>/y;
const transRex = /\s*(<tran>(.*?)<\/tran>)?<\/hw>/y;
const labelsUntilDerivRex = /\s*,?\s*(.{0,10}?)(?=\s*\[)(?<!<def>1\.)/y;
const derivRex = /\s*,?\s*\[(.+?)\]\.?/y;
const phonemicRex = /\s*(,?)\s*(\/[^/]+\/)/y;
const labelsUntilDefRex = /\s*,?\s*(.*?)(?=(\s*<def>1\.|\s+see |\s+= ))/y;
const italicTagsRex = /<\/?i>/g;
const nextShwRex = /.*?<shw>/y;
const parenthesizedRex = /\s*(\(.*?\))/y;
const italicLabelRex = /\s*([,&]*)\s*<i>(.*?)<\/i>(\.?)/y;
const labelRex = /\s*([,&]*)\s*(f\.|m\.|v\.i\.|v\.t\.|adj\.|adv\.|obl\. base\.?|conj\.|pron\.|19c\.|A\.|abl\.|abs\.|acc\.|ad\.|allus\.|alt\.|anal\.|Ap\.|aphet\.|appar\.|approx\.|arch\.|attrib\.|Austro-as\.|Av\.|B\.|Brbh\.|c\.|caus\.|cf\.|colloq\.|comp\.|compar\.|conn\.|corr\.|cpds\.|def\.|dem\.|dep\. auxil\.|dimin\.|dir\.|do\.|Drav\.|e\.g\.|E\.H\.|ellipt\.|emphat\.|encl\.|Engl\.|esp\.|euphem\.|exc\.|excl\.|exclam\.|ext\.|fig\.|fmn\.|foll\.|Fr\.|freq\.|G\.|gen\.|Germ\.|Gk\.|H\.|hon\.|HŚS\.|hw\.|hww\.|i\.e\.|i\.|imp\.|imperf\.|incl\.|in comp\.|incorr\.|Ind\.|indef\.|inf\.|infld\.|instr\.|interj\.|interr\.|inv\.|inverted\.|Ir\.|iron\.|joc\.|Kan\.|KhB\.|L\.|lit\.|loc\.|lw\.|M\.|med\.|metath\.|metr\.|MIA|n\.|N\.|neg\.|neol\.|neut\.|NIA|NW|obj\.|obl\.|obs\.|OIA|onom\.|orig\.|orthogr\.|P\.|Pa\.|Panj\.|part\.|pass\.|pej\.|perf\.|pers\.|Pk\.|pl\.|Pl\.|poet\.|pop\.|ppn\.|prec\.|predic\.|pref\.|prep\.|prob\.|pronun\.|prop\. n\.|prov\.|Pt\.|q\.v\.|Raj\.|redupl\.|refl\.|reg\.|rel\.|repl\.|rhetor\.|Ś\.|sc\.|sg\.|S\.H\.|S\.|Sk\.|sl\.|specif\.|subj\.|subj\.-pres\.|s\.v\.|s\.vv\.|syn\.|T\.|Tam\.|tr\.|trad\.|transf\.|U\.|usu\.|v\.|var\.|viz\.|voc\.|vulg\.|w\.|W\.|w\.r\.|admin\.|aeron\.|agric\.|alg\.|anat\.|anthropol\.|archaeol\.|arith\.|astrol\.|astron\.|athl\.|ayur\.|biochem\.|biol\.|bot\.|chem\.|chronol\.|comm\.|dipl\.|econ\.|electr\.|engin\.|entom\.|fin\.|geog\.|geol\.|geom\.|govt\.|gram\.|hind\.|hist\.|hort\.|indol\.|isl\.|ling\.|math\.|mech\.|meteorol\.|mil\.|min\.|mus\.|musl\.|mythol\.|nat\. hist\.|naut\.|ornith\.|pharm\.|philos\.|phys\.|pol\.|pros\.|psychol\.|rhet\.|techn\.|zool\.|m |adj )/y;
const skipGlossHeadRex = /\s*[.,]*\s*(<def>(\*?)\d+\.|<shw>|<\/p>)?\s*/y;
const glossItemEndRex = /.*?(?=(\s*(<def>|<shw>|<\/p>)))/y;
const glossExprRex = /(.*?)(<\/?shw>([!?)]*)|<\/p>),?\s*/y;
const glossDerivRex = /\s*,?\s*(\[.+?\])/y;
const orRex = /or /g;
const tildeBeforeRex = /~<deva>/g;
const tildeAfterRex = /<\/deva>~/g;
const devaRex = /(<kt>(.*?)<\/kt>)?<deva>(.*?)<\/deva>/g;

let ctx: EntryContext;
const startPage = 0, endPage = 0;

export function processSourceDir(htmlPath: string) {
    const names: string[] = fs.readdirSync(htmlPath);
    names.sort();
    for(const name of names) {
        const ord = /\d+/.exec(name)[0];
        const pageNum = parseInt(ord, 10);
        if(startPage && pageNum < startPage)
            continue;
        processFile(htmlPath + '/' + name, ord, pageNum);
        if(endPage && pageNum === endPage)
            break;
    }
}

function processFile(fname: string, ord: string, pageNum: number) {
    console.log(fname);
    const html = fs.readFileSync(fname).toString();
    const entries = createEntries(pageNum, html);
    fs.writeFileSync(`./input/yaml/${ord}.yml`,
        YAML.stringify(entries, {
            indentSeq: false
        }));
}

export function createEntries(pageNum: number, html: string): DictEntriesFile {
    const entries = {
        datum: new Date().toISOString().substr(0, 10),
        forras: {
            nev: 'OHED',
            fejezet: pageNum
        },
        szavak: []
    } as DictEntriesFile;
    processHtml(html, entries);
    return entries;
}

export function processHtml(html: string, entries: DictEntriesFile) {
    const lines = html.split(lineSplitter);
    for(let line of lines) {
        let res = hwLine.exec(line);
        if(!res)
            continue;
        ctx = {
            entry: {},
            line,
            p: res[0].length,
            section: Section.Headword
        } as EntryContext;
        try {
            processTitleLine(entries);
        } catch(e) {
            if(typeof e !== 'string')
                throw e;
        }
    }
}

function processTitleLine(entries: DictEntriesFile) {
    while(ctx.section != Section.End) {
        switch(ctx.section) {
            case Section.Headword: headword(); break;
            case Section.Transliteration: transliteration(); break;
            case Section.Derivation: derivation(); break;
            case Section.GlobalLabels: globalLabels(); break;
            case Section.Gloss: gloss(); break;
        }
    }
    entries.szavak.push(ctx.entry);
}

function headword() {
    const line = ctx.line;
    ordinalRex.lastIndex = ctx.p;
    let res = ordinalRex.exec(line);
    if(res) {
        ctx.entry.sorsz = parseInt(res[1]);
        ctx.p += res[0].length;
    }

    headwordRex.lastIndex = ctx.p;
    res = headwordRex.exec(line);
    if(!res) {
        ctx.entry.szo = 'a ÷e1×';
        ctx.section = Section.End;
        return;
    }

    if(res[1]) {
        ctx.entry.szo = res[2];
        ctx.skipTransFix = true;
    } else
        ctx.entry.szo = devaToKtrans(res[3], false);
    if(startPage && endPage)
        console.log(ctx.entry.szo);
    ctx.p += res[0].length;
    ctx.section = Section.Transliteration;
}

function transliteration() {
    const line = ctx.line;
    transRex.lastIndex = ctx.p;
    let res = transRex.exec(line);
    if(!res) {
        ctx.entry.szo += ' ÷e2×';
        ctx.section = Section.End;
        return;
    }
    if(res[2]) {
        if(ctx.skipTransFix)
            ctx.entry.atir = res[2];
        else {
            let [szo, atir] = fixKtrans(ctx.entry.szo, res[2]);
            ctx.entry.atir = atir;
            ctx.entry.szo = szo;
        }
    }
    ctx.p += res[0].length;
    ctx.section = Section.Derivation;
}

function derivation() {
    const line = ctx.line;
    labelsUntilDerivRex.lastIndex = ctx.p;
    let res = labelsUntilDerivRex.exec(line);
    if(res && res[1]) {
        ctx.entry.nyt = res[1];
        ctx.p += res[0].length;
    }

    derivRex.lastIndex = ctx.p;
    res = derivRex.exec(line);
    if(res) {
        ctx.entry.szarm = res[1];
        ctx.p += res[0].length;
    }
    ctx.section = Section.GlobalLabels;
}

function globalLabels() {
    const line = ctx.line;
    labelsUntilDefRex.lastIndex = ctx.p;
    let res = labelsUntilDefRex.exec(line);
    if(res && res[1]) {
        nextShwRex.lastIndex = ctx.p;
        const sres = nextShwRex.exec(line);
        if(sres && sres[0].length < res[0].length)
            res = null;
    }
    if(res && res[1]) {
        if(!ctx.entry.nyt)
            ctx.entry.nyt = res[1];
        else
            ctx.entry.nyt += ' ' + res[1];
        ctx.entry.nyt.replace(italicTagsRex, '');
        ctx.p += res[0].length;
    } else {
        while(true) {
            if(phonemic()) {
                if(line[ctx.p] === '.') {
                    ctx.p++;
                    break;
                }
                continue;
            }

            let text: string, sep: string, len: number;
            [text, sep, len] = labels();

            if(text) {
                if(!ctx.entry.nyt)
                    ctx.entry.nyt = text;
                else
                    ctx.entry.nyt += (sep === '&' ? ' & ' : ' ') + text;
                ctx.p += len;
            } else
                break;
        }
    }
    if(ctx.entry.nyt) {
        if(ctx.entry.nyt.endsWith('/.'))
            ctx.entry.nyt = ctx.entry.nyt.substring(0, ctx.entry.nyt.length-1);
        ctx.entry.nyt = ctx.entry.nyt.replace(devaRex,
            (sub: string, g1: string, g2: string, g3: string) => `{${devaVariantToKtrans(g1, g2, g3)}}`);
    }
    ctx.section = Section.Gloss;
}

function labels(): [string, string, number] {
    const line = ctx.line;
    let text: string, sep: string, len: number, italicBlock: string;
    parenthesizedRex.lastIndex = ctx.p;
    let res = parenthesizedRex.exec(line);
    if (res) {
        text = res[1];
        len = res[0].length;
    } else {
        italicLabelRex.lastIndex = ctx.p;
        res = italicLabelRex.exec(line);
        if(res) {
            italicBlock = res[2] + res[3];
            sep = res[1];
            len = res[0].length;
        }
        if(italicBlock) {
            labelRex.lastIndex = 0;
            res = labelRex.exec(italicBlock);
        } else {
            labelRex.lastIndex = ctx.p;
            res = labelRex.exec(line);
        }
        if(res) {
            text = italicBlock ? italicBlock : res[2].trim();
            if(!italicBlock) {
                sep = res[1];
                len = res[0].length;
            }
        }
    }
    return [text, sep, len];
}

function phonemic(ford?: Ford) {
    const line = ctx.line;
    phonemicRex.lastIndex = ctx.p;
    let res = phonemicRex.exec(line);
    if(res) {
        if(ford) {
            if(!ford.nyt)
                ford.nyt = res[2];
            else
                ford.nyt += (res[1] ? ', ' : ' ') + res[2];
        } else {
            if(!ctx.entry.nyt)
                ctx.entry.nyt = res[2];
            else
                ctx.entry.nyt += (res[1] ? ', ' : ' ') + res[2];
        }
        ctx.p += res[0].length;
        return true;
    }
    return false;
}

function gloss() {
    const line = ctx.line;
    ctx.entry.ford = [];
    let shw: boolean, star: boolean;
    while(true) {
        skipGlossHeadRex.lastIndex = ctx.p;
        let res = skipGlossHeadRex.exec(line);
        if(res) {
            shw = res[1] === '<shw>';
            star = !!res[2];
            ctx.p += res[0].length;
            if(res[1] === '</p>' || ctx.p === line.length) {
                ctx.section = Section.End;
                return;
            }
        }

        glossItemEndRex.lastIndex = ctx.p;
        res = glossItemEndRex.exec(line);
        if(!res || !res[1])
            continue;

        const partEnd = ctx.p + res[0].length;
        const ford = ctx.ford = {
            kif: '',
            nyt: star ? '(*)' : '',
            ert: []
        } as Ford;
        if(shw)
            glossExpr();
        glossLabels();
        glossBody(partEnd);
        if(!ford.kif)
            delete ford.kif;
        if(!ford.nyt)
            delete ford.nyt;
        ctx.entry.ford.push(ford);
        ctx.p = partEnd;
    }
}

function glossExpr() {
    glossExprRex.lastIndex = ctx.p;
    const res = glossExprRex.exec(ctx.line);
    if(res && res[2].startsWith('</shw>')) {
        if(res[1]) {
            ctx.ford.kif = (res[1] + res[3])
                .replace(orRex, '')
                .replace(tildeBeforeRex, '~ <deva>')
                .replace(tildeAfterRex, '<\/deva> ~')
                .replace(devaRex,
                    (sub: string, g1: string, g2: string, g3: string) => devaVariantToKtrans(g1, g2, g3));
        }
        ctx.p += res[0].length;
    }
}

function glossLabels() {
    const line = ctx.line;
    const ford = ctx.ford;
    while(true) {
        if(phonemic(ford)) {
            if(line[ctx.p] === '.') {
                ctx.p++;
                break;
            }
            continue;
        }

        glossDerivRex.lastIndex = ctx.p;
        let res = glossDerivRex.exec(line);
        if(res) {
            if(!ford.nyt)
                ford.nyt = res[1];
            else
                ford.nyt += ' ' + res[1];
            ctx.p += res[0].length;
            continue;
        }

        let text: string, sep: string, len: number;
        [text, sep, len] = labels();

        if(text) {
            if(!ford.nyt)
                ford.nyt = text;
            else
                ford.nyt += (sep === '&' ? ' & ' : ' ') + text;
            ctx.p += len;
        } else
            break;
    }
    if(ford.nyt) {
        if(ford.nyt.endsWith('/.'))
            ford.nyt = ford.nyt.substring(0, ctx.entry.nyt.length-1);
        ford.nyt = ford.nyt.replace(devaRex,
            (sub: string, g1: string, g2: string, g3: string) => `{${devaVariantToKtrans(g1, g2, g3)}}`);
    }

    skip(',');
    skip(' ');
}

function glossBody(partEnd: number) {
    if(ctx.p >= partEnd) {
        ctx.ford.ert = ['.'];
        return;
    }

    let ert = ctx.line.substring(ctx.p, partEnd);
    ert = ert.replace(devaRex,
        (sub: string, g1: string, g2: string, g3: string) => `{${devaVariantToKtrans(g1, g2, g3)}}`);
    ctx.ford.ert = [ert];
}

function skip(c: string) {
    while(ctx.line[ctx.p] === c) {
        ctx.p++;
    }
}

function devaVariantToKtrans(g1: string, g2: string, g3: string) {
    if(g1)
        return g2;
    return devaToKtrans(g3, false);
}
