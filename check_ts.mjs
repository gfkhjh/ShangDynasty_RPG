const ts = require('C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
const fs = require('fs');

const file = 'assets/scripts/YinXuCity.ts';
const source = fs.readFileSync(file, 'utf8');

const result = ts.createSourceFile('YinXuCity.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

console.log('Parse diagnostics count:', result.parseDiagnostics.length);
result.parseDiagnostics.forEach((error, i) => {
    if (i < 20) {
        const pos = result.getLineAndCharacterOfPosition(error.start || 0);
        console.log({
            line: pos.line + 1,
            column: pos.character + 1,
            message: ts.flattenDiagnosticMessageText(error.messageText, '\n')
        });
    });
});