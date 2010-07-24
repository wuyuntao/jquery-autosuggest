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
        {value: "79", name: "Michael Jordan"}
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
    remove();
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
        equals(value().val(), "79,", "Should be 79");

        start();
    }, 500);
});

test("Type \"Yao Ming\" and select it by COMMA", function() {
    el = create();
    // Type "Yap Ming" and ","
    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.COMMA});

    sel = selections();
    equals(sel.length, 1, "Should have one name");
    equals($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
    equals(value().val(), "Yao Ming,", "Should be Yao Ming");
});

test("Type \"Yao Ming\" and select it by TAB", function() {
    el = create();
    // Type "Yap Ming" and "\t"
    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.TAB});

    sel = selections();
    equals(sel.length, 1, "Should have one name");
    equals($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
    equals(value().val(), "Yao Ming,", "Should be Yao Ming");
});

test("Press enter to select suggestion", function() {
    el = create();

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
        equals(value().val(), "43,", "Should be 43");

        start();
    }, 500);
});

test("Press arrow keys to move the selection up and down", function() {
    el = create();

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
    }, 500);
});

test("Click close button to remove a name", function() {
    el = create();

    el.val("Yao Ming");
    el.simulate("keydown", {"keyCode": keyCode.TAB});

    sel = selections();
    equals(sel.length, 1, "Should have one name");

    // Click the close button
    $(sel[0]).find("a.as-close").simulate("click");

    sel = selections();
    equals(sel.length, 0, "Should have no name left");
});

test("Press delete key twice to remove a name", function() {
    el = create();

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

});

});
