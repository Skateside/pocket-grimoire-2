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

export function randomId(prefix = "") {

    const random = window
        .crypto
        .getRandomValues(new Uint32Array(1))[0]
        .toString(36);

    return `${prefix}${random}`;

}
