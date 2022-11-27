export const EmptyString = "";

/**
 * Indicates whether the string is null or empty.
 * @param text
 */
 export function isNullOrEmpty(text: string | null | undefined): text is null | undefined | "" {
    return text == null || text === EmptyString;
}

export function takeFirstNotNullOrEmpty(record: Record<string, string>, keys: string[]): string | undefined {
    for (const key of keys) {
        if (record[key.toLowerCase()] != null) {
            return record[key.toLowerCase()];
        }
    }
}
