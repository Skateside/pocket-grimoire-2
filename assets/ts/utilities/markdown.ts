/**
 * Converts the given markdown into a string of HTML.
 *
 * @param raw String containing markdown.
 * @returns String containing HTML.
 */
export function toHTML(raw: string): string {
    return raw.replace(/\*\*([^*]*)\*\*/g, "<strong>$1</strong>");
}

/**
 * Removes any markdown from the given string.
 *
 * @param raw String containing markdown.
 * @returns String with the markdown removed.
 */
export function strip(raw: string): string {
    return raw.replace(/\*\*/g, "");
}
