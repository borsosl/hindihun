import {SolrHindihunDocument, WordsMap} from './model';
import * as request from'request-promise';
import {Szavak} from '../common/schema';

export async function updateDB(solrCoreBaseUrl: string, words: WordsMap) {
    for(const word of Object.values(words)) {
        const doc = solrize(word);
        try {
            await request.post({
                url: `${solrCoreBaseUrl}/update`,
                qs: {
                    'json.command': 'false'
                },
                json: true,
                body: doc
            });
        } catch (e) {
            console.log(word, e.toString());
            return;
        }
    }
}

function solrize(word: Szavak): SolrHindihunDocument {
    const ret = {} as SolrHindihunDocument;
    ret.doc = JSON.stringify(word);

    const hindi = [word.szo];
    const hun: string[] = [];
    const lex: string[] = [];
    if(word.lasd)
        hindi.push(word.lasd);
    if(word.alt)
        hindi.concat(word.alt);
    ret.title = replaceApostrophe(hindi.join(' '));

    word.ford.forEach(f => {
        if(f.kif)
            hindi.push(f.kif);
        if(f.var)
            f.var.forEach(v => hindi.push(v.alak));
        if(f.pl)
            f.pl.forEach(pl => hindi.push(pl.ered));
        if(f.szin)
            f.szin.forEach(sz => hindi.push(sz));
        if(f.ant)
            f.ant.forEach(ant => hindi.push(ant));

        f.ert.forEach(e => {
            if(typeof e === 'string')
                hun.push(e);
            else
                hun.push(e.szo);
        });

        if(f.lex)
            lex.push(f.lex)
    });
    ret.hindi = replaceApostrophe(hindi.join(' '));
    ret.trans = hun.join(' ');
    if(lex.length)
        ret.lex = lex.join(' ');

    word.ford.forEach(f => {
        f.ert.forEach(e => {
            if(typeof e !== 'string')
                hun.push(e.megj);
        });
        if(f.pl) {
            f.pl.forEach(pl => {
                if(pl.ford)
                    hun.push(pl.ford);
            });
        }
    });
    ret.hun = hun.join(' ');

    return ret;
}

function replaceApostrophe(s: string) {
    return s.replace(/(?<!\\)'/g, 'a');
}
