import * as fs from "fs";
import * as YAML from 'yaml';
import {
    AnalyzeItem,
    OrdinalsMap,
    ReplaceHistory,
    SourceFileMap,
    WordsMap
} from './model';
import {Szavak} from '../common/schema';

export function analyze(wordEntry: Szavak, words: WordsMap, ordinals: OrdinalsMap, sourceFiles: SourceFileMap) {
    let ord = ordinals[wordEntry.szo] || 1;
    const defs: AnalyzeItem[] = [];
    for(let i = 1; i <= ord; i++) {
        const versionKey = i === 1 ? wordEntry.szo : `${wordEntry.szo}÷×${i}`;
        defs.push({
            sourceFile: sourceFiles[versionKey],
            word: words[versionKey]
        });
    }
    defs.push({
        sourceFile: 'analyzed',
        word: wordEntry
    });
    const info = {
        title: wordEntry.szo,
        words: defs
    };
    console.log(YAML.stringify(info));
}

export function analyzeAll(op: string, words: WordsMap, ordinals: OrdinalsMap,
                           sourceFiles: SourceFileMap, replaceHistory: ReplaceHistory) {

    const all = op === 'all';
    for(const title of Object.keys(words)) {
        if(!ordinals[title] || ordinals[title] === 1 && !all)
            continue;
        console.log(title);
        if(all) {
            const historyArr = replaceHistory[title];
            if(historyArr) {
                for(const historyItem of historyArr) {
                    for(const sourceMapKey of Object.keys(historyItem)) {
                        writeHistoryItem(sourceMapKey, historyItem[sourceMapKey], 0);
                    }
                }
            }
        }
        const ord = ordinals[title];
        for(let i = 1; i <= ord; i++) {
            const versionKey = i === 1 ? title : `${title}÷×${i}`;
            writeHistoryItem(versionKey, sourceFiles[versionKey], i);
        }
    }
    if(all) {
        fs.writeFileSync('script/yaml-to-db/input/all-words.yml', YAML.stringify(words));
        console.log(`Összes címszó: ${Object.keys(words).length}`);
    }
}

function writeHistoryItem(sourceMapKey: string, fname: string, ordinal: number) {
    if(!ordinal) {
        const rexRes = /÷×(\d+)/.exec(sourceMapKey);
        ordinal = !rexRes ? 1 : parseInt(rexRes[1]);
    }
    console.log(`    ${ordinal}  ${fname}`);
}
