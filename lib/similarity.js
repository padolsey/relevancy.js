/**
 * Similarity.js v0.1.0dev
 **/

(function(){
	
	var S = typeof module != 'undefined' && module && module.exports || (this.similarity = {}),
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty;

	S.sort = function similaritySort(array, subject) {
		return S.defaultSorter.sort(array, subject);
	};

	S.weight = function similarityWeight(a, b) {
		return S.defaultSorter._calcWeight(b, S.defaultSorter._generateSubjectRegex(a), a);
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
			matchInSubjectIndex: .5,
			matchInValueLength: 0,
			matchInValueIndex: 1
		};

		this._secondaryComparator = config.comparator || function(a, b) {
			return a > b ? 1 : -1;
		};

		if (config.weights) for (var i in this._weights) {
			if (hasOwn.call(config.weights, i)) {
				this._weights[i] = config.weights[i];
			}
		}

		this._generateBoundRegex();

	}

	var subArrayWeightOperations = S.Sorter.subArrayWeightOperations = {
		max: function(subArray, subjectRegex, subject, isRegexSearch) {
			// Return maxmium weight found in array
			for (var max, l = subArray.length; l--;) {
				max = Math.max(
					max || 0,
					this._calcWeight(subArray[l], subjectRegex, subject, isRegexSearch)
				);
			}
			return max;
		}
	};

	Sorter.prototype = S.Sorter.prototype = {

		_generateSubjectRegex: function(subject) {

			// Create a regular expression that contains all possible
			// substrings of a larger string.
			// E.g. "apple" -> /apple|appl|pple|app|ppl|ple|ap|pp|pl|le|a|p|l|e/

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

			if (!subject) return this._array;

			var array = this._array.slice(0),
				me = this,
				isRegexSearch = S._isRegExp(subject),
				regex = isRegexSearch ?
					RegExp(subject.source, 'ig') :
					this._generateSubjectRegex(subject);

			return array.sort(function(a, b){

				var aIsArray = S._isArray(a),
					bIsArray = S._isArray(b),
					l, max, aWeight, bWeight;

				if (aIsArray) {
					aWeight = me._subArrayWeightOperation(a, regex, subject, isRegexSearch);
				} else {
					a = String(a);
					aWeight = me._calcWeight(a, regex, subject, isRegexSearch);
				}

				if (bIsArray) {
					bWeight = me._subArrayWeightOperation(b, regex, subject, isRegexSearch);
				} else {
					b = String(b);
					bWeight = me._calcWeight(b, regex, subject, isRegexSearch);
				}

				return aWeight == null && bWeight == null ? 0 :
					aWeight == null ? 1 : 
						bWeight == null ? -1 :
							aWeight === bWeight ? 
								me._secondaryComparator(a, b) :
								bWeight > aWeight ? 1 : -1;
				
			});


		},
		_calcWeight: function(value, regex, subject, isRegexSearch) {

			if (value === subject) return 1;
			if (value.toLowerCase() === subject.toLowerCase()) return .9;

			var match = S._getLargestMatch(value, regex);

			if (!match) return null;

			var upTillAndInclMatch = value.slice(0, match.index + match.length),
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

			score /= 5;

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
			index: index - prev.length
		};

	};

	S._isRegExp = function(r) {
		return toString.call(r) == '[object RegExp]';
	};

	S._isArray = function(a) {
		return toString.call(a) == '[object Array]';
	};

}());