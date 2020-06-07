import {Szavak} from '../../../../../script/common/schema';

export interface SolrResult {
    response: SolrResponse;
}

export interface SolrResponse {
    numFound: number;
    start: number;
    docs: SolrDoc[];
    // UI
    input?: string;
    hits?: Szavak[];
}

export interface SolrDoc {
    doc: string;
}
