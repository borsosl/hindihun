ALTER DATABASE hindihun SET default_text_search_config = 'simple';

CREATE TABLE word
(
    title       text NOT NULL,
    ordinal     text NOT NULL,
    article     jsonb NOT NULL,
    fts_title   tsvector,
    fts_hindi   tsvector,
    fts_trans   tsvector,
    fts_hun     tsvector,
    fts_lex     tsvector,
    PRIMARY KEY (title, ordinal)
);

CREATE INDEX idx_word_fts_title ON word USING GIN (fts_title);
CREATE INDEX idx_word_fts_hindi ON word USING GIN (fts_hindi);
CREATE INDEX idx_word_fts_trans ON word USING GIN (fts_trans);
CREATE INDEX idx_word_fts_hun ON word USING GIN (fts_hun);
CREATE INDEX idx_word_fts_lex ON word USING GIN (fts_lex);

CREATE OR REPLACE FUNCTION word_fts_trigger_fn() RETURNS trigger AS $$
begin
    new.fts_title := to_tsvector(
        new.article->>'szo' || ' ' ||
        coalesce(new.article->>'lasd' || ' ', '') ||
        array_to_string(
            array(select jsonb_array_elements(new.article->'alt'))
        , ' ')
    );
    new.fts_hindi := to_tsvector(
        new.article->>'szo' || ' ' ||
        coalesce(new.article->>'lasd' || ' ', '') ||
        array_to_string(
            array(select jsonb_array_elements(new.article->'alt')) ||
            array(select jsonb_array_elements(new.article->'ford')->'kif') ||
            array(select jsonb_array_elements(jsonb_array_elements(new.article->'ford')->'var')->'alak') ||
            array(select jsonb_array_elements(jsonb_array_elements(new.article->'ford')->'pl')->'ered') ||
            array(select jsonb_array_elements(new.article->'ford')->'szin') ||
            array(select jsonb_array_elements(new.article->'ford')->'ant')
        , ' ')
    );
    new.fts_trans := to_tsvector(
        array_to_string(
            array(select jsonb_array_elements(jsonb_array_elements(new.article->'ford')->'ert')->'szo')
        , ' ')
    );
    new.fts_hun := to_tsvector(
        array_to_string(
            array(select jsonb_array_elements(jsonb_array_elements(new.article->'ford')->'ert')->'szo') ||
            array(select jsonb_array_elements(jsonb_array_elements(new.article->'ford')->'ert')->'megj') ||
            array(select jsonb_array_elements(jsonb_array_elements(new.article->'ford')->'pl')->'ford')
        , ' ')
    );
    new.fts_lex := to_tsvector(
        array_to_string(
            array(select jsonb_array_elements(new.article->'ford')->'lex')
        , ' ')
    );
    return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER word_fts_trigger BEFORE INSERT OR UPDATE
    ON word FOR EACH ROW EXECUTE PROCEDURE word_fts_trigger_fn();
