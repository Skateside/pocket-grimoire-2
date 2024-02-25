export function supplant(
    template: string,
    replacements: Record<string, string | number> | (string | number)[]
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
