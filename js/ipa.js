'use strict';

let old_words = {
	b: ["baaja", "baalia", "baaliar", "bajeri", "biibili", "biili", "biiler", "bussi"],
	d: ["diaavulu", "decembari"],
	f: ["farisiiari", "februaari", "feeria", "feeriar", "freer"],
	g: ["gassi", "guuti"],
	h: ["hiisti", "horaa", "horaartor", "huaa", "huaartor"],
	j: ["januaari", "joorli", "joorlisior", "jorngoq", "juuli", "juulli", "juumooq", "juuni", "juuti"],
	l: ["laaja", "lakker", "lakki", "lal'laaq", "lappi", "liimmer", "liimmi"],
	r: ["raaja", "rinngi", "rommi", "russeq", "ruua", "ruujori", "ruusa", "ruusaar"],
	v: ["viinnequt", "viinni"]
	};

function is_upper(ch) {
	return (ch === ch.toUpperCase() && ch !== ch.toLowerCase());
}

function ipa_kal_from(token) {
	let from = 0;

	let first = token.charAt(0);
	if (old_words[first]) {
		for (let i=0 ; i<old_words[first].length ; ++i) {
			if (token == old_words[first][i]) {
				return 0;
			}
		}
		from = 1;
	}

	if (!first.match(/[aeikmnopqstu]/)) {
		from = Math.max(from, 1);
	}

	if (token.match(/^.[bcdwxyzæøå]/)) {
		from = Math.max(from, 2);
	}

	// ToDo: 'ai' anywhere but the end signifies non-kal
	if (token.match(/^.ai/)) {
		from = Math.max(from, 3);
	}

	let eorq = /[eo]+[^eorq]/g;
	eorq.lastIndex = from;
	let re = null;
	while ((re = eorq.exec(token)) != null) {
		from = Math.max(from, re.index+2);
	}

	let last = token.charAt(token.length-1);
	if (!last.match(/[aikpqtu]/)) {
		from = Math.max(from, token.length);
	}

	let rf = null;
	if ((rf = /[^aefgijklmnopqrstuvŋ][aefgijklmnopqrstuvŋ]+$/.exec(token)) !== null) {
		from = Math.max(from, rf.index+1);
	}

	let cons = /([qwrtpsdfghjklzxcvbnmŋ])([qwrtpsdfghjklzxcvbnmŋ])/g;
	cons.lastIndex = from;
	let rv = null;
	while ((rv = cons.exec(token)) != null) {
		if (rv[1] == 'r') {
			continue;
		}
		if (rv[1] == 'n' && rv[2] == 'g') {
			continue;
		}
		if (rv[1] == 't' && rv[2] == 's') {
			continue;
		}
		if (rv[1] != rv[2]) {
			from = Math.max(from, rv.index+2);
		}
	}

	return from;
}

