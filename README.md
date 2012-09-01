# jQuery Autosuggest [![Build Status](https://secure.travis-ci.org/hlsolutions/jquery-autosuggest.png?branch=master)](http://travis-ci.org/hlsolutions/jquery-autosuggest)

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
  $('input[type=text]').autoSuggest(data, options);
});
</script>
```

_Note: jQuery version 1.5 or above is required._

More examples see [here](#examples).

## How It Works

As you type into the AutoSuggest `input` box, it will filter through its `data` and suggest matched items to you. You can pass in an object of data or you can have it call a URL as you type to get its data from. AutoSuggest will display the matched items in a selectable list, which is 100% customizable. You have the option of structuring the HTML elements of that list however you want via the `formatList` callback function.

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

### `data`

Use an `array` if you want to define a static list of items. Each item must be an object with properties which will match your `options` keys `selectedItemProp`, `selectedValuesProp` and `searchObjProps`.

Use a `function` returning an `array` if you want to define dynamic builder of a list of items. The structure of this list must be the same as described for an `array`.

Use a `string` if you want to load the data asynchronously via AJAX. Eventually, in that case you want to override the option `afterRequest` to match the specification of a data array.


### `options`

* **ajaxOptions**: *object (type : 'get', dataType : 'json' by default)* - Defines the configuration options which will be applied to **$.ajax** when using Ajax on search.

* **onAjaxRequestAlways**: *deferred callback function* (deferred chaining of jQuery) - Defines a callback which will be called regardless of the response.

* **onAjaxRequestDone**: *deferred callback function* (deferred chaining of jQuery) - Defines a callback which will be called when the response succeeded.

* **onAjaxRequestFail**: *deferred callback function* (deferred chaining of jQuery) - Defines a callback which will be called when the response failed.

* **asHtmlID**: *string (false by default)* - Enables you to specify your own custom ID that will be appended to the top level AutoSuggest UL element's ID name. Otherwise it will default to using a random ID. Example: id="CUSTOM_ID". This is also applies to the hidden input filed that holds all of the selected values. Example: id="as-values-CUSTOM_ID"

* **startText**: *string ("Enter Name Here" by default)* - Text to display when the AutoSuggest input field is empty.

* **usePlaceholder**: *true or false (false by default)* - Set HTML5 placeholder attribute to display *startText* when the input field is empty.

* **emptyText**: *string ("No Results" by default)* - Text to display when their are no search results.

* **preFill**: *object or string (empty object by default)* - Enables you to pre-fill the AutoSuggest box with selections when the page is first loaded. You can pass in a comma separated list of values (a string), or an object. When using a string, each value is used as both the display text on the selected item and for it's value. When using an object, the options `selectedItemProp` will define the object property to use for the display text and `selectedValuesProp` will define the object property to use for the value for the selected item. Note: you must setup your preFill object in that format. A preFill object can look just like the example objects laid out above.

* **limitText**: *string ("No More Selections Are Allowed" by default)* - Text to display when the number of selections has reached it's limit.

* **selectedItemProp**: *string ("value" by default)* - Name of object property to use as the display text for each chosen item.

* **selectedValuesProp**: *string ("value" by default)* - Name of object property to use as the value for each chosen item. This value will be stored into the hidden input field.

* **searchObjProps**: *string ("value" by default)* - Comma separated list of object property names. The values in these objects properties will be used as the text to perform the search on.

* **queryParam**: *string ("q" by default)* - The name of the param that will hold the search string value in the AJAX request.

* **retrieveLimit**: *number (false by default)* - If set to a number, it will add a '&limit=' param to the AJAX request. It also limits the number of search results allowed to be displayed in the results dropdown box.

* **extraParams**: *callback object* OR *function* OR *string ("" by default)* - Before **AutoSuggest 2**, this will be added onto the end of the AJAX request URL. Since **version 2**, the recommended way to define `extraParams` is a static object or a function returning a object. These params will be applied to the Ajax call's params. If you are using the old -- but still supported -- way defining a string, make sure you add an '&' before each param. If used as a callback function, it must return a string or an object. The callback function is fired before each search is performed.

* **matchCase**: *true or false (false by default)* - Make the search case sensitive when set to true.

* **minChars**: *number (1 by default)* - Minimum number of characters that must be entered into the AutoSuggest input field before the search begins.

* **keyDelay**: *number (400 by default)* - Number of milliseconds to delay after a keydown on the AutoSuggest input field and before search is started.

* **resultsHighlight**: *true or false (true by default)* - Option to choose whether or not to highlight the matched text in each result item.

* **neverSubmit**: *true or false (false by default)* - If set to `true` this option will never allow the 'return' key to submit the form that AutoSuggest is a part of.

* **selectionLimit**: *number (false by default)* - Limits the number of selections that are allowed to be made to the number specified.

* **showResultList**: *true or false (true by default)* - If set to `false`, the Results Dropdown List will never be shown at any time.

* **start**: *callback function* - Custom function that is run only once on each AutoSuggest field when the code is first applied. A set of callbacks are passed. The callbacks are `add` (for selecting a data item from code -- pass the whole item to select) and `remove` (for removing a selected item from code -- pass the value).

* **selectionClick**: (elem, item, selections) *callback function* - Custom function that is run when a previously chosen item is clicked. The item that is clicked is passed into this callback function as 'elem'.
`Example: selectionClick: function(elem){ elem.fadeTo("slow", 0.33); }`

* **selectionAdded**: (elem, item, selections) *callback function* - Custom function that is run when a selection is made by choosing one from the Results dropdown, or by using the tab/comma keys to add one. The selection item is passed into this callback function as 'elem'.
`Example: selectionAdded: function(elem){ elem.fadeTo("slow", 0.33); }`

* **selectionRemoved**: (elem, item, selections) *callback function* - Custom function that is run when a selection removed from the AutoSuggest by using the delete key or by clicking the "x" inside the selection. The selection item is passed into this callback function as 'elem'.
`Example: selectionRemoved: function(elem){ elem.fadeTo("fast", 0, function(){ elem.remove(); }); }`

* **formatList**: *callback function* - Custom function that is run after all the data has been retrieved and before the results are put into the suggestion results list. This is here so you can modify what & how things show up in the suggestion results list.

* **beforeRequest**: *callback function* - Custom function that is run right before the AJAX request is made, or before the local objected is searched. This is used to modify the search string before it is processed. So if a user entered "jim" into the AutoSuggest box, you can call this function to prepend their query with "guy_". Making the final query = "guy_jim". The search query is passed into this function. `Example: beforeRequest: function(string){ return string; }`

* **afterRequest**: *callback function* - Custom function that is run after the ajax request has completed. The data object MUST be returned if this is used. `Example: afterRequest: function(data){ return data; }`

* **resultClick**: *callback function* - Custom function that is run when a search result item is clicked. The data from the item that is clicked is passed into this callback function as 'data'.
`Example: resultClick: function(data){ console.log(data); }`

* **resultsComplete**: *callback function* - Custom function that is run when the suggestion results dropdown list is made visible. Will run after every search query.

* **preventPropagationOnEscape**: *true or false (false by default)* - If set to `true` this option will prevent bubbling events when the Escape key was pressed.

The **formatList** option will hand you 2 objects:

* **data**: This is the data you originally passed into AutoSuggest (or retrieved via an AJAX request)
* **elem**: This is the HTML element you will be formatting (the 'result' `li` item).

In order to add extra things to the 'result' item (like an image) you will need to make sure you pass that data into AutoSuggest. Below is an example of formatList in action:

    formatList: function(data, elem){
        var my_image = data.image;
        var new_elem = elem.html("add/change stuff here, put image here, etc.");
        return new_elem;
    }

You MUST return the HTML object. **formatList** will run on each 'result' item.

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

## 2012-09-?? Version 2.0.0

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