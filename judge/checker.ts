/**
 * All whitespace must match.
 */
export function identical_checker(output: string, expected: string): boolean {
    return output === expected;
}
/**
 * All non-whitespace must match.
 */
export function ignoreWs_checker(output: string, expected: string): boolean {
    output = output.replace(/\s+/g, "");
    expected = expected.replace(/\s+/g, "");
    return output === expected;
}
/**
 * All non-whitespace, non-newline must match.
 */
export function standard_checker(output: string, expected: string): boolean {
    let outputArr = output.split('\n');
    let expectedArr = expected.split('\n');
    if (outputArr.length != expectedArr.length) {return false;}
    for (let i = 0; i < outputArr.length; i++) {
        if (!ignoreWs_checker(outputArr[i], expectedArr[i])) {return false;}
    }
    return true;
}

/**
 * Configurable checker.
 */
export function checker(output: string, expected: string, options: any = {
    checker: "identical"
}): boolean {
    output = output.replace("\r", "");
    expected = expected.replace("\r", "");
    return identical_checker(output, expected);
}