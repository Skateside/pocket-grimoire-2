export function toHTML(raw: string): string {
    return raw.replace(/\*\*([^*]*)\*\*/g, "<strong>$1</strong>");
}

export function strip(raw: string): string {
    return raw.replace(/\*\*/g, "");
}
