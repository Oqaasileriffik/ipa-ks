var old_words = {
	a: ["augustuse", "aprîle"],
	b: ["bâja", "bâlia", "bâliar", "bajere", "binsîna", "bîbile", "bîle", "bîler", "bilíte", "børnehave"],
	d: ["danskeĸ", "diâvulo", "decembare"],
	f: ["farisîare", "februâre", "fêria", "fêriar", "filmer", "filmeriar", "filme", "frêr"],
	g: ["gáse", "gigte", "gipse", "gomôrnêr", "gymnasia", "guitare", "gûte"],
	h: ["hîste", "horâ", "horârtor", "huâ", "huârtor"],
	j: ["januâre", "jôrle", "jôrlisior", "jorngoĸ", "jûle", "jûlle", "jûmôĸ", "jûne", "jûte"],
	k: ["kláse", "kûlte"],
	l: ["lâja", "láker", "láke", "lal'lâq", "lápe", "lastbîle", "linia", "lĩmer", "lĩme"],
	m: ["ministere", "ministeriuneĸ"],
	n: ["néte", "novembare"],
	p: ["politî", "politikere", "politíke"],
	r: ["râja", "râtio", "rínge", "róme", "rúseĸ", "rûa", "rûjore", "rûsa", "rûsâr"],
	s: ["septembare", "sikunte", "silveĸ", "skû"],
	t: ["taxa", "taxar"],
	v: ["vĩneĸut", "vĩni"]
};

function is_upper(ch) {
	return (ch === ch.toUpperCase() && ch !== ch.toLowerCase());
}

function klein_kal_from(token) {
	var from = 0;

	var first = token.charAt(0);
	if (old_words[first]) {
		for (var i=0 ; i<old_words[first].length ; ++i) {
			if (token == old_words[first][i]) {
				return 0;
			}
		}
	}

	if (!first.match(/[aáâãeêiíîĩkmnoôpĸstuúûũ]/)) {
		from = Math.max(from, 1);
	}

	if (token.match(/^.[bcwxyzæøå]/)) {
		from = Math.max(from, 2);
	}

	var eorq = /[eo]+[^eorqĸ]/g;
	eorq.lastIndex = from;
	while ((rv = eorq.exec(token)) != null) {
		from = Math.max(from, rv.index+2);
	}

	if (!token.match(/[aekpĸtu]|ai$/)) {
		from = Math.max(from, token.length);
	}

	var cons = /([qwrtpsdfghjkĸlzxcvbnŋm])([qwrtpsdfghjkĸlzxcvbnŋm])/g;
	cons.lastIndex = from;
	var rv = null;
	while ((rv = cons.exec(token)) != null) {
		if (rv[1] == 'r') {
			continue;
		}
		if (token.substr(rv.index).match(/^(gdl|gf|gp|gs|gss|gt|gk|ng|ngm|ngn|rĸ|tdl|ts|vdl|vf|vn|vs)/)) {
			continue;
		}
		if (rv[1] != rv[2]) {
			from = Math.max(from, rv.index+2);
		}
	}

	return from;
}

function kal_klein2new(token) {
	if (!token.match(/^[a-zæøåĸssáuáiâáãêíîĩôúûũ']+$/i)) {
		return token;
	}

	var U = /[qr]/i;
	var C = /[bcdfghjklmnŋpstvwxz\ue002]/i;
	var V = /[aeiouyæøå]/i;

	token = token.replace(/ai$/, '\ue000');
	token = token.replace(/ts/g, '\ue001');

	token = token.replace(/^suja/g, 'sia');
	token = token.replace(/^sujo/g, 'sio');
	token = token.replace(/^suju/g, 'siu');

	token = token.replace(/k'/g, 'q');
	token = token.replace(/dl/g, 'l');
	token = token.replace(/ng/g, 'ŋ');
	token = token.replace(/ĸ/g, 'q');
	token = token.replace(/ss/g, 's');
	token = token.replace(/áu/g, 'aa\ue002');
	token = token.replace(/ái/g, 'aa\ue002');
	token = token.replace(/â/g, 'aa');
	token = token.replace(/á/g, 'a\ue002');
	token = token.replace(/ã/g, 'aa\ue002');
	token = token.replace(/ê/g, 'ee');
	token = token.replace(/í/g, 'i\ue002');
	token = token.replace(/î/g, 'ii');
	token = token.replace(/ĩ/g, 'ii\ue002');
	token = token.replace(/ô/g, 'oo');
	token = token.replace(/ú/g, 'u\ue002');
	token = token.replace(/û/g, 'uu');
	token = token.replace(/ũ/g, 'uu\ue002');

	token = token.replace(/ae/g, 'aa');
	token = token.replace(/ai/g, 'aa');
	token = token.replace(/ao/g, 'aa');
	token = token.replace(/au/g, 'aa');
	token = token.replace(/[bcdfghjklmnŋpstvwxz\ue002]([bcdfghjklmnŋpstvwxz\ue002])/ig, '$1$1');

	token = token.replace(/e$/, 'i');
	token = token.replace(/o$/, 'u');
	token = token.replace(/ŋŋ/g, 'nng');
	token = token.replace(/ŋ/g, 'ng');
	token = token.replace(/rq/g, 'qq');
	token = token.replace(/uv([iea])/g, 'u$1');
	token = token.replace(/tt([ie])/g, 'ts$1');

	token = token.replace(/\ue000$/, 'ai');
	token = token.replace(/\ue001/g, 'ts');

	return token;
}

function do_kal_kleinschmidt() {
	var text = $('#input-kleinschmidt').val().replace("\r\n", "\n").replace(/^\s+/, '').replace(/\s+$/, '');

	var sents = text.split(/([.:!?]\s+)/);
	var converted = '';

	for (var ln=0 ; ln<sents.length ; ++ln) {
		var tokens = sents[ln].split(/([^\wæøåĸssáuáiâáãêíîĩôúûũ']+)/i);

		var firstword = true;
		for (var i=0 ; i<tokens.length ; ++i) {
			var token = tokens[i].toLowerCase();
			if (token.match(/\w+/)) {
				var rv = klein_kal_from(token);
				var before = '';
				var after = token;
				if (rv != 0) {
					before = '<b>' + tokens[i].substr(0, rv) + '</b>';
					after = token.substr(rv);
				}
				after = kal_klein2new(after);
				token = before + after;
				if (firstword || is_upper(tokens[i].charAt(0))) {
					token = token.substr(0, 1).toUpperCase() + token.substr(1);
					firstword = false;
				}
			}

			converted += token;
		}
	}

	$('#output-kleinschmidt').html(converted.replace(/\n/g, "<br/>\n"));
}

$(function() {
	if ($('#input-kleinschmidt').length) {
		$('#input-kleinschmidt').change(do_kal_kleinschmidt);
		do_kal_kleinschmidt();
	}
});