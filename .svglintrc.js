module.exports = {
    rules: {
        custom: [
            // Avoid non-svg data images
            (reporter, $, ast) => {
                reporter.name = 'non-svg';

                const dataImagePattern = /data:image\/(?<extension>[a-zA-Z]+);base64,/;
                const dataImageMatched = dataImagePattern.exec(ast.source);

                if (dataImageMatched) {
                    const extension = dataImageMatched.groups['extension'].toLowerCase();
                    if (extension !== 'svg') {
                        reporter.error(`Found data image \`${extension}\``);
                    }
                }
            },
        ],
    },
};
