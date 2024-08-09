import {
    unique,
} from "./arrays";
import {
    random,
} from "./numbers";

/**
 * Takes a string containing placeholders (denoted between `{` and `}`) and
 * replaces them with the entries in `replacements`.
 *
 * @param template String containing placeholders.
 * @param replacements Replacements for those placeholders.
 * @returns A string with the placeholders replaced.
 *
 * @example
 * supplant("Hello {thing}", { thing: "world" }); // "Hello world"
 * supplany("Count: {0}", [1]); // "Count: 1"
 */
export function supplant(
    template: string,
    replacements: Record<string, number | string> | (number | string)[],
) {

    return template.replace(/\{([^{}]*)\}/g, (whole: string, index: string) => {

        return String(
            Object.hasOwn(replacements, index)
            ? (
                Array.isArray(replacements)
                ? replacements[Number(index)]
                : replacements[index]
            )
            : whole
        );

    });

}

/**
 * Generates a random ID containing letters and numbers.
 *
 * @param prefix Optional prefix for the ID.
 * @returns A random id.
 */
export function randomId(prefix = "") {

    const rand = random().toString(16).slice(2);
    const date = Date.now().toString(36);

    return `${prefix}${rand}${date}`;

}

/**
 * Takes a space-separated collection of words and returns a de-duplicated array
 * of those words. If the given `text` is blank, an empty array is returned.
 *
 * @param text Text whose words should be returned.
 * @returns Array of unique words.
 */
export function wordlist(text: string) {

    const trimmed = text.trim();

    return (
        trimmed
        ? unique(trimmed.split(/\s+/))
        : []
    );

}

/**
 * Interprets the bytes within a string as UTF-8. We need this when importing
 * JSON - for some reason it struggles to understand accented characters.
 *
 * @param bytes String to convert into UTF-8.
 * @return Converted string.
 * @see https://stackoverflow.com/a/24282873/557019
 */
export function readUTF8(bytes: string) {

    const {
        length
    } = bytes;
    let index = bytes.slice(0, 3) === "\xEF\xBB\xBF" ? 3 : 0;
    let string = "";

    while (index < length) {

        const byte1 = (bytes[index] || "").charCodeAt(0);
        const byte2 = (bytes[index + 1] || "").charCodeAt(0);
        const byte3 = (bytes[index + 2] || "").charCodeAt(0);
        const byte4 = (bytes[index + 3] || "").charCodeAt(0);

        if (byte1 < 0x80) {
            string += String.fromCharCode(byte1);
        } else if (byte1 >= 0xC2 && byte1 < 0xE0) {

            string += String.fromCharCode(
                ((byte1 & 0x1F) << 6)
                + (byte2 & 0x3F)
            );
            index += 1;

        } else if (byte1 > 0XE0 && byte1 < 0xF0) {

            string += String.fromCharCode(
                ((byte1 & 0xFF) << 12)
                + ((byte2 & 0x3F) << 6)
                + (byte3 & 0x3F)
            );
            index += 2;

        } else if (byte1 >= 0xF0 && byte1 < 0xF5) {

            let codepoint = (
                ((byte1 & 0x07) << 18)
                + ((byte2 & 0x3F) << 12)
                + ((byte3 & 0x3F) << 6)
                + (byte4 & 0x3F)
            );
            codepoint -= 0x10000;
            string += String.fromCharCode(
                (codepoint >> 10) + 0xD800,
                (codepoint & 0x3FF) + 0xDC00,
            );
            index += 3;

        }

        index += 1;

    }

    return string;

}
