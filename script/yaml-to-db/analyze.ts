import * as YAML from 'yaml';
import {
    AnalyzeInfo,
    AnalyzePrevWord,
    OrdinalsMap,
    ReplaceHistory,
    SourceFileMap,
    WordsMap
} from './model';
import {Szavak} from '../common/schema';

export function analyze(wordEntry: Szavak, words: WordsMap, ordinals: OrdinalsMap, sourceFiles: SourceFileMap) {
    let ord = ordinals[wordEntry.szo] || 1;
    const old: AnalyzePrevWord[] = [];
    for(let i = 1; i <= ord; i++) {
        const versionKey = i === 1 ? wordEntry.szo : `${wordEntry.szo}÷×${i}`;
        old.push({
            sourceFile: sourceFiles[versionKey],
            word: words[versionKey]
        });
    }
    const info: AnalyzeInfo = {
        newWord: wordEntry,
        oldWords: old
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
}

function writeHistoryItem(sourceMapKey: string, fname: string, ordinal: number) {
    if(!ordinal) {
        const rexRes = /÷×(\d+)/.exec(sourceMapKey);
        ordinal = !rexRes ? 1 : parseInt(rexRes[1]);
    }
    console.log(`    ${ordinal}  ${fname}`);
}
