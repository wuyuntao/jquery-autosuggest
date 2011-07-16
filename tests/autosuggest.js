$(function() {

var el, res, sel, val,
    options = {
        asHtmlID: 'autosuggest',
        selectedItemProp: "name",
        searchObjProps: "name"
    },
    data = [
        {value: "21", name: "Mick Jagger"},
        {value: "43", name: "Johnny Storm"},
        {value: "46", name: "Richard Hatch"},
        {value: "54", name: "Kelly Slater"},
        {value: "55", name: "Rudy Hamilton"},
        {value: "79", name: "Michael Jordan"},
        {value: "76", name: "姚明"}
    ],
    keyCode = {
        DEL:    8,
        TAB:    9,
        ENTER:  13,
        ESC:    27,
        UP:     38,
        DOWN:   40,
        J:      74,
        COMMA:  188
    };

function create() {
    return $('<input type="text" name="autosuggest" value=""></input>')
        .appendTo("#container").autoSuggest(data, options);
}

function selections() {
    return $("#as-selections-autosuggest li.as-selection-item");
}

function results() {
    return $("#as-results-autosuggest li.as-result-item");
}

function value() {
    return $("#as-values-autosuggest");
}

function remove() {
    $("#as-results-autosuggest, #as-selections-autosuggest").remove();
}

function debug() {
    window.console && console.debug.apply(console, arguments);
}

module("AutoSuggest TestCases");

test("Type J and select \"Michael Jordan\"", function() {
    el = create();
    // Type "J"
    // NOTE: Keydown event does not actually change the value of input,
    // You have to do this manually, and trigger the event later.
    el.focus();
    el.val("J");
    el.simulate("keydown", {"keyCode": keyCode.J});

    // Wait for building results
    stop();
    setTimeout(function() {
        // Here goes three suggestions
        res = results();
        equals(res.length, 3, "Should suggest three names");
        equals($(res[0]).text(), "Mick Jagger", "Should be Mick Jagger");
        equals($(res[1]).text(), "Johnny Storm", "Should be Johnny Storm");
        equals($(res[2]).text(), "Michael Jordan", "Should be Michael Jordan");

        // Select Michael Jordan
        $(res[2]).simulate("click");
        sel = selections();
        equals(sel.length, 1, "Should have one name");
        equals($(sel[0]).text(), "×Michael Jordan", "Should be Michael Jordan");
        equals($(sel[0]).attr('data-value'), "79", "Should set data-value on selection");
        equals(value().val(), ",79,", "Should be 79");

        start();
        remove();
    }, 500);
});

test("Type \"Yao Ming\" and select it by COMMA", function() {
    el = create();
    // Type "Yap Ming" and ","
    el.focus();
    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.COMMA});

    sel = selections();
    equals(sel.length, 1, "Should have one name");
    equals($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
    equals(value().val(), ",Yao Ming,", "Should be Yao Ming");
    remove();
});

test("Type \"Yao Ming\" and select it by TAB", function() {
    el = create();
    // Type "Yap Ming" and "\t"
    el.focus();
    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.TAB});

    sel = selections();
    equals(sel.length, 1, "Should have one name");
    equals($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
    equals(value().val(), ",Yao Ming,", "Should be Yao Ming");
    remove();
});

test("Press enter to select suggestion", function() {
    el = create();

    el.focus();
    el.val("J");
    el.simulate("keydown", {"keyCode": keyCode.J});

    stop();
    setTimeout(function() {
        res = results();

        // Mouse over the suggestion
        $(res[1]).simulate("mouseover");
        ok($(res[1]).hasClass("active"), "Should be highlighted");

        // Press enter key to select it
        el.simulate("keydown", {"keyCode": keyCode.ENTER});

        sel = selections();
        equals(sel.length, 1, "Should have one name");
        equals($(sel[0]).text(), "×Johnny Storm", "Should be Johnny Storm");
        equals(value().val(), ",43,", "Should be 43");

        start();
        remove();
    }, 500);
});

test("Press arrow keys to move the selection up and down", function() {
    el = create();

    el.focus();
    el.val("J");
    el.simulate("keydown", {"keyCode": keyCode.J});

    stop();
    setTimeout(function() {
        res = results();

        // Move down to first suggest result
        el.simulate("keydown", {"keyCode": keyCode.DOWN});
        ok($(res[0]).hasClass('active'), "Should be highlighted");

        // Move down to last suggest result
        el.simulate("keydown", {"keyCode": keyCode.DOWN});
        el.simulate("keydown", {"keyCode": keyCode.DOWN});
        ok($(res[2]).hasClass("active"), "Should be highlighted");

        // None of results should be highlighted
        el.simulate("keydown", {"keyCode": keyCode.DOWN});
        $.each(res, function() {
            ok(!$(this).hasClass("active"), "Should not be highlighted");
        });

        // Move back to first suggest result
        el.simulate("keydown", {"keyCode": keyCode.DOWN});
        ok($(res[0]).hasClass('active'), "Should be highlighted");

        // Now we move up...
        el.simulate("keydown", {"keyCode": keyCode.UP});
        $.each(res, function() {
            ok(!$(this).hasClass("active"), "Should not be highlighted");
        });

        // Move back to last suggest result
        el.simulate("keydown", {"keyCode": keyCode.UP});
        ok($(res[2]).hasClass("active"), "Should be highlighted");

        start();
        remove();
    }, 500);
});

test("Click close button to remove a name", function() {
    el = create();

    el.focus();
    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.TAB});

    sel = selections();
    equals(sel.length, 1, "Should have one name");

    // Click the close button
    $(sel[0]).find("a.as-close").simulate("click");

    sel = selections();
    equals(sel.length, 0, "Should have no name left");
    equals(value().val(), ",", "Should have no name left");
    remove();
});

test("Press delete key twice to remove a name", function() {
    el = create();

    el.focus();
    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.COMMA});

    sel = selections();
    equals(sel.length, 1, "Should have one name");

    // First time press delete key
    el.simulate("keydown", {"keyCode": keyCode.DEL});

    sel = selections();
    ok($(sel[0]).hasClass("selected"), "Should be selected");

    // Second time press delete key
    el.simulate("keydown", {"keyCode": keyCode.DEL});

    sel = selections();
    equals(sel.length, 0, "Should have no name left");
    equals(value().val(), ",", "Should have no name left");
    remove();
});

test("Use function for data source", function() {
    var wasCalled = false;
    function get_data(query, next) {
        wasCalled = true;
        next([{value: '123', name: 'zzzfffgg'}], query);
    }

    el = $('<input type="text" name="autosuggest" value=""></input>')
        .appendTo("#container").autoSuggest(get_data, options);

    el.focus();
    el.val("Y")
    el.simulate("keydown", {"keyCode": keyCode.Y});
    stop();
    setTimeout(function() {
      equals(wasCalled, true, "Was the callback called?");
      start();
      remove();
    }, 500);
});

test("Add and remove from code", function() {
    var callbacks;
    el = create($.extend(options, {
        start: function(_callbacks) {
                   callbacks = _callbacks;
               }
    }));

    callbacks.add(data[0]);
    equals(selections().length, 1, "Should select using a callback.");

    callbacks.remove(data[1].value);
    equals(selections().length, 1, "Should not remove anything when unselected value is removed.");

    callbacks.remove(data[0].value);
    equals(selections().length, 0, "Should remove using a callback.");
});

});
