'use strict';

var old_words = {
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
	var from = 0;

	var first = token.charAt(0);
	if (old_words[first]) {
		for (var i=0 ; i<old_words[first].length ; ++i) {
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

	var eorq = /[eo]+[^eorq]/g;
	eorq.lastIndex = from;
	while ((rv = eorq.exec(token)) != null) {
		from = Math.max(from, rv.index+2);
	}

	var last = token.charAt(token.length-1);
	if (!last.match(/[aikpqtu]/)) {
		from = Math.max(from, token.length);
	}

	var rv = null;
	if ((rv = /[^aefgijklmnopqrstuv][aefgijklmnopqrstuv]+$/.exec(token)) !== null) {
		from = Math.max(from, rv.index+1);
	}

	var cons = /([qwrtpsdfghjklzxcvbnm])([qwrtpsdfghjklzxcvbnm])/g;
	cons.lastIndex = from;
	var rv = null;
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

	var C = /[bcdfghjklmnŋpqrstvwxz]/i;
	var V = /[aeiouyæøå]/i;

	var i = 0;
	var split = '';
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

	token = token.replace(/ ([bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå]#)/ig, ' ¹$1');
	token = token.replace(/ ([bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå][bcdfghjklmnŋpqrstvwxz]#)/ig, ' ¹$1');
	token = token.replace(/ ([aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå]#)/ig, ' ¹$1');
	token = token.replace(/ ([aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [aeiouyæøå][bcdfghjklmnŋpqrstvwxz]#)/ig, ' ¹$1');
	token = token.replace(/ ([bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå] [bcdfghjklmnŋpqrstvwxz][aeiouyæøå][bcdfghjklmnŋpqrstvwxz]#)/ig, ' ¹$1');

	do {
		// This loop is necessary because the suffix space is part of the whole match, so next match won't see it.
		var old = token;
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
	var ws = txt.split(/\s+/g);
	for (var i=0 ; i<ws.length ; ++i) {
		ws[i] = kal_ipa(ws[i]);
		ws[i] = ws[i].substr(0, ws[i].length-1);
	}
	return ws.join(' ');
}

var abbrs = [
	[/\b([Ss])ap\./g, '$1apaatip']
];

function do_kal_ipa() {
	var text = $('#input-ipa').val().replace("\r\n", "\n").replace(/^\s+/, '').replace(/\s+$/, '');
	for (var i=0 ; i<abbrs.length ; ++i) {
		text = text.replace(abbrs[i][0], abbrs[i][1]);
	}

	var sents = text.split(/([.:!?]\s+)/);
	var detect = '';
	var ipa = '';

	for (var ln=0 ; ln<sents.length ; ++ln) {
		var tokens = sents[ln].split(/([^\wæøå]+)/i);
		var rvs = [];

		for (var i=0 ; i<tokens.length ; ++i) {
			var token = tokens[i];
			var rv = ipa_kal_from(token.toLowerCase());
			rvs.push(rv);
		}

		for (var i=0 ; i<tokens.length ; ++i) {
			var token = tokens[i];
			if (!token.match(/\w+/) || rvs[i] == 0) {
				ipa += '<span>'+kal_ipa(token.toLowerCase())+'</span>';
				detect += token;
				continue;
			}

			ipa += '<b>' + token.substr(0, rvs[i]) + '</b> ' + kal_ipa(token.substr(rvs[i]));
			detect += '<b>' + token.substr(0, rvs[i]) + '</b>' + token.substr(rvs[i]);
		}
	}

	$('#detected').html(detect.replace(/\n/g, "<br/>\n"));
	$('#ipa').html('[' + ipa.replace(/\n/g, "<br/>\n") + ']');
}

$(function() {
	if ($('#input-ipa').length) {
		$('#input-ipa').change(do_kal_ipa);
		do_kal_ipa();
	}
});
