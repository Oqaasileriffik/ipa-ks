const process = require('process');
const { exec } = require('child_process');
const fs = require('fs');

process.chdir(__dirname);

let js = fs.readFileSync('../js/ipa.js', 'utf-8') + '';
eval(js.replace(/['"]use strict['"](;?)/g, ''));

let inputs = fs.readFileSync('input-ipa.txt', 'utf-8') + '';
inputs = inputs.split('\n');

let outputs = [];
for (let i=0 ; i<inputs.length ; ++i) {
	let o = do_kal_ipa_raw(inputs[i]);
	o = o.ipa;
	o = o.replace(/<span>/g, '\n<span>');
	o = o.replace(/<\/span>/g, '</span>\n');
	o = o.replace(/<span>\s*<\/span>\n/sg, '');
	o = o.replace(/\n\n+/g, '\n');
	o = o.replace(/^\s+/s, '').replace(/\s+$/s, '');
	outputs[i] = o;
}

fs.writeFileSync('output-ipa.txt', outputs.join('\n\n'));

exec('diff expected-ipa.txt output-ipa.txt', (rv, out, err) => {
	if (rv) {
		console.log(`FAILURE:\n${out}`);
	}
	else {
		console.log('SUCCESS');
	}
});
