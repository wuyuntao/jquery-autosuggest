# jQuery Autosuggest 2 [![Build Status](https://secure.travis-ci.org/hlsolutions/jquery-autosuggest.png?branch=master)](http://travis-ci.org/hlsolutions/jquery-autosuggest)

The *jQuery plugin* **AutoSuggest** will turn any regular text `input` box into a awesome auto-complete and auto-suggest box. It will dynamically create all the HTML elements that it needs to function. You *don't need to add any extra HTML* to work with AutoSuggest. Also, AutoSuggest uses **ZERO images**! All styling is done 100% in the included CSS file. This means it is super easy to customize the look of everything! You only need to edit the included CSS file. You can even use images if you want, just add the appropriate lines of code into the CSS file.

![Example](https://github.com/downloads/hlsolutions/jquery-autosuggest/jquery-autosuggest-example01.png)

_Please note: This is a fork of the [original versions by Drew Wilson and Wu Yuntao](#note-on-the-original-version)._

## Getting Started
Download the [production version][min-js] or the [development version][max-js]. Don't forget the CSS [production version][min-css] or the [development version][max-css].

[min-js]: https://raw.github.com/hlsolutions/jquery-autoSuggest/master/dist/jquery.autoSuggest.min.js
[max-js]: https://raw.github.com/hlsolutions/jquery-autoSuggest/master/dist/jquery.autoSuggest.js

[min-css]: https://raw.github.com/hlsolutions/jquery-autoSuggest/master/dist/jquery.autoSuggest.min.css
[max-css]: https://raw.github.com/hlsolutions/jquery-autoSuggest/master/dist/jquery.autoSuggest.css

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.autoSuggest.min.js"></script>
<script>
$(function($) {
  $('input[type=text]').autoSuggest(dataSource, options);
});
</script>
```

_Note: jQuery version 1.5 or above is required._

More examples see [here](#examples).

## How It Works

As you type into the AutoSuggest `input` box, it will filter through its `dataSource` and suggest matched items to you. You can pass in an object of data or you can have it call a URL as you type to get its data from. AutoSuggest will display the matched items in a selectable list, which is 100% customizable. You have the option of structuring the HTML elements of that list however you want via the `formatList` callback function.

When you type into the `input` box and the "suggestion" dropdown list appears, a few things happen:

* A `class` of "loading" is applied to the main AutoSuggest `ul` while the data is loaded. That class is then removed when all processing has finished and before the suggestion results list is made visible.
* As you hover over each suggested option in the list a `class` of "selected" is added to that item, and then removed when you `mouseout`.
* When you make a selection the item is added to the `input` box. Also there is a hidden `input` field generated for each AutoSuggest box that stores the values (comma separated) of each item you have selected. This input box will have a unique ID as well as a class name of "as-values".

The plugin expects the data passed into it (or gathered from the URL) to be formatted in [JSON](http://json.org/). JSON is an extremely easy format to work with, and if you don't already... you should :) To learn more about JSON, check out Drew Wilson's post/video, [An Introduction to JSON](http://code.drewwilson.com/entry/an-introduction-to-json).

When an AJAX request is made the search string is sent over in a param named "q" by default. However you can change that name with the **queryParam** option. Here is a default example AJAX request: **http://www.example.com/your/script/?q=mick**
"mick" would be the search query that was typed into the `input` box. Be sure to setup your server-side code to grab that param and send back some results.

As of AutoSuggest version 1.4 you can now create selections by using the **tab** or **comma** keys. To do this simply type something into the box and hit the tab or comma keys. The selection is added to AutoSuggest in the exact same manner as if it were chosen from the Results dropdown.

## Security: XSS safety ##

Since 1.7, this plugin prevents injecting JavaScript into the web page with techniques known as cross-site scripting (XSS). Both original version of Drew Wilson and the fork of Wu Yuntao are affected by this vulnerability.

At first all foreign input or content have to be escaped correctly before inserting it as html into the web page. In addition to this, the selections state have be changed internally from a comma separated string into a more comfortable and at least reliable selections holder domain object.

To prove this statement, special test cases could be found at `test/jquery.autoSuggest_test.js`. Feel free to contribute patches. We will like it!

## Browser compatibility

_Needs updates._

AutoSuggest has been tested (and works) in:

* IE6, IE7, IE8, IE9
* Firefox (all)
* Safari (all)
* Opera (all?)
* Chrome (all)

## Documentation

The plugin's constructor expects two arguments: `dataSource` and `options`.

The first argument `dataSource` defines how the suggested results will be retrieved:
* Use an `array` if you want to define a static list of items. Each item must be an object with properties which will match your `options` keys `selectedItemProp`, `selectedValuesProp` and `searchObjProps`.
* Use a `function` returning an `array` if you want to define dynamic builder of a list of items. The structure of this list must be the same as described for an `array`.
* Use a `string` if you want to load the data asynchronously via AJAX. Eventually, in that case you want to override the option `afterRequest` to match the specification of a data array.

The second argument `options` specifies the behaviour of the plugin like data transformations, ajax options or event handling.

In general, the options are grouped into following categories:
* General
* Data
* Ajax
* Callbacks

### General

#### asHtmlID (string)
Enables you to specify your own custom element id. Otherwise it will default to using a random element id.
This is also applies to the hidden input filed that holds all of the selected values.

```javascript
// example
{
  id : 'CUSTOM_ID'
}
```
I.e., the id of the hidden input input will be now `as-values-CUSTOM_ID`.

#### useOriginalInputName (boolean)
Ensures that the name of the hidden field is exactly the name of the `input` field on which the plugin was executed.
This means also that the original `input` field will be renamed (a prefix `old_` will be prepended).

The default for this option is `false`.

#### inputAttrs (object)
Specify additional attributes which will be applied to each input on setup.

Default:
```javascript
{
  autocomplete : 'off'
}
```

#### matchCase (boolean)
Specify whether the search/highlight should be case sensitive.

Default: `false`

#### minChars (number)
Minimum number of characters that must be entered into the input field before the search begins.

Default: `1`

#### neverSubmit (boolean)
If set to `true` this option will never allow the _return key_ to submit the form that AutoSuggest is a part of.

Default: `false`

#### selectionLimit (number)
Specifiy the number of selections that are allowed to be made.

Default: `false`

#### preventPropagationOnEscape (boolean)
If set to `true` this option will prevent bubbling events when the _escape key_ was pressed.

Default: `false`

#### searchActive (boolean)
If set to `true` this option will prevent the plugin filters the retrieved data again regardless whether the item was already selected.

Default: `false`

#### remoteFilter (boolean/string)
If set to `false` this option will prevent the plugin filters the retrieved data again. If set to `'auto'` the plugin will resolve this setting regarding the datasource is a server or not. The idea is that in case of a server side response the data are already filtered.

Default: `true`

### Data

#### selectedItemProp (string)
Specifiy the name of the property to use as the display text for each chosen item.

Default: `'value'`

#### selectedValuesProp (string)
Specify the name of the property to use as the value for each chosen item.

This option configures the id values which will be stored into the hidden input field.

Default: `'value'`

#### searchObjProps (string)
Specify a comma separated list of property names. The values in these objects properties will be used to perform the search/highlight on.

Default: `'value'`

#### Example
Let's assume, each record contains at least a `firstName` and a `lastName`. Allowing the plugin to search/highlight in both columns, you have to provide following line.
`searchObjProps = 'firstName,lastName'`

#### preFill (object or string)
Enables you to pre fill the box with selections when the page is first loaded. You can pass in a comma separated list of values (a string), or an object.

When using a string, each value is used as both the display text on the selected item and for it's value.
When using an object, the options `selectedItemProp` will define the object property to use for the display text and `selectedValuesProp` will define the object property to use for the value for the selected item.

Note: You *must* setup your `preFill` object in that format. An example value can look just like the example objects laid out above.

### UI

#### emptyText (string)
Specify text to display when there are no search results.

Default: `'No Results'`

#### emptyTextPlaceholder (string)
RegEx to replace values in emptyText values with query text. If you search for `Hans` and there is no result and `showResultListWhenNoMatch` is true, then, a list with one, unselectable entry is shown containing the `emptyText`, which occurrences of `{0}` are replaced by the query String.

Default: `/\{\d+\}/`

#### limitText (string)
Specify text to display when the number of selections has reached it's limit.

Default: `'No More Selections Are Allowed'`

#### startText (string)
Specify text to display when the input field is empty.

Default: `'Enter Name Here'`

#### usePlaceholder (boolean)
Set *HTML5* placeholder attribute to display the *startText* when the input field is empty.

Default: `false`

#### keyDelay (number)
Number of milliseconds to delay after a keydown on the input field and before search is started.

Default: `400`

#### resultsHighlight
Option to choose whether or not to highlight the matched text in each result item.

Default: `true`

#### showResultList (boolean)
If set to `false` the result list will never be shown at any time.

Default: `true`

#### fadeOut (mixed)
Specify whether the removing of a selection should be animated (using fadeOut) or not.

The value of `fadeOut` will be passed directly into `$.fn.fadeOut`.

### Ajax

#### ajaxOptions (object)
An additional options object for jQuery's `.ajax` (if the Ajax method is used). Example usage: Override the HTTP method into _POST_.

The defaults will be merged unless they are overridden.

```javascript
// Default
{type : 'get', dataType : 'json'}
```

#### queryParam (string)
The name of the param that will hold the search string value in the AJAX request.

Default: `'q'`

#### retrieveLimit (number)
If set to a number, it will add a '&limit=' param to the AJAX request. It also limits the number of search results allowed to be displayed in the results dropdown box.

#### extraParams
These params will be applied to the `$.ajax` params.

There are three ways provide params.
1. Use an object which will be applied directly onto the internal `$.ajax` request's params.
2. Use the deprecated way defining a string (prior version 2). But please note: Make sure you add an `&` before each param. Otherwise you break it all..
3. Use a callback function returning an object (or a string). The callback's first and only argument is the plugin's scope.

#### onAjaxRequestAlways (function)
A callback function which will be attached onto `$.ajax.always`.

#### onAjaxRequestDone (function)
A callback function which will be attached onto `$.ajax.done`.

#### onAjaxRequestFail (function)
A callback function which will be attached onto `$.ajax.fail`.

### Callbacks

#### start(api)
Provide some internal hooks with the specified `api` object. Currently, following methods are provided:
1. `add(item)` will add another selection item
1. `remove(item` will remove a selection item

#### afterSelectionClick (element, item, selections)
A callback that is run when a previously chosen item is clicked. The item that is clicked is passed into this callback function as `element`.

#### onSelectionAdd(element, markerElement, detachedElement, options)
A callback that do the actual dom operation (add the `detachedElement` before `markerElement`).

```javascript
onSelectionAdd : function(element, markerElement, detachedElement, options) {
  markerElement.before(detachedElement);
  return containerElement.prev();
}
```

#### onSelectionRemove(element, options)
A callback that do the actual dom operation (remove the element).

```javascript
onSelectionRemove : function(element, options) {
  if (options.fadeOut) {
    element.fadeOut(options.fadeOut, function(){
      element.remove();
    });
  } else {
    element.remove()
  }
}
```

#### afterSelectionAdd (element, item, selections)
A callback that is run when a selection is made by choosing one from the results dropdown or by using the tab/comma keys to add one. The selection item is passed into this callback function as `element`.

Example
```javascript
afterSelectionAdd: function(element, item, currentSelections){
  MyApp.addSelection(item);
}
```

#### selectionRemove (element, item, selections)
A callback hat is run when a selection removed from the AutoSuggest by using the delete key or by clicking the "x" inside the selection. The selection item is passed into this callback function as `element`.

Example:
```javascript
afterSelectionRemove: function(element, item, currentSelections){
  MyApp.removeSelection(item);
}
```

#### beforeRequest (query, options)
A callback that is run right before the Ajax request is made or before the local objected is searched. This is used to modify the search string before it is processed. So if a user entered `'jim'` into the AutoSuggest box, you can call this function to prepend their query with `'guy_'`. Making the final query `= 'guy_jim'`. The search query is passed into this function.

Note: The callback *must* return a string if this is used.

#### afterRequest (data)
A callback that is run after the ajax request has completed. This allows modifiying the requested `data`.

Note: The callback *must* return an object if this is used.

#### formatList (items, element)
A callback that is run after all the data has been retrieved and before the results are put into the suggestion results list. This is here so you can modify what and how things show up in the suggestion results list.

The argument `items` is the data you originally passed into AutoSuggest (or retrieved via an AJAX request). The other argument `element` is the HTML element you will be formatting (the result `li` item).

Note: The callback must return an element. If you don't care return `element`.

In order to add extra things to the 'result item' (like an image) you will need to make sure you pass that data into AutoSuggest. Below is an example of `formatList` in action:
```javascript
formatList: function(data, elem){
  var my_image = data.image;
  var new_elem = elem.html("add/change stuff here, put image here, etc.");
  return new_elem;
}
```

#### onResultItemClick (data)
A callback that is run when a search result item is clicked. The data from the item that is clicked is passed into this callback function as `data`.

Example:
```javascript
onResultItemClick: function(data){
  console.log(data);
}
```

#### afterResultListShow(visible)
A callback that is run when the suggestion results dropdown list is made visible. Will run after every search query.

The argument `visible` indicates whether the result list is actually visible. Regarding the configuration, the result list will not be shown if there are not items available.

### Methods
The plugin itself provides different methods depending on the internal state.

#### init (default)
Arguments: `data`, `options`

This is the default method and requires the options as described. This means that `$('input').autoSuggest('init', 'url', {})` is equal to `$('input').autoSuggest('url', {})`.

#### add
Arguments: `data` or array of `data`

Example 1:
```javascript
$('input').autoSuggest('add', {
  id : 4711, name : 'Mick Jagger'
})
```

Example 2:
```javascript
$('input').autoSuggest('add', {
  id : 4711, name : 'Mick Jagger'
}, {
 id : 4712, name : 'Kelly Slater'
})
```

#### remove
Arguments: `value` or array of `value`

Example 1:
```javascript
$('input').autoSuggest('remove', 4711)
```

Example 2:
```javascript
$('input').autoSuggest('remove', 4711, 4722)
```

#### defaults
Arguments: `options` an object, `replace` an optional way to replace the defaults instead of merging only

Example: Set `neverSubmit` being always `true`.
```javascript
$.fn.autoSuggest('defaults', {neverSubmit: true})
```

Basically, the command will perform a simple `$.extend(defaults, yourOptions)`. If you do not want to merge, but replace, then you can use `replace = true`. Please note you will be override the plugins defaults! Be careful!

## Examples

### Multiple elements on one page
The above line of code will apply *AutoSuggest* to all text type input elements on the page. Each one will be using the same set of `data`. If you want to have multiple *AutoSuggest* fields on your page that use different sets of `data`, make sure you select them separately. Like this:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.autoSuggest.min.js"></script>
<script>
$(function($) {
  $('div.someClass input').autoSuggest(data);
  $('#someID input').autoSuggest(other_data);
});
</script>
```

Doing the above will allow you to pass in different options and different `data` sets.

### Setup with static data

Below is an example of using *AutoSuggest* with a `data` Object and other various options:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.autoSuggest.min.js"></script>
<script>
$(function($) {
  var data = {items: [
    {value: "21", name: "Mick Jagger"},
    {value: "43", name: "Johnny Storm"},
    {value: "46", name: "Richard Hatch"},
    {value: "54", name: "Kelly Slater"},
    {value: "55", name: "Rudy Hamilton"},
    {value: "79", name: "Michael Jordan"}
  ]};
  $("input[type=text]").autoSuggest(data.items, {selectedItemProp: "name", searchObjProps: "name"});
});
</script>
```

### Setup using AJAX

Below is an example using a *URL* to gather the Data Object via *AJAX* and other various options:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.autoSuggest.min.js"></script>
<script>
$(function($) {
  $("input[type=text]").autoSuggest("http://example.com/path/to/script", {minChars: 2, matchCase: true});
});
</script>
```

The "value" property will be stored comma separated in a hidden input field when chosen from the "suggestion" dropdown list. You can see an example of the "value" property being set for each data item in the example above. Typically the "value" property would contain the ID of the item, so you can send a list of *chosen IDs* to your server.

### Setup using a data builder via function (no AJAX)

If the available data will change (i.e. if you progressively or asynchronously load more data for autosuggesting), you can pass a function to autosuggest as the data source.

The function will be passed two arguments:

* `query` - the string typed in the autosuggest box
* `next` - the `function(data, query)` you should call when you have the data available

```html
<script src="jquery.js"></script>
<script src="dist/jquery.autoSuggest.min.js"></script>
<script>
$(function($) {
  var slowly_loaded_data = {items: []};

  // Obviously, you'd do something more interesting here.
  setTimeout(function() { slowly_loaded_data = {items: [{value: '11', name: 'A name'}]}; }, 2000);

  function get_data(query, next) {
    next(slowly_loaded_data, query);
  };
  $("input[type=text]").autoSuggest(get_data);
});
</script>
```

### Example of backend (i.e. PHP)

Below is an example of how to process the data sent *via AJAX* to your server in *PHP*:

```php
<?php
$input = $_GET["q"];
$data = array();
// query your DataBase here looking for a match to $input
// DO NOT use this in production. ESCAPE ALWAYS! This is just a simplified example.
$query = mysql_query("SELECT * FROM my_table WHERE my_field LIKE '%$input%'");
while ($row = mysql_fetch_assoc($query)) {
  $json = array();
  $json['value'] = $row['id'];
  $json['name'] = $row['username'];
  $json['image'] = $row['user_photo'];
  $data[] = $json;
}
header("Content-type: application/json");
echo json_encode($data);
```

## Release History

## 2013-03-29 Version 2.3.0

* Add method `defaults` allowing extending or overriding the defaults: i.e. `$.fn.autoSuggest('defaults', {searchObjProps: 'title'});`

## 2013-03-29 Version 2.2.0

* Change: Switch to Grunt 0.4

## 2013-03-03 Version 2.1.0

* Fix: Travis builds weren't be possible. Instead of using hooks in `travis.yml` this will be now managed by a `Gemfile` and `bundler`.
* Fix: Some dependencies were not fixed correctly (i.e. CoffeeScript wents automatically up to 1.5). Until this is tests, this isn't not be supported.
* Fix: Exclude the Grunt task for `compass`.
* Add: New option `useOriginalInputName` which ensures that the hidden field's name will be set to the `input` ones.

## 2012-09-11 Version 2.0.1

* Fix: Leaving the input field does not work when `selectionLimit` is greater than 1 using the tab key.
* Fix: Using `canGenerateNewSelections = false` does not cleared the input field using tab or enter key.

## 2012-09-11 Version 2.0.0

The plugin project now uses **CoffeeScript** and **SASS** for source building. The unit tests run still with **QUnit**. **grunt** is used to manage dependencies, tasks and tests. In addition, **Travis CI** is now checking every commit.

* The plugin itself was rewritten in CoffeeScript.
* The plugin's CSS was rewritten in SASS.
* The plugin's test (QUnit) were slightly modified to work against a newer QUnit version without deprecation warnings (i.e. `equal` instead of `equals`).
* Support for Travis CI was added.
* Reduced memory consumption moving some local to global defined util functions.
* Extended `extraParams` being a plain object (with downgrade compatibility).
* Changed the Ajax call from `$.getJSON` to the more flexible `$.ajax`, besides introduced `ajaxOptions`.
* **API change**: *beforeRetrieve* was renamed to *beforeRequest* and was added the second argument `options`.
* **API change**: *retrieveComplete* was renamed to *afterRequest*.
* **API change**: *selectionAdded* was renamed to *afterSelectionAdd*.
* **API change**: *selectionClick* was renamed to *afterSelectionClick*.
* **API change**: *selectionRemoved* was renamed to *onSelectionRemove*.
* **API change**: New event: *afterSelectionRemove*.
* Added a built-in *fadeOut* feature.
* **API change**: *resultClick* was renamed to *onResultItemClick*.
* **API change**: *resultsComplete* was renamed to *afterResultListShow*.

## 2012-07-03 Version 1.7.0

* Fixed handling with comma containing values
* Fixed handling with HTML special characters like ", >, <. These characters will be encoded.
* Added support of HTML renderers in addition to the XSS issues.

## License
Copyright (c) 2012 Jan Philipp
Licensed under the MIT, GPL licenses.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

### Important notes
Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

### Installing grunt
_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
1. If grunt isn't installed globally, run `npm install -g grunt` to install the latest version. _You may need to run `sudo npm install -g grunt`._
1. From the root directory of this project, run `npm install` to install the project's dependencies.

### Installing PhantomJS

In order for the qunit task to work properly, [PhantomJS](http://www.phantomjs.org/) must be installed and in the system PATH (if you can run "phantomjs" at the command line, this task should work).

Unfortunately, PhantomJS cannot be installed automatically via npm or grunt, so you need to install it yourself. There are a number of ways to install PhantomJS.

* [PhantomJS and Mac OS X](http://ariya.ofilabs.com/2012/02/phantomjs-and-mac-os-x.html)
* [PhantomJS Installation](http://code.google.com/p/phantomjs/wiki/Installation) (PhantomJS wiki)

Note that the `phantomjs` executable needs to be in the system `PATH` for grunt to see it.

* [How to set the path and environment variables in Windows](http://www.computerhope.com/issues/ch000549.htm)
* [Where does $PATH get set in OS X 10.6 Snow Leopard?](http://superuser.com/questions/69130/where-does-path-get-set-in-os-x-10-6-snow-leopard)
* [How do I change the PATH variable in Linux](https://www.google.com/search?q=How+do+I+change+the+PATH+variable+in+Linux)

### Additional requirements

_Note: It can be helpful to look into the `.travis.yml` (configuration file for Travis CI Build system) which contains required dependencies._

Following modules are required:

* CoffeeScript - install via `npm install -g coffee-script`
* SASS - install via `gem install sass`
* Sqwish - install `npm install -g sqwish`

# Note on the original version

This project was a fork of **jQuery AutoSuggest** (1.6) by [Wu Yuntao](https://github.com/wuyuntao) at [https://github.com/wuyuntao/jquery-autosuggest](https://github.com/wuyuntao/jquery-autosuggest).

Originally, **jQuery AutoSuggest** (1.4) was developed by [Drew Wilson](http://drewwilson.com/) at [http://code.drewwilson.com/entry/autosuggest-jquery-plugin/](http://code.drewwilson.com/entry/autosuggest-jquery-plugin/)