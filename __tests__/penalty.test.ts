import { calculatePenalty } from '../src/utils/penalty';

describe('Penalty Calculation', () => {
    test('should calculate penalty correctly for late returns', () => {
        const price = 50000;
        const lateDays = 2;
        // 2 days * 50000 * 2 (penalty multiplier) = 200000
        expect(calculatePenalty(price, lateDays)).toBe(200000);
    });

    test('should return 0 penalty if not late', () => {
        const price = 50000;
        const lateDays = 0;
        expect(calculatePenalty(price, lateDays)).toBe(0);
    });

    test('should return 0 if late days is negative (early return)', () => {
        const price = 50000;
        const lateDays = -1;
        expect(calculatePenalty(price, lateDays)).toBe(0);
    });
});
