module('101', {
	setup: function() {
		ok(true);
	}
});

test('Basic first-character ordering', function(){

	var unsorted = ['Paul', 'Michael'],
		sorted = similarity.sort(unsorted.slice(), 'M');

	deepEqual(sorted, ['Michael', 'Paul']);

});

test('No matching items', function() {

	var unsorted = ['aaa', 'bbb', 'ccc'],
		sorted = similarity.sort(unsorted.slice(), 'x');

	deepEqual(sorted, unsorted);

});

test('Some matching items', function(){

	var unsorted = ['Sarah', 'Julie', 'Michael', 'Paul', 'Amanada'],
		sorted = similarity.sort(unsorted.slice(), 'M');

	deepEqual(sorted, ['Michael', 'Amanada', 'Sarah', 'Julie', 'Paul']);

});

test('Items containing matches', function(){

	var unsorted = ['AAAA', 'ABBA', 'CCCC', 'CBBC'],
		sorted = similarity.sort(unsorted.slice(), 'BB');

	deepEqual(sorted, ['ABBA', 'CBBC', 'AAAA', 'CCCC']);

});

test('Distance-from-start', function(){

	var unsorted = ['..a', '.a', '....a', 'a', '...a'],
		sorted = similarity.sort(unsorted.slice(), 'a');

	deepEqual(sorted, ['a', '.a', '..a', '...a', '....a']);

});

module('Real world examples', {
	setup: function() {
		ok(true);
	}
});

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
		sorted = similarity.sort(unsorted.slice(), 'Ja');

	deepEqual(
		sorted.slice(0, 5),
		[
			'James',
			'Jan',
			'John',
			'Julie',
			'Joe'
		]
	);

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
		sorted = similarity.sort(unsorted.slice(), 'Sm');

	deepEqual(
		sorted.slice(0, 5),
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

	deepEqual(similarity.sort(countries, 'GB')[0], ['GB', 'United Kingdom']);
	deepEqual(similarity.sort(countries, 'United States')[0], ['US', 'United States']);
	deepEqual(similarity.sort(countries, 'Saint Lucia')[0], ['LC', 'Saint Lucia']);
	deepEqual(similarity.sort(countries, 'CU')[0], ['CU', 'Cuba']);

});

test('Countries - single partial', function(){
	
	var sorted = similarity.sort(countries, 'Ukr');

	deepEqual(sorted[0], ['UA', 'Ukraine']);

});

test('Countries - single partial - second word', function(){
	
	var sorted = similarity.sort(countries, 'Poly');

	deepEqual(sorted[0], ['PF', 'French Polynesia']);

});

module('subArrayWeightOperations (max, min, avg, custom', {
	setup: function() {
		ok(true);
	}
});

test('max', function(){
	
	var sorted = similarity.sort([
		['b', 'c', 'a'],
		['cccc', 'bbbb', 'cccc'],
		['bb', 'aa', 'cc']
	], 'aa');

	deepEqual(
		sorted,
		[
			['bb', 'aa', 'cc'],
			['b', 'c', 'a'],
			['cccc', 'bbbb', 'cccc']
		]
	);

});

module('Misc. configs', {
	setup: function() {
		ok(true);
	}
});

test('Custom bound - camelCase', function(){

	var array = [
		'Script',
		'blahscript',
		'JavaScript',
		'Foo Script'
	];

	deepEqual(
		similarity.Sorter({
			bounds: ['\\s', '(?=[A-Z])']
		}).sort(array, 'script'),
		[
			'Script',
			'JavaScript',
			'Foo Script',
			'blahscript'
		]
	)

});