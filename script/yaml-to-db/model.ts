import {Szavak} from '../common/schema';

export interface WordsMap {
    [key: string]: Szavak
}

export interface OrdinalsMap {
    [key: string]: number
}

export interface SourceFileMap {
    [key: string]: string;
}

export interface AnalyzePrevWord {
    sourceFile: string;
    word: Szavak;
}

export interface AnalyzeInfo {
    newWord: Szavak;
    oldWords: AnalyzePrevWord[];
}

export interface SolrHindihunDocument {
    doc: string;
    title: string;
    hindi: string;
    trans: string;
    hun: string;
    lex: string;
}
