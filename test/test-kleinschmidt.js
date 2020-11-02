const process = require('process');
const { exec } = require('child_process');
const fs = require('fs');

process.chdir(__dirname);

let js = fs.readFileSync('../js/kleinschmidt.js', 'utf-8') + '';
eval(js.replace(/['"]use strict['"](;?)/g, ''));

let inputs = fs.readFileSync('input-kleinschmidt.txt', 'utf-8') + '';
inputs = inputs.split('\n');

let outputs = [];
for (let i=0 ; i<inputs.length ; ++i) {
	let o = do_kal_kleinschmidt_raw(inputs[i]);
	o = o.replace(/\s+/sg, '\n');
	o = o.replace(/^\s+/s, '').replace(/\s+$/s, '');
	outputs[i] = o;
}

fs.writeFileSync('output-kleinschmidt.txt', outputs.join('\n\n'));

exec('diff expected-kleinschmidt.txt output-kleinschmidt.txt', (rv, out, err) => {
	if (rv) {
		console.log(`FAILURE:\n${out}`);
	}
	else {
		console.log('SUCCESS');
	}
});
