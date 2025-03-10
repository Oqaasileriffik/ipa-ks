const fs = require('fs');

let $ = function(){};
let window = {};

let js = fs.readFileSync(__dirname + '/hyphenation.js', 'utf-8') + '';
js = js.replace(/['"]use strict['"](;?)/g, '');
eval(js);

let tests = [
    'a-naa-na',
    'a-taa-ta',
    'aa-naa',
    'aa-taa',
    'ta-si-or-pai',
    'i-li-ar-suk',
    'ma-ni-o-rar-pai',
    'ar-laq',
    'sak-ku',
    'paf-fik',
    'tip-pi',
    'at-si-or-poq',
    'a-neer-mat',
    'ar-pal-lu-ni',
    'a-neer-lu-ni',
    'a-ngi-voq',
    'ti-ngi-voq',
    'a-nga-la-voq',
    'pin-ngor-poq',
    'qan-ngor-poq',
    'aan-ngar-poq',
    ];

for (let i=0 ; i<tests.length ; ++i) {
    let h = tests[i];
    let r = tests[i].replace(/-/g, '');
    let rv = kal_hyphenate(r).replace(/\u00ad/g, '-');
    if (rv !== h) {
        console.log(`ERROR: ${r} returned ${rv}, but should be ${h}`);
    }
}
