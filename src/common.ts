export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === "undefined" || obj === null;
}

export const EmptyString = "";

/**
 * Indicates whether the string is null or empty.
 * @param text
 */
 export function isNullOrEmpty(text: string | null | undefined): text is null | undefined | "" {
    return isNullOrUndefined(text) || text === EmptyString;
}

export function takeFirstNotNullOrEmpty(record: Record<string, string>, keys: string[]): string | undefined {
    for (const key of keys) {
        if (!isNullOrUndefined(record[key.toLowerCase()])) {
            return record[key.toLowerCase()];
        }
    }
}
