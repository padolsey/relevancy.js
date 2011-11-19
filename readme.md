## Similarity Sorter/Weighter

similarity.js contains a basic sorting/weighting algorithm that can be used to weight a short string relative to another short string. It can gage the similarity between two strings, but only in a unidirectional manner (`"Lon"` is more *similar* to `"London"` than `"London"` is to `"Lon"`). This was intentional as its main use-case is autocompletion -- i.e. matching partial typed words against large data lists.

The *subject* of a single weighting or sorting operation is the string that is being compared against the target string or array. For example:

    var subject = 'G';
    var array = ['Apple', 'Banana', 'Grape', 'Mango'];

    similarity.sort(array, subject); // => ['Grape', 'Mango', 'Apple', 'Banana']

The elements have been sorted by their similarity to the subject "G", taking the following weights into account:

	* `matchInSubjectLength`: (`0..1`) The proportion of the largest substring match found within the actual subject. So, if the subject is `"Gu"`, but we only match `"G"` (e.g. in `"Grape"`) then proportion would be `0.5`.
	* `matchInSubjectIndex`: (`0..1`) The proximity of the match to the start of the subject. For example, given the subject `"A grape"` against the value `"Grapelicious"`, `"grape"` in `"A grape"` matches the beginning of the value, and it is at an index of `2`. The highest possible index of this is `2` (given the match's length: `5`) so `matchInSubjectIndex`, in this example, gets set as zero.
	* `matchInValueLength`: (`0..1`) The proportion of the largest substring match found within the target value. For example, we matched the substring `"King"` (length:`4`) against the value `"United Kingdom"` (length:`14`), and `4/14 = ~0.29` **This is not used currently.**, although can be set when you pass a configuration object to `similarity.Sorter`.
	* `matchInValueIndex`: (`0..1`) The proximity of the match to the start of the target value. E.g., a match of `"dom"` in `"Kingdom"` -- `"dom"` is matched at an index of `4`. `4` divided by the total length of `7` substracted from `1` gives us our `matchInValueIndex` of `~0.43`.

Note that the algorithm will account for spaces and anchor the calculations above accordingly. So `"Banana Milkshake"` will be weighted higher than `"bananamilk"` given the subject `"milk"` because it begins a word in the former `"Banana Milkshake"` but merely forms a part of another word in the latter, `"bananamilk"`.

The default bound of `\s+` is used to find where the calculations should be anchored. You can add your own bounds via the configuration option: `bounds`.

### Example Implementation

	// In this example, we'll also see how similarity.js can
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

	var countrySorter = similarity.Sorter(null, countries);

	countrySorter.sortBy('Al').slice(0, 5); // => [["DZ", "Algeria"], ["AL", "Albania"], ...]

## Todo

 * Tidy up
 * Configuration options
 * MORE tests