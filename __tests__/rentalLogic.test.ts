import { calculateRentalCost } from '../src/utils/costCalculator';

describe('Rental Cost Calculation', () => {
    it('should calculate cost for a single day', () => {
        const cost = calculateRentalCost(100, '2023-10-01', '2023-10-02');
        expect(cost).toBe(100);
    });

    it('should calculate cost for multiple days', () => {
        const cost = calculateRentalCost(50, '2023-10-01', '2023-10-06'); // 5 days
        expect(cost).toBe(250);
    });

    it('should handle same day return as 1 day', () => {
        const cost = calculateRentalCost(100, '2023-10-01', '2023-10-01');
        expect(cost).toBe(100);
    });

    it('should throw error for invalid dates', () => {
        expect(() => calculateRentalCost(100, 'invalid', '2023-10-01')).toThrow('Invalid date');
    });
});
