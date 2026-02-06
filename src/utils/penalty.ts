/**
 * Calculates the penalty for late returns.
 * @param rentalPricePerDay Price of the item per day
 * @param lateDays Number of days the item is late
 * @returns Total penalty amount (Late Days * Price * 2) - Double price penalty
 */
export const calculatePenalty = (rentalPricePerDay: number, lateDays: number): number => {
    if (lateDays <= 0) return 0;
    return lateDays * rentalPricePerDay * 2;
};
