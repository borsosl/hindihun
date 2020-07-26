import {getFile, storeFile} from '../main/helper/storage';

xdescribe('Cloud storage', () => {
    it('should write json file', async () => {
        const json = JSON.stringify({
            test: 123
        });
        try {
            const res = await storeFile('test.json', json);
            console.log(JSON.stringify(res));
        } catch (err) {
            console.log(JSON.stringify(err));
        }
    });

    it('should read json file', async () => {
        try {
            const res = await getFile('test.json');
            console.log(JSON.parse(res));
        } catch (err) {
            console.log(JSON.stringify(err));
        }
    });
});
