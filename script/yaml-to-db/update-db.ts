import {SolrHindihunDocument, WordsMap} from './model';
import * as request from 'request-promise';
import {Szavak} from '../common/schema';
import {tokenize as tok} from './tokenize';
import {SearchType} from '../common/model';

export async function updateDB(solrCoreBaseUrl: string, words: WordsMap) {
    let count = 0;
    for(const word of Object.values(words)) {
        ++count;
        if(count % 1000 === 0)
            console.log(count);
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

    const hindi = [tok(word.szo, SearchType.title)];
    const hun: string[] = [];
    const lex: string[] = [];
    if(word.lasd)
        hindi.push(tok(word.lasd, SearchType.title));
    if(word.alt)
        hindi.push(...word.alt.map(a => tok(a, SearchType.title)));
    word.ford.forEach(f => {
        if(f.var)
            f.var.forEach(v => hindi.push(tok(v.alak, SearchType.title)));
    });
    ret.title = hindi.join(' ');

    word.ford.forEach(f => {
        if(f.kif)
            hindi.push(tok(f.kif, SearchType.hindi));
        if(f.pl)
            f.pl.forEach(pl => hindi.push(tok(pl.ered, SearchType.hindi)));
        if(f.szin)
            f.szin.forEach(sz => hindi.push(tok(sz, SearchType.hindi)));
        if(f.ant)
            f.ant.forEach(ant => hindi.push(tok(ant, SearchType.hindi)));

        f.ert.forEach(e => {
            if(typeof e === 'string')
                hun.push(tok(e, SearchType.trans));
            else
                hun.push(tok(e.szo, SearchType.trans));
        });

        if(f.lex)
            lex.push(f.lex)
    });
    ret.hindi = hindi.join(' ');
    ret.trans = hun.join(' ');
    if(lex.length)
        ret.lex = lex.join(' ');

    word.ford.forEach(f => {
        f.ert.forEach(e => {
            if(typeof e !== 'string')
                hun.push(tok(e.megj, SearchType.hun));
        });
        if(f.pl) {
            f.pl.forEach(pl => {
                if(pl.ford)
                    hun.push(tok(pl.ford, SearchType.hun));
            });
        }
    });
    ret.hun = hun.join(' ');

    return ret;
}
