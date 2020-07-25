import * as fs from "fs";
import {createEntries} from '../chic-to-yaml';

describe('Headword parsing', () => {
    it('should create specific headwords', () => {
        const html = fs.readFileSync('./input/html/0001.txt').toString();
        const entries = createEntries(1, html);
        const titles: string[] = entries.szavak.map(ent => ent.szo);
        expect(titles).toContain('a');
        expect(titles).toContain('a#k');
        expect(titles).toContain("a~k'rii");
        expect(titles).toContain("a~k'rOrii");
        expect(titles).toContain('a#kuS');
        expect(titles).not.toContain('a#kuSii');
        expect(entries.forras.fejezet).toBe(1);
    });

    it('should set ordinals', () => {
        const html = fs.readFileSync('./input/html/0004.txt').toString();
        const entries = createEntries(4, html);
        let titles = 0, ord = [], ordError = 0;
        for(let i = 0; i < 10; i++)
            ord[i] = 0;
        for(const entry of entries.szavak) {
            titles++;
            if(entry.sorsz)
                ord[entry.sorsz]++;
            else if(entry.sorsz !== undefined)
                ordError++;
        }
        expect(titles).toBe(36);
        expect(ord[1]).toBe(5);
        expect(ord[2]).toBe(4);
        expect(ord[3]).toBe(3);
        expect(ord[4]).toBe(1);
        expect(ordError).toBe(0);
        expect(entries.forras.fejezet).toBe(4);
    });
});

describe('Transliteration parsing', () => {
    it('should set its field', () => {
        const html = fs.readFileSync('./input/html/0002.txt').toString();
        const entries = createEntries(2, html);
        const trans: string[] = [];
        for(const ent of entries.szavak) {
            if(ent.atir)
                trans.push(ent.atir);
        }
        expect(trans.length).toBe(entries.szavak.length);
        expect(trans).toContain('aṁkusī');
        expect(trans).toContain('aṅgārā');
    });
});

describe('Derivation parsing', () => {
    it('should set its field', () => {
        const html = fs.readFileSync('./input/html/0003.txt').toString();
        const entries = createEntries(3, html);
        const deriv: string[] = [];
        for(const ent of entries.szavak) {
            if(ent.szarm)
                deriv.push(ent.szarm);
        }
        expect(deriv.length).toBe(32);
        expect(deriv).toContain('*<i>aṅguṣṭhiya-</i>');
    });
});

describe('Global labels parsing', () => {
    it('should collect labels', () => {
        const html = fs.readFileSync('./input/html/0003.txt').toString();
        const entries = createEntries(3, html);
        let entry = entries.szavak.filter(ent => ent.szo === 'a#gArii');
        expect(entry.length).toBe(2);
        expect(entry[0].nyt).toBe('f. /ə̃garī/');
        expect(entry[1].nyt).toBe('f. /ə̃garī/');
        entry = entries.szavak.filter(ent => ent.szo === 'a~giyA');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('f.');
        entry = entries.szavak.filter(ent => ent.szo === 'a#gii');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('adj. & m.');
        entry = entries.szavak.filter(ent => ent.szo === 'a#giikAr');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('m.');
        entry = entries.szavak.filter(ent => ent.szo === 'a~gOriyA');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('m. HŚS.');
        entry = entries.szavak.filter(ent => ent.szo === 'a#char');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('m. reg.');
    });

    it('should combine labels before and after derivation', () => {
        const html = fs.readFileSync('./input/html/0752.txt').toString();
        const entries = createEntries(752, html);
        let entry = entries.szavak.filter(ent => ent.szo === "byoh'rA");
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('m reg.');
    });

    it('should combine multi phonemics', () => {
        const html = fs.readFileSync('./input/html/1013.txt').toString();
        const entries = createEntries(1013, html);
        let entry = entries.szavak.filter(ent => ent.szo === 'si#hii');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('f. /siṅhī/, /siṅghī/');
    });

    it('should keep parenthesized part in labels', () => {
        const html = fs.readFileSync('./input/html/0010.txt').toString();
        const entries = createEntries(10, html);
        let entry = entries.szavak.filter(ent => ent.szo === 'aKKal-bAr');
        expect(entry.length).toBe(1);
        expect(entry[0].nyt).toBe('f. reg. (S. India)');
    });
});

describe('Gloss parsing', () => {
    it('should separate parts of gloss', () => {
        const html = fs.readFileSync('./input/html/0011.txt').toString();
        const entries = createEntries(10, html);
        let entry = entries.szavak[1];
        expect(entry.szo).toBe("akkhaR'pan");
        expect(entry.ford.length).toBe(4);
        expect(entry.ford[3].ert[0]).toBe('truculence.');
        entry = entries.szavak[2];
        expect(entry.szo).toBe("akkhaR'panA");
        expect(entry.ford.length).toBe(1);
        expect(entry.ford[0].ert[0]).toBe('= {akkhaRapan}.');
        entry = entries.szavak[3];
        expect(entry.szo).toBe("akkhAh");
        expect(entry.ford.length).toBe(1);
        expect(entry.ford[0].ert[0]).toBe('oh! (expresses astonishment).');
        entry = entries.szavak[5];
        expect(entry.szo).toBe("akrUr");
        expect(entry.ford.length).toBe(1);
        expect(entry.ford[0].ert[0]).toBe('not cruel; gentle.');
        entry = entries.szavak[6];
        expect(entry.szo).toBe("aKl");
        expect(entry.ford.length).toBe(22);
        expect(entry.ford[21].ert[0]).toBe('.');
    });
});
