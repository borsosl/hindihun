import {createDailyPasses} from '../main/service/password.service';

describe('Password service', () => {
    it('should create passwords', async () => {
        const [created, createCount, dailyPass] = createDailyPasses({}, new Date());
        const keys = Object.keys(created);
        expect(keys.length).toBe(7);
        expect(createCount).toBe(7);
        expect(dailyPass.length).toBe(8);
    });

    it('should update passwords partially', async () => {
        let stored = createDailyPasses(
            {},
            new Date(new Date().getTime() - 2 * 24 * 60 * 60000)
        )[0];
        let [created, createCount] = createDailyPasses(stored, new Date());
        expect(createCount).toBe(2);
        expect(created[Object.keys(created)[1]]).toBe(stored[Object.keys(stored)[3]]);
    });

    it('should not update passwords on same day', async () => {
        let stored = createDailyPasses({}, new Date())[0];
        let createCount = createDailyPasses(stored, new Date())[1];
        expect(createCount).toBe(0);
    });
});
