import {processLine} from '../process-unicode-text';

describe('Unicode to KTRANS', () => {
    it('should start new syllable on dash', () => {
        let kt = processLine('अर्थ-दंड');
        expect(kt).toBe('arth-da#D');
    });

    it('should not insert pending viram after ending dash', () => {
        let kt = processLine('अंतर्-');
        expect(kt).toBe('a#tar_-');
    });
});
