/**
 * Similarity.js v0.1
 **/

(function(){
	
	var S = this.similarity = {},
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty;

	S.sort = function similaritySort(array, subject) {
		return S.defaultSorter.sort(array, subject);
	};

	S.weight = function similarityWeight(a, b) {
		return S.defaultSorter._calcWeight(S._getLargestMatch(b, S.defaultSorter._generateSubjectRegex(a)), a);
	};

	S.Sorter = function(config, array) {
		return new Sorter(config, array);
	};

	function Sorter(config, array) {

		config || (config = {});

		this._array = array;

		this._bounds = config.bounds || ['\\s'];
		this._subArrayWeightOperation = config.subArrayWeightOperation &&
			(
				typeof config.subArrayWeightOperation == 'function' ?
					config.subArrayWeightOperation :
					S.Sorter.subArrayWeightOperations[config.subArrayWeightOperation]
			) || S.Sorter.subArrayWeightOperations.max;

		this._weights = {
			matchInSubjectLength: 1,
			matchInSubjectIndex: 1,
			matchInValueLength: 0,
			matchInValueIndex: 1
		};

		if (config.weights) for (var i in this._weights) {
			if (hasOwn.call(config.weights, i)) {
				this._weights[i] = config.weights[i];
			}
		}

		this._generateBoundRegex();

	}

	S.Sorter.subArrayWeightOperations = {
		max: function(subArray, subjectRegex, subject, isRegexSearch) {
			for (var max, l = subArray.length; l--;) {
				max = Math.max(
					max || 0,
					this._calcWeight(S._getLargestMatch(subArray[l], subjectRegex), subject, isRegexSearch)
				);
			}
			return max;
		},
		min: function(subArray, subjectRegex, subject, isRegexSearch) {
			for (var min, l = subArray.length; l--;) {
				min = Math.min(
					min || 1,
					this._calcWeight(S._getLargestMatch(subArray[l], subjectRegex), subject, isRegexSearch)
				);
			}
			return min;
		},
		avg: function(subArray, subjectRegex, subject, isRegexSearch) {
			for (var total = 0, l = subArray.length; l--;) {
				total += this._calcWeight(S._getLargestMatch(subArray[l], subjectRegex), subject, isRegexSearch);
			}
			return total / subArray.length;
		}
	};

	Sorter.prototype = {
		_generateSubjectRegex: function(subject) {

			var length = subject.length,
				ret = [],
				substring;

			for (var i = 0; i < length; ++i) for (var end = length; end--;) {
				substring = subject.substring(i, end+1).replace(/[-[\]{}()*+?.,\\^$#\s|]/g, "\\$&");
				substring && ret.push(substring);
			}

			ret.sort(function(a,b){ return a.length > b.length ? -1 : 1; });
			return RegExp(ret.join('|'), 'ig');

		},
		_generateBoundRegex: function() {
			
			this.boundRegex = RegExp(this._bounds.join('|'));
			this.lastBoundRegex = RegExp('.+(?:' + this._bounds.join('|') + ')(?=.+$)');

		},
		setArray: function(array) {
			this._array = array;
			return this;
		},
		sort: function(array, subject) {
			return this.setArray(array).sortBy(subject);
		},
		sortBy: function(subject) {

			var array = this._array,
				me = this,
				isRegexSearch = S._isRegExp(subject),
				regex = isRegexSearch ?
					RegExp(subject.source, 'ig') :
					this._generateSubjectRegex(subject);

			return array.sort(function(a, b){

				var l, max, aWeight, bWeight;

				if (S._isArray(a)) {
					aWeight = me._subArrayWeightOperation(a, regex, subject, isRegexSearch);
				} else {
					a = String(a);
					aWeight = me._calcWeight(S._getLargestMatch(a, regex), subject, isRegexSearch);
				}

				if (S._isArray(b)) {
					bWeight = me._subArrayWeightOperation(b, regex, subject, isRegexSearch);
				} else {
					b = String(b);
					bWeight = me._calcWeight(S._getLargestMatch(b, regex), subject, isRegexSearch);
				}

				return aWeight == null && bWeight == null ? 0 :
					aWeight == null ? 1 : 
						bWeight == null ? -1 :
							bWeight > aWeight ? 1 : -1;
				
			});


		},
		_calcWeight: function(match, subject, isRegexSearch) {

			if (!match) return null;

			var value = match.string,
				upTillAndInclMatch = value.slice(0, match.index + match.length),
				lastBoundIndex = (upTillAndInclMatch.match(this.lastBoundRegex)||[''])[0].length,

				matchInValueIndexScore = (1 - (
					((match.index - lastBoundIndex) / (value.length - lastBoundIndex))
				)) - ((upTillAndInclMatch.split(this.boundRegex).length-1) * .05),

				matchInValueLengthScore = match.length / value.length,

				matchInSubjectIndexScore = isRegexSearch ? 1 :
					1 - (
						subject.toLowerCase().indexOf(
							match.match.toLowerCase()
						)
					) / (subject.length - match.length + 1) || 1,

				matchInSubjectLengthScore = match.length / subject.length,

				score = 0;

			score += matchInValueIndexScore * this._weights.matchInValueIndex;
			score += matchInValueLengthScore * this._weights.matchInValueLength;
			score += matchInSubjectIndexScore * this._weights.matchInSubjectIndex;
			score += matchInSubjectLengthScore * this._weights.matchInSubjectLength;

			score /= 4;

			return score;

		}
	};

	S.defaultSorter = new Sorter;

	S._getLargestMatch = function _getLargestMatch(str, regex) {

		regex.lastIndex = 0;

		var m, prev, index;

		while (m = regex.exec(str)) {
			if (!prev || m[0].length > prev.length) {
				prev = m[0];
				index = regex.lastIndex;
			}
		}

		return prev && {
			string: str,
			match: prev,
			length: prev.length,
			index: index - prev.length,
		};

	};

	S._isRegExp = function(r) {
		return toString.call(r) == '[object RegExp]';
	};

	S._isArray = function(a) {
		return toString.call(a) == '[object Array]';
	};

}());