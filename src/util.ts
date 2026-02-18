const DATE_TOLERANCE_MS = 1000; // 1 second tolerance

export function dateEqual(date1: Date, date2: Date): boolean {
    return Math.abs(date1.getTime() - date2.getTime()) < DATE_TOLERANCE_MS;
}
