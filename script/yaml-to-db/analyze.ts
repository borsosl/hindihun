import * as YAML from 'yaml';
import {AnalyzeInfo, AnalyzePrevWord, OrdinalsMap, SourceFileMap, WordsMap} from './model';
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
