import {Pool} from 'pg';
import {WordsMap} from './model';

export async function updateDB(dbUrl: string, words: WordsMap) {
    const pool = new Pool({
        connectionString: 'postgresql://' + dbUrl
    });

    await pool.query(
        'truncate word'
    ).catch(
        e => console.log(e)
    );
    const insert = `
        INSERT INTO word (title, ordinal, article)
        VALUES ($1,$2,$3::json)`;
    let count = 0;
    for(const word of Object.values(words)) {
        await pool.query(insert, [
            word.szo, word.sorsz || '', JSON.stringify(word)
        ]).catch(
            e => console.log(e)
        );
        if(++count % 20 === 0)
            console.log(count);
    }
}
