export function parseNumeric(value) {
    if (value === null)
        return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}
