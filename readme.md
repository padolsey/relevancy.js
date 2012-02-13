# relevancy Sorter/Weighter

*Using node.js? Install: `npm install relevancy`.*

## Objective

The original purpose behind relevancy.js was to sort an array of items based on each element's relevancy to a single string. This is exactly what autocompletion widgets/scripts claim to do, but many of them suck for the following reasons:

 * They only take into account partial matches at the beginning of the strings. If I type "nited kingdom" (missing a "u") nothing will show up.
 * They don't actually sort the results dependent on relevancy -- they just show you where the partial matches have been found, in alphabetical order usually. Match length/position is rarely considered.

E.g.

 * Go [here](http://jqueryui.com/demos/autocomplete/) and type in the letter "C" ... Does the order of the suggestions make any sense? Shouldn't it be ordered like: C, C++, Clojure, ... ?
 * Go [here](http://www.vonloesch.de/node/18) and type "oris" (Missing "B"). No results.
 * Go [here](http://dhtmlx.com/docs/products/dhtmlxCombo/index.shtml) and type "Kingdom" in the top-right field. The result "united kingdom" does not show...

The basic partial-matching implemented by most autocompletion scripts can hamper usability.

Hopefully, relevancy.js can rectify this with its not-so-complex weighting algorithm.

## Intro

**[Version: 0.2.0]**

relevancy.js contains a basic sorting/weighting algorithm that can be used to weight a short string relative to another short string. It can gage the relevancy between two strings, but only in a unidirectional manner (`"Lon"` is more *relevant* to `"London"` than `"London"` is to `"Lon"`). This was intentional as its main use-case is autocompletion -- i.e. matching partial typed words against large data lists.

```javascript
relevancy.weight('Ame', 'America') > relevancy.weight('Ame', 'Armenia'); // => true

// Explanation:
// "Ame" has a higher relevancy weighting to "America" than to "Armenia"
```

The *subject* of a single weighting or sorting operation is the string that is being compared against the target string or array. For example:

```javascript
var subject = 'G';
var array = ['Apple', 'Banana', 'Grape', 'Mango'];

relevancy.sort(array, subject); // => ['Grape', 'Mango', 'Apple', 'Banana']
```

The elements have been sorted by their relevancy to the subject "G", taking the following weights into account:

 * `matchInSubjectLength`: (`0..1`) The proportion of the largest substring match found within the actual subject. So, if the subject is `"Gu"`, but we only match `"G"` (e.g. in `"Grape"`) then proportion would be `0.5`.
 * `matchInSubjectIndex`: (`0..1`) The proximity of the match to the start of the subject. For example, given the subject `"A grape"` against the value `"Grapelicious"`, `"grape"` in `"A grape"` matches the beginning of the value, and it is at an index of `2`. The highest possible index of this is `2` (given the match's length: `5`) so `matchInSubjectIndex`, in this example, gets set as zero.
 * `matchInValueLength`: (`0..1`) The proportion of the largest substring match found within the target value. For example, we matched the substring `"King"` (length:`4`) against the value `"United Kingdom"` (length:`14`), and `4/14 = ~0.29` **This is not used currently.**, although can be set when you pass a configuration object to `relevancy.Sorter`.
 * `matchInValueIndex`: (`0..1`) The proximity of the match to the start of the target value. E.g., a match of `"dom"` in `"Kingdom"` -- `"dom"` is matched at an index of `4`. `4` divided by the total length of `7` substracted from `1` gives us our `matchInValueIndex` of `~0.43`.

Note that the algorithm will account for spaces and anchor the calculations above accordingly. So `"Banana Milkshake"` will be weighted higher than `"bananamilk"` given the subject `"milk"` because it begins a word in the former `"Banana Milkshake"` but merely forms a part of another word in the latter, `"bananamilk"`.

The default bound of `\s+` is used to find where the calculations should be anchored. You can add your own bounds via the configuration option: `bounds`.

## Example Implementation

```javascript
// In this example, we'll also see how relevancy.js can
// deal with nested arrays. Default operation is `max`,
// meaning that it'll get the maximum weight from each sub-array
// and use that for comparing to other sub-arrays.

var countries = [
	['AF', 'Afghanistan'],
	['AL', 'Albania'],
	['DZ', 'Algeria'],
	['AS', 'American Samoa'],
	['AD', 'Andorra'],
	['AO', 'Angola'],
	// .......
];

var countrySorter = relevancy.Sorter(null, countries);

countrySorter.sortBy('Al').slice(0, 5); // => [["AL", "Albania"], ["DZ", "Algeria"]...]
```

## Configuration

If you want more control you should create a `relevancy.Sorter` instance which can accept a configuration object upon instantiation:

```javascript
var mySorter = new relevancy.Sorter({

	bounds: ['\\s', '(?=[A-Z])', '-'], // create new bounds (default: ['\\s'])

	comparator: function(a, b) {
		// When relevancy.Sorter finds two items with equal weight
		// it will pass them to this function so you can decide 
		// what to do. I.e. return -1, 1
		// Only return 0 if you're prepared for the pain caused 
		// by unstable sorting algorithms in e.g. V8
	},

	weights: {
		// Define your own weights (each of these is described further up)
		// ** These are the default values:
		// (yes, one of them is zero)
		matchInSubjectLength: 1,
		matchInSubjectIndex: .5,
		matchInValueLength: 0,
		matchInValueIndex: 1
	}

});

// Usage:
mySorter.setArray( arrayToSearch );
mySorter.sortBy('thingToFind');

// Or:
mySorter.sort(arrayToSearch, 'thingToFind');
```

## Changelog

 * **0.2**
 	* `subArrayWeightOperation` option renamed to `subWeightOperation` (because it's used for regular sub-objects as well as arrays)
 	* Arguments passed to `subWeightOperation` are now simplified and only include the sub-item and a `calc` function which you call to determine the actual weight. The resulting weight should be returned from your custom `subWeightOperation` function.
 	* `subWeightOperation` option added to `sort` method. See [issue #1](https://github.com/padolsey/relevancy.js/issues/1).

## Todo

 * Tidy up
 * Configuration options
 * MORE tests