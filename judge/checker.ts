export function identical_checker(output: string, expected: string) {
    return output === expected;
}
export function ignoreWs_checker(output: string, expected: string) {
    output = output.replace(/\s+/g, "");
    expected = expected.replace(/\s+/g, "");
    return output === expected;
}
export function standard_checker(output: string, expected: string) {
    let outputArr = output.split('\n');
    let expectedArr = expected.split('\n');
    if (outputArr.length != expectedArr.length) {return false;}
    for (let i = 0; i < outputArr.length; i++) {
        if (!ignoreWs_checker(outputArr[i], expectedArr[i])) {return false;}
    }
    return true;
}

export function checker(output: string, expected: string, options: any = {
    checker: "identical"
}) {
    return identical_checker(output, expected);
}