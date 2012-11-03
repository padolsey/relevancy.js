test('Programmatic', function() {

	test('Substrings - testing index[0]', function(){
		
		var unsorted = [],
			strings = 'foo ggg hhh aaa jjj bar ... mim mam ham jam kam'.split(' ');

		expect(strings.length);

		for (var i = 0, l = strings.length; i < l; ++i) {
			expect(
				relevancy.sort(strings, strings[i])[0]
			).toBe(
				strings[i]
			);
		}

	});

});

test('101', function() {

	test('Basic first-character ordering', function(){

		var unsorted = ['Paul', 'Michael'],
			sorted = relevancy.sort(unsorted.slice(), 'M');

		expect(sorted).toEqual(['Michael', 'Paul']);

	});

	test('No matching items', function() {

		var unsorted = ['aaa', 'bbb', 'ccc'],
			sorted = relevancy.sort(unsorted.slice(), 'x');

		expect(sorted).toEqual(unsorted);

	});

	test('Some matching items', function(){

		var unsorted = ['Sarah', 'Julie', 'Michael', 'Paul', 'Amanada'],
			sorted = relevancy.sort(unsorted.slice(), 'M');

		expect(sorted).toEqual(['Michael', 'Amanada', 'Sarah', 'Julie', 'Paul']);

	});

	test('Items containing matches', function(){

		var unsorted = ['AAAA', 'ABBA', 'CCCC', 'CBBC'],
			sorted = relevancy.sort(unsorted.slice(), 'BB');

		expect(sorted).toEqual(['ABBA', 'CBBC', 'AAAA', 'CCCC']);

	});

	test('Distance-from-start', function(){

		var unsorted = ['..a', '.a', '....a', 'a', '...a'],
			sorted = relevancy.sort(unsorted.slice(), 'a');

		expect(sorted).toEqual(['a', '.a', '..a', '...a', '....a']);

	});

});

test('Real world examples', function() {

	test('Basic names - ^Ja', function(){

		var unsorted = [
				'John',
				'Adam',
				'Julie',
				'Michael',
				'Paul',
				'Sarah',
				'Joe',
				'Robert',
				'James',
				'Oliver',
				'Susan',
				'Ben',
				'Alice',
				'Jan',
				'George'
			],
			sorted = relevancy.sort(unsorted.slice(), 'Ja');

		expect(sorted.slice(0, 5)).toEqual(
			[
				'James',
				'Jan',
				'Joe',
				'John',
				'Julie'
			]
		);

	});

});

test('Full names', function(){

	var unsorted = [
			'John Smith',
			'Joe Sack',
			'Smyth Jones',
			'Julie Smitton',
			'Michael Smit',
			'Paul Smot',
			'Bob',
			'Sarah Smith'
		],
		sorted = relevancy.sort(unsorted.slice(), 'Sm');

	expect(sorted.slice(0, 5)).toEqual(
		[
			'Smyth Jones',
			'John Smith',
			'Julie Smitton',
			'Michael Smit',
			'Paul Smot'
		]
	);

});

test('Countries - single full', function(){

	expect(relevancy.sort(countries, 'GB')[0]).toEqual(['GB', 'United Kingdom']);
	expect(relevancy.sort(countries, 'United States')[0]).toEqual(['US', 'United States']);
	expect(relevancy.sort(countries, 'Saint Lucia')[0]).toEqual(['LC', 'Saint Lucia']);
	expect(relevancy.sort(countries, 'CU')[0]).toEqual(['CU', 'Cuba']);

});

test('Countries - single partial', function(){
	
	var sorted = relevancy.sort(countries, 'Ukr');

	expect(sorted[0]).toEqual(['UA', 'Ukraine']);

});

test('Countries - single partial - second word', function(){
	
	var sorted = relevancy.sort(countries, 'Poly');

	expect(sorted[0]).toEqual(['PF', 'French Polynesia']);

});

test('Full sentences', function(){
	
	var unsorted = [
		'There are only 76 bottles of wine left',
		'There are 23 bottles left',
		'76 bottles of wine left, and no more...'
	];

	expect(relevancy.sort(unsorted, 'There are only')).toEqual(
		[
			unsorted[0],
			unsorted[1],
			unsorted[2]
		]
	);

	expect(relevancy.sort(unsorted, '76 bottles of')).toEqual(
		[
			unsorted[2],
			unsorted[0],
			unsorted[1]
		]
	);

	expect(relevancy.sort(unsorted, 'bottles left')).toEqual(
		[
			unsorted[1],
			unsorted[2],
			unsorted[0]
		]
	);

})

test('subArrayWeightOperations (max, min, avg, custom', function() {

	test('max [default]', function(){

		// `max` is default
		
		var sorted = relevancy.sort([
			['b', 'c', 'a'],
			['cccc', 'bbbb', 'cccc'],
			['bb', 'aa', 'cc']
		], 'aa');

		expect(sorted).toEqual(
			[
				['bb', 'aa', 'cc'],
				['b', 'c', 'a'],
				['cccc', 'bbbb', 'cccc']
			]
		);

	});

	test('custom - sub arrays', function(){
		
		var unsorted = [
				['a', 'aa', 'aa'],
				['aa', 'bb', 'bb'], // First item of this sub-array has most relevancy
				['b', 'aa', 'aa...']
			],
			sorted = relevancy.Sorter({
				subWeightOperation: function(subArray, calc) {
					// First item only
					return calc(subArray[0]);
				}
			}).sort(unsorted, 'aa');

		expect(sorted).toEqual(
			[
				unsorted[1],
				unsorted[0],
				unsorted[2]
			]
		);

	});

	test('custom - sub objects', function(){
		var unsorted = [
				{name: 'John'},
				{name: 'Janet'},
				{name: 'Linda'},
				{name: 'Chris'},
				{name: 'Amber'}
			],
			sorted = relevancy.Sorter({
				subWeightOperation: function(sub, calc) {
					return calc(sub.name);
				}
			}).sort(unsorted, 'an');

		expect(sorted).toEqual(
			[
				unsorted[1],
				unsorted[4],
				unsorted[2],
				unsorted[0],
				unsorted[3]
			]
		);

		// Alternative sig:
		sorted = relevancy.sort(unsorted, 'an', function(sub, calc) {
			return calc(sub.name);
		});

		expect(sorted).toEqual(
			[
				unsorted[1],
				unsorted[4],
				unsorted[2],
				unsorted[0],
				unsorted[3]
			]
		);
		
	});

});

test('Misc. configs', function() {

	test('Basic names - Custom secondary comparator (retain index)', function(){

		// It's possible to specify the secondary comparator used when
		// weights are found to be equal. relevancy.js will attempt
		// to retain original positions, but some engines (V8!) don't
		// have stable sorts... and so this kind of thing can become a necessity.

		var unsorted = [
				'John',
				'Adam',
				'Julie',
				'Michael',
				'Paul',
				'Sarah',
				'Joe',
				'Robert',
				'James',
				'Oliver',
				'Susan',
				'Ben',
				'Alice',
				'Jan',
				'George'
			],
			indexes = {};

		for (var i = 0, l = unsorted.length; i < l; ++i) {
			indexes[unsorted[i]] = i;
		}

		var sorted = relevancy.Sorter({
				comparator: function(a, b) {
					return indexes[a] > indexes[b] ? 1 : -1;
				}
			}).sort(unsorted.slice(), 'Ja');

		expect(
			sorted.slice(0, 5)
		).toEqual(
			[
				'James',
				'Jan',

				// These three are equal so, thanks to our `indexes`
				// they should be positioned as in `unsorted`
				'John',
				'Julie',
				'Joe'
			]
		);

	});

	test('Custom bound - camelCase', function(){

		var array = [
			'Script',
			'blahscript',
			'JavaScript',
			'Foo Script'
		];

		expect(
			relevancy.Sorter({
				bounds: ['\\s', '(?=[A-Z])']
			}).sort(array, 'script')
		).toEqual(
			[
				'Script',
				'Foo Script',
				'JavaScript',
				'blahscript'
			]
		)

	});

});