import {getFile, storeFile} from '../helper/storage';

type stringMap = {[key: string]: string};

export async function getDailyPass() {
    const fname = 'pass.json';
    const json = await getFile(fname);
    const stored = JSON.parse(json);
    const [created, createCount, dailyPass] = createDailyPasses(stored, new Date());
    if(createCount)
        await storeFile(fname, JSON.stringify(created));
    return dailyPass;
}

export function createDailyPasses(stored: stringMap, date: Date): [stringMap, number, string] {
    const created: stringMap = {};
    let createCount = 0;
    let dailyPass;
    for(let i = 0; i < 7; i++) {
        const key = date.toISOString().substr(0, 10);
        let pass = stored[key];
        if(!pass) {
            createCount++;
            pass = genpass();
        }
        created[key] = pass;
        if(i === 0)
            dailyPass = pass;
        date.setTime(date.getTime() + 24 * 60 * 60000);
    }
    return [created, createCount, dailyPass];
}

function genpass() {
    let pass = '';
    for(let i = 0; i < 8; i++) {
        let r = Math.floor(Math.random() * 62);
        if(r < 10)
            r += 48;
        else if(r < 36)
            r += 65 - 10;
        else
            r += 97 - 36;
        pass += String.fromCodePoint(r);
    }
    return pass;
}
