const ts = require('C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
const fs = require('fs');

const file = 'assets/scripts/YinXuCity.ts';
const source = fs.readFileSync(file, 'utf8');

const program = ts.createProgram({
  rootNames: ['assets/scripts/YinXuCity.ts'],
  options: {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ES2015,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
  }
});

const sourceFile = program.getSourceFile('assets/scripts/YinXuCity.ts');
if (!sourceFile) {
  console.log('Source file not found in program');
  process.exit(1);
}

const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceFile);
console.log('Syntactic diagnostics:', syntacticDiagnostics.length);

const semanticDiagnostics = program.getSemanticDiagnostics(sourceFile);
console.log('Semantic diagnostics:', semanticDiagnostics.length);

const allDiagnostics = ts.getPreEmitDiagnostics(ts.createProgram({
  rootNames: ['assets/scripts/YinXuCity.ts'],
  options: {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ES2015,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
  }
}));

console.log('Pre-emit diagnostics:', allDiagnostics.length);

if (allDiagnostics.length > 0) {
  allDiagnostics.slice(0, 20).forEach((error, i) => {
    if (i < 20) {
      const pos = error.file?.getLineAndCharacterOfPosition(error.start || 0);
      console.log({
        line: pos?.line + 1,
        column: pos?.character + 1,
        message: require('C:/ProgramData/cocos/editors/Creator/3.8.8/resources/resources/3d/engine/node_modules/typescript/lib/typescript.js').flattenDiagnosticMessageText(error.messageText, '\n')
      });
    }
  });
}