# jQuery AutoSuggest Plugin

A fork of AutoSuggest jQuery plugin writtern by Drew Wilson.

<http://code.drewwilson.com/entry/autosuggest-jquery-plugin>

## How It Works

**AutoSuggest** will turn any regular text `input` box into a rad auto-complete box. It will dynamically create all the HTML elements that it needs to function. You don't need to add any extra HTML to work with AutoSuggest. Also, AutoSuggest uses **ZERO images**! All styling is done 100% in the included CSS file. This means it is super easy to customize the look of everything! You only need to edit the included CSS file. You can even use images if you want, just add the appropriate lines of code into the CSS file.

As you type into the AutoSuggest `input` box, it will filter through it's Data and "suggest" matched Data items to you. You can pass in an Object of Data to AutoSuggest or you can have it call a URL as you type to get it's Data from. AutoSuggest will display the matched Data items in a selectable list, which is 100% customizable. You have the option of structuring the HTML elements of that list however you want via the `formatList` callback function. You case an example of this in the second example above.

When you type into the `input` box and the "suggestion" dropdown list appears, a few things happen:

* A `class` of "loading" is applied to the main AutoSuggest `ul` while the data is loaded. That class is then removed when all processing has finished and before the suggestion results list is made visible.
* As you hover over each suggested option in the list a `class` of "selected" is added to that item, and then removed when you `mouseout`.
* When you make a selection the item is added to the `input` box. Also there is a hidden `input` field generated for each AutoSuggest box that stores the values (comma separated) of each item you have selected. This input box will have a unique ID as well as a class name of "as-values".

The plugin expects the Data passed into it (or gathered from the URL) to be formatted in [JSON](http://json.org/). JSON is an extremely easy format to work with, and if you don't already... you should :) To learn more about JSON, check out my post/video, [An Introduction to JSON](http://code.drewwilson.com/entry/an-introduction-to-json).

When an AJAX request is made the search string is sent over in a param named "q" by default. However you can change that name with the **queryParam** option. Here is a default example AJAX request: **http://www.mysite.com/your/script/?q=mick**
"mick" would be the search query that was typed into the `input` box. Be sure to setup your server-side code to grab that param and send back some results.

As of AutoSuggest version 1.4 you can now create selections by using the **tab** or **comma** keys. To do this simply type something into the box and hit the tab or comma keys. The selection is added to AutoSuggest in the exact same manner as if it were chosen from the Results dropdown.

AutoSuggest has been tested (and works) in: IE7 & IE8, Firefox, Safari, Opera, and Chrome.

## How To Use It

Obviously you need to make sure you have the latest jQuery library (at least 1.3) already loaded in your page. After that it's really simple, just add the following code to your page (make sure to wrap your code in jQuery's ready function): 

    $(function(){
        $("input[type=text]").autoSuggest(data);
    });

The above line of code will apply AutoSuggest to all text type `input` elements on the page. Each one will be using the same set of Data. If you want to have multiple AutoSuggest fields on your page that use different sets of Data, make sure you select them separately. Like this: 

    $(function(){
        $("div.someClass input").autoSuggest(data);
        $("#someID input").autoSuggest(other_data);
    });

Doing the above will allow you to pass in different options and different Data sets. Below is an example of using AutoSuggest with a Data Object and other various options:

    var data = {items: [
        {value: "21", name: "Mick Jagger"},
        {value: "43", name: "Johnny Storm"},
        {value: "46", name: "Richard Hatch"},
        {value: "54", name: "Kelly Slater"},
        {value: "55", name: "Rudy Hamilton"},
        {value: "79", name: "Michael Jordan"}
    ]};
    $("input[type=text]").autoSuggest(data.items, {selectedItemProp: "name", searchObjProps: "name"});

Below is an example using a URL to gather the Data Object and other various options:

    $("input[type=text]").autoSuggest("http://mysite.com/path/to/script", {minChars: 2, matchCase: true});

The "value" property will be stored (comma separated) in the hidden `input` field when chosen from the "suggestion" dropdown list. You can see an example of the "value" property being set for each data item in the example above. Typically the "value" property would contain the ID of the item, so you can send a list of "chosen" IDs to your server.

Below is an example of how to process the data sent via AJAX to your server in PHP:

    <?php
        $input = $_GET["q"];
        $data = array();
        // query your DataBase here looking for a match to $input
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
    ?>

If the available data will change (e.g. if you progressively or asynchronously load more data for autosuggesting),
you can pass a function to autosuggest as the data source.

    $(function() {
        var slowly_loaded_data = {items: []};

        // Obviously, you'd do something more interesting here.
        setTimeout(function() { slowly_loaded_data = {items: [{value: '11', name: 'A name'}]}; }, 2000);

        function get_data(query, next) {
            next(slowly_loaded_data, query);
        };
        $("input[type=text]").autoSuggest(get_data);
    });

The function will be passed two arguments:
* `query` - the string typed in the autosuggest box.
* `next`  - the `function(data,query)` you should call when you have the data available.

## Options

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

* **extraParams**: *string ("" by default)* - This will be added onto the end of the AJAX request URL. Make sure you add an '&' before each param.

* **matchCase**: *true or false (false by default)* - Make the search case sensitive when set to true.

* **minChars**: *number (1 by default)* - Minimum number of characters that must be entered into the AutoSuggest input field before the search begins.

* **keyDelay**: *number (400 by default)* - Number of milliseconds to delay after a keydown on the AutoSuggest input field and before search is started.

* **resultsHighlight**: *true or false (true by default)* - Option to choose whether or not to highlight the matched text in each result item.

* **neverSubmit**: *true or false (false by default)* - If set to `true` this option will never allow the 'return' key to submit the form that AutoSuggest is a part of.

* **selectionLimit**: *number (false by default)* - Limits the number of selections that are allowed to be made to the number specified.

* **showResultList**: *true or false (true by default)* - If set to `false`, the Results Dropdown List will never be shown at any time.

* **start**: *callback function* - Custom function that is run only once on each AutoSuggest field when the code is first applied. A set of callbacks are passed. The callbacks are `add` (for selecting a data item from code -- pass the whole item to select) and `remove` (for removing a selected item from code -- pass the value).

* **selectionClick**: *callback function* - Custom function that is run when a previously chosen item is clicked. The item that is clicked is passed into this callback function as 'elem'.
`Example: selectionClick: function(elem){ elem.fadeTo("slow", 0.33); }`

* **selectionAdded**: *callback function* - Custom function that is run when a selection is made by choosing one from the Results dropdown, or by using the tab/comma keys to add one. The selection item is passed into this callback function as 'elem'.
`Example: selectionAdded: function(elem){ elem.fadeTo("slow", 0.33); }`

* **selectionRemoved**: *callback function* - Custom function that is run when a selection removed from the AutoSuggest by using the delete key or by clicking the "x" inside the selection. The selection item is passed into this callback function as 'elem'.
`Example: selectionRemoved: function(elem){ elem.fadeTo("fast", 0, function(){ elem.remove(); }); }`

* **formatList**: *callback function* - Custom function that is run after all the data has been retrieved and before the results are put into the suggestion results list. This is here so you can modify what & how things show up in the suggestion results list.

* **beforeRetrieve**: *callback function* - Custom function that is run right before the AJAX request is made, or before the local objected is searched. This is used to modify the search string before it is processed. So if a user entered "jim" into the AutoSuggest box, you can call this function to prepend their query with "guy_". Making the final query = "guy_jim". The search query is passed into this function. Example: beforeRetrieve: function(string){ return string; }

* **retrieveComplete**: *callback function* - Custom function that is run after the ajax request has completed. The data object MUST be returned if this is used. `Example: retrieveComplete: function(data){ return data; }`

* **resultClick**: *callback function* - Custom function that is run when a search result item is clicked. The data from the item that is clicked is passed into this callback function as 'data'.
`Example: resultClick: function(data){ console.log(data); }`

* **resultsComplete**: *callback function* - Custom function that is run when the suggestion results dropdown list is made visible. Will run after every search query.

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

## License

**AutoSuggest** is dual licensed under the [MIT](http://www.opensource.org/licenses/mit-license.php) and [GPL](http://www.gnu.org/licenses/gpl.html) licenses.

## Authors

Originally developed by [Drew Wilson](http://drewwilson.com/)

### Contributors

* [Wu Yuntao](http://github.com/wuyuntao)
* [Fred Wu](http://github.com/fredwu)
* [Jeremy Mikola](http://github.com/jmikola)
