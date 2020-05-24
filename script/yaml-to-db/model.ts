import {Szavak} from '../common/schema';

export interface WordsMap {
    [key: string]: Szavak
}

export interface OrdinalsMap {
    [key: string]: number
}

export interface SolrHindihunDocument {
    article: string;
    title: string;
    hindi: string;
    trans: string;
    hun: string;
    lex: string;
}
