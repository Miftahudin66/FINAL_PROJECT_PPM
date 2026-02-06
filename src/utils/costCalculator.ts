export const calculateRentalCost = (pricePerDay: number, startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date');
    }

    // Time difference in milliseconds
    const diffTime = end.getTime() - start.getTime();

    // Convert to days (ceil to charge for partial days as full days or just simple diff)
    // Assuming strict 24h periods, but for rental usually any part of a day counts or just date diff
    // Let's use simple date diff inclusive? or just diff days.
    // Standard logic: if same day, 1 day?
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Ensure at least 1 day
    const days = diffDays > 0 ? diffDays : 1;

    return pricePerDay * days;
};
