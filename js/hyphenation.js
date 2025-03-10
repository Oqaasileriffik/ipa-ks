'use strict';

let _g_old_words = {
	b: ['baaja', 'baalia', 'baaliar', 'bajeri', 'biibili', 'biili', 'biiler', 'bussi'],
	d: ['diaavulu', 'decembari'],
	f: ['farisiiari', 'februaari', 'feeria', 'feeriar', 'freer'],
	g: ['gassi', 'guuti'],
	h: ['hiisti', 'horaa', 'horaartor', 'huaa', 'huaartor'],
	j: ['januaari', 'joorli', 'joorlisior', 'jorngoq', 'juuli', 'juulli', 'juumooq', 'juuni', 'juuti'],
	l: ['laaja', 'lakker', 'lakki', 'lal\'laaq', 'lappi', 'liimmer', 'liimmi'],
	r: ['raaja', 'rinngi', 'rommi', 'russeq', 'ruua', 'ruujori', 'ruusa', 'ruusaar'],
	v: ['viinnequt', 'viinni']
	};

function kal_detect_from(token) {
	// While we potentially could handle foreign words with characters like İ (U+0130) that have Greenlandic endings, they're so rare that we won't bother
	let token_lc = token.toLowerCase();
	if (token.length != token_lc.length) {
		return token.length;
	}

	token = token_lc;
	let from = 0;

	let first = token.charAt(0);
	if (_g_old_words[first]) {
		for (let i=0 ; i<_g_old_words[first].length ; ++i) {
			if (token == _g_old_words[first][i]) {
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

function kal_hyphenate_word(token) {
	if (!token.match(/^[a-zA-ZæøåÆØÅŋ]+$/i)) {
		return token;
	}
	token = token.replace(/nng/g, '\ue000\ue000');
	token = token.replace(/ng/g, '\ue000');

	let C = /[bcdfghjklmnŋ\ue000pqrstvwxzBCDFGHJKLMNPQRSTVWXZ]/i;
	let V = /[aeiouyæøåAEIOYÆØÅ]/i;

	let i = 0;
	let split = '';
	for ( ; i<token.length-1 ; ++i) {
		split += token.charAt(i);
		if (token.charAt(i).match(V) && token.charAt(i+1).match(C) && token.charAt(i+2).match(V)) {
			split += '\u00ad'; // U+00AD is Soft Hyphen
		}
		else if (token.charAt(i).match(V) && token.charAt(i+1).match(C) && token.charAt(i+2).match(C) && token.charAt(i+3).match(V)) {
			++i;
			split += token.charAt(i);
			split += '\u00ad';
		}
		else if (token.charAt(i).toLowerCase() !== token.charAt(i+1).toLowerCase() && token.charAt(i).match(V) && token.charAt(i+1).match(V)) {
			split += '\u00ad';
		}
	}
	split += token.substr(i);

	split = split.replace(/\ue000\u00ad\ue000/g, 'n\u00adng');
	split = split.replace(/\ue000\ue000/g, 'nng');
	split = split.replace(/\ue000/g, 'ng');

	split = split.replace(/a\u00adi$/g, 'ai');

	return split;
}

function kal_hyphenate_words(txt) {
	let ws = txt.split(/(\s+)/);
	for (let i=0 ; i<ws.length ; ++i) {
		ws[i] = kal_hyphenate(ws[i]);
	}
	return ws.join('');
}

function kal_hyphenate(text) {
	let sents = text.split(/([.:!?]\s+)/);
	let hyphens = '';

	for (let ln=0 ; ln<sents.length ; ++ln) {
		let tokens = sents[ln].split(/([^\wŋæøå]+)/i);

		for (let i=0 ; i<tokens.length ; ++i) {
			let token = tokens[i];
			let from = kal_detect_from(token);
			if (!token.match(/\w+/) || from == 0) {
				hyphens += kal_hyphenate_word(token);
				continue;
			}

			hyphens += token.substr(0, from) + kal_hyphenate_word(token.substr(from));
		}
	}

	return hyphens;
}