function kal_ipa(token) {
	if (!token.match(/^[a-zæøåŋ]+$/i)) {
		return token;
	}
	token = token.replace(/nng/g, 'ŋŋ');
	token = token.replace(/ng/g, 'ŋ');

	let C = /[bcdfghjklmnŋpqrstvwxz]/i;
	let V = /[aeiouyæøå]/i;

	let i = 0;
	let split = '';
	for ( ; i<token.length-1 ; ++i) {
		split += token.charAt(i);
		if (token.charAt(i).match(V) && token.charAt(i+1).match(C) && token.charAt(i+2).match(V)) {
			split += ' ';
		}
		else if (token.charAt(i).match(V) && token.charAt(i+1).match(C) && token.charAt(i+2).match(C) && token.charAt(i+3).match(V)) {
			++i;
			split += token.charAt(i);
			split += ' ';
		}
		else if (token.charAt(i).toLowerCase() !== token.charAt(i+1).toLowerCase() && token.charAt(i).match(V) && token.charAt(i+1).match(V)) {
			split += ' ';
		}
	}
	split += token.substr(i);
	token = split;
	token = ' ' + token + '#';

	let old = '';
	do {
		// This loop is necessary because the suffix space is part of the whole match, so next match won't see it.
		old = token;
		token = token.replace(/ ([bcdfghjklmnŋpqrstvwxz][aeiouyæøå][bcdfghjklmnŋpqrstvwxz] )/ig, ' ¹$1');
		token = token.replace(/ ([aeiouyæøå][bcdfghjklmnŋpqrstvwxz] )/ig, ' ¹$1');
	} while (old !== token);

	token = token.replace(/ ([bcdfghjklmnŋpqrstvwxz])([aeiouyæøå])(\2)/ig, ' ²$1$2$3');
	token = token.replace(/ ([aeiouyæøå])(\1)/ig, ' ²$1$2');

	token = token.replace(/(u) ([¹²]?)v([uo])/ig, '$1 $2<sup>w</sup>$3');
	token = token.replace(/(u) ([¹²]?)([aeiouyæøå])/ig, '$1 $2<sup>w</sup>$3');
	token = token.replace(/(i) ([¹²]?)([uoa])/ig, '$1 $2<sup>j</sup>$3');

	token = token.replace(/ ([¹²]?)g/ig, ' $1ɣ');
	token = token.replace(/r ([¹²]?)r/ig, 'χ $1χ');
	token = token.replace(/g ([¹²]?)ɣ/ig, 'x $1x');
	token = token.replace(/ ([¹²]?)r/ig, ' $1ʁ');

	token = token.replace(/ee( ?[¹²]?[ʁqrχ])/ig, 'ɜ:$1');
	token = token.replace(/e( ?[¹²]?[ʁqrχ])/ig, 'ɜ$1');
	token = token.replace(/oo( ?[¹²]?[ʁqrχ])/ig, 'ɔ:$1');
	token = token.replace(/o( ?[¹²]?[ʁqrχ])/ig, 'ɔ$1');
	token = token.replace(/aa( ?[¹²]?[ʁqrχ])/ig, 'ɑ:$1');
	token = token.replace(/a( ?[¹²]?[ʁqrχ])/ig, 'ɑ$1');

	token = token.replace(/t( ?[iɜ])/ig, 't<sup>s</sup>$1');
	token = token.replace(/t ([¹²]?)s/ig, 't $1t<sup>s</sup>');
	token = token.replace(/[bcdfghjklmnŋpqrstvwxz] ([¹²]?)([bcdfghjklmnŋpqrstvwxz])/ig, '$2 $1$2');
	token = token.replace(/l l/ig, 'ɬ ɬ');
	token = token.replace(/l ¹l/ig, 'ɬ ¹ɬ');
	token = token.replace(/l ²l/ig, 'ɬ ²ɬ');
	token = token.replace(/t<sup>s<\/sup>t<sup>s<\/sup>/ig, 'tt<sup>s</sup>');
	token = token.replace(/([aeiouyæøå])\1/ig, '$1:');

	token = token.replace(/ a( ?[tns])/ig, ' ɛ$1');

	token = token.substr(1, token.length);
	return token;
}

function kal_ipa_words(txt) {
	let ws = txt.split(/\s+/g);
	for (let i=0 ; i<ws.length ; ++i) {
		ws[i] = kal_ipa(ws[i]);
		ws[i] = ws[i].substr(0, ws[i].length-1);
	}
	return ws.join(' ');
}

let abbrs = [
	[/\b([Ss])ap\./g, '$1apaatip']
];

function do_kal_ipa_raw(text) {
	for (let i=0 ; i<abbrs.length ; ++i) {
		text = text.replace(abbrs[i][0], abbrs[i][1]);
	}

	let sents = text.split(/([.:!?]\s+)/);
	let detect = '';
	let ipa = '';

	for (let ln=0 ; ln<sents.length ; ++ln) {
		let tokens = sents[ln].split(/([^\wŋæøå]+)/i);
		let rvs = [];

		for (let i=0 ; i<tokens.length ; ++i) {
			let token = tokens[i];
			let rv = ipa_kal_from(token.toLowerCase());
			rvs.push(rv);
		}

		for (let i=0 ; i<tokens.length ; ++i) {
			let token = tokens[i];
			if (!token.match(/\w+/) || rvs[i] == 0) {
				ipa += '<span>'+kal_ipa(token.toLowerCase())+'</span>';
				detect += token;
				continue;
			}

			ipa += '<b>' + token.substr(0, rvs[i]) + '</b> ' + kal_ipa(token.substr(rvs[i]));
			detect += '<b>' + token.substr(0, rvs[i]) + '</b>' + token.substr(rvs[i]);
		}
	}

	return {detect: detect, ipa: ipa};
}

// If jQuery is loaded, set up automatics
if (typeof $ !== 'undefined') {
	function do_kal_ipa() {
		let text = $('#input-ipa').val().replace("\r\n", "\n").replace(/^\s+/, '').replace(/\s+$/, '');

		let rv = do_kal_ipa_raw(text);

		$('#detected').html(rv.detect.replace(/\n/g, "<br/>\n"));
		$('#ipa').html('[' + rv.ipa.replace(/\n/g, "<br/>\n") + ']');
	}

	$(function() {
		if ($('#input-ipa').length) {
			$('#input-ipa').change(do_kal_ipa);
			do_kal_ipa();
		}
	});
}
