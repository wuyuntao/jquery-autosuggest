/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false, ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global jQuery: false*/
(function ($) {

  $(function () {

    var el, res, sel,
      options = {
        asHtmlID : 'autosuggest',
        selectedItemProp : "name",
        searchObjProps : "name"
      },
      data = [
        {value : "21", name : "Mick Jagger"},
        {value : "43", name : "Johnny Storm"},
        {value : "46", name : "Richard Hatch"},
        {value : "54", name : "Kelly Slater"},
        {value : "55", name : "Rudy Hamilton"},
        {value : "79", name : "Michael Jordan"},
        {value : "76", name : "姚明"}
      ],
      keyCode = {
        DEL : 8,
        TAB : 9,
        ENTER : 13,
        ESC : 27,
        UP : 38,
        DOWN : 40,
        J : 74,
        COMMA : 188
      };

    function createAjaxMock_Success(url) {
      return $.mockjax({
        responseTimeout : 100,
        url : url,
        dataType : 'json',
        response : function (settings) {
          this.responseText = {
            requestData : settings.data,
            result : [
              {"value" : "Test"},
              {"value" : "Data"}
            ]
          };
        }
      });
    }

    function createAjaxMock_Error(url) {
      return $.mockjax({
        responseTimeout : 100,
        url : url,
        status : 400
      });
    }

    function destroyAjaxMock(id) {
      $.mockjaxClear(id);
    }

    function create(d, opts) {
      return $('<input type="text" name="autosuggest" value="" />')
        .appendTo("#container").autoSuggest(d || data, opts || options);
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

    module('Basic UI Tests: type and select', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Type J and select "Michael Jordan"', 8, function () {
      el = create();
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        // Here goes three suggestions
        res = results();
        equal(res.length, 3, "Should suggest three names");
        equal($(res[0]).text(), "Mick Jagger", "Should be Mick Jagger");
        equal($(res[1]).text(), "Johnny Storm", "Should be Johnny Storm");
        equal($(res[2]).text(), "Michael Jordan", "Should be Michael Jordan");

        // Select Michael Jordan
        $(res[2]).simulate("click");
        sel = selections();
        equal(sel.length, 1, "Should have one name");
        equal($(sel[0]).text(), "×Michael Jordan", "Should be Michael Jordan");
        equal($(sel[0]).attr('data-value'), "79", "Should set data-value on selection");
        equal(value().val(), ",79,", "Should be 79");

        start();
        remove();
      }, 500);
    });

    test('Type "Yao Ming" and select it by COMMA', 3, function () {
      el = create();
      // Type "Yap Ming" and ","
      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.COMMA});

      sel = selections();
      equal(sel.length, 1, "Should have one name");
      equal($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
      equal(value().val(), ",Yao Ming,", "Should be Yao Ming");
      remove();
    });

    test('Type "Yao Ming" and select it by TAB', 3, function () {
      el = create();
      // Type "Yap Ming" and "\t"
      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.TAB});

      sel = selections();
      equal(sel.length, 1, "Should have one name");
      equal($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
      equal(value().val(), ",Yao Ming,", "Should be Yao Ming");
      remove();
    });

    asyncTest('Select two values and remove both of them.', 5, function () {
      el = create();
      // Type "Yap Ming" and ","
      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.COMMA});

      setTimeout(function(){
        // Type "Michael Jordan" and ","
        el.focus();
        el.val("Michael Jordan");
        el.simulate("keydown", {"keyCode" : keyCode.COMMA});

        setTimeout(function(){
          sel = selections();
          equal(sel.length, 2, "Should have two name");
          equal($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
          equal($(sel[1]).text(), "×Michael Jordan", "Should be Michael Jordan");
          equal(value().val(), ",Yao Ming,Michael Jordan,", "Should be Yao Ming & Michael Jordan");

          setTimeout(function(){
            el.simulate("keydown", {"keyCode" : keyCode.DEL});
            el.simulate("keydown", {"keyCode" : keyCode.DEL});
            el.simulate("keydown", {"keyCode" : keyCode.DEL});
            el.simulate("keydown", {"keyCode" : keyCode.DEL});
            setTimeout(function(){
              sel = selections();
              equal(sel.length, 0, "Should have no selections.");
              start();
              remove();
            }, 200);
          }, 200);
        }, 200);
      }, 500);
    });

    asyncTest('Prefill two values and remove both of them.', 3, function () {
      el = create(null, {
        asHtmlID : 'autosuggest',
        selectedItemProp : "name",
        selectedValuesProp : "name",
        searchObjProps : "name",
        preFill : [{
          name : 'John Doe'
        }, {
          name : 'Max Mustermann'
        }]
      });

      setTimeout(function(){
        sel = selections();
        equal(sel.length, 2, "Should have two name");
        equal(value().val(), ",John Doe,Max Mustermann,", "Should be John Doe & Max Mustermann");

        setTimeout(function(){
          el.simulate("keydown", {"keyCode" : keyCode.DEL});
          el.simulate("keydown", {"keyCode" : keyCode.DEL});
          el.simulate("keydown", {"keyCode" : keyCode.DEL});
          el.simulate("keydown", {"keyCode" : keyCode.DEL});
          sel = selections();
          equal(sel.length, 0, "Should have no selections.");
          start();
          remove();
        }, 200);
      }, 500);
    });

    asyncTest('Type DOWN and see the result list.', 1, function () {
      el = create(null, $.extend({}, options, {
        minChars : 0
      }));
      el.focus();
      el.simulate("keydown", {"keyCode" : keyCode.DOWN});

      setTimeout(function () {
        res = results();
        equal(res.length, 7, "Should suggest three names");
        //el.simulate("keydown", {"keyCode" : keyCode.TAB});
        setTimeout(function(){
          start();
          remove();
        }, 500);
      }, 500);
    });

    module('Basic UI Tests: type, let suggest and select one', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Press enter to select suggestion', 4, function () {
      el = create();

      el.focus();
      el.val("J");
      el.simulate("keydown", {"keyCode" : keyCode.J});

      setTimeout(function () {
        res = results();

        // Mouse over the suggestion
        $(res[1]).simulate("mouseover");
        ok($(res[1]).hasClass("active"), "Should be highlighted");

        // Press enter key to select it
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        sel = selections();
        equal(sel.length, 1, "Should have one name");
        equal($(sel[0]).text(), "×Johnny Storm", "Should be Johnny Storm");
        equal(value().val(), ",43,", "Should be 43");

        start();
        remove();
      }, 500);
    });

    asyncTest('Press arrow keys to move the selection up and down', 10, function () {
      el = create();

      el.focus();
      el.val("J");
      el.simulate("keydown", {"keyCode" : keyCode.J});

      setTimeout(function () {
        res = results();

        // Move down to first suggest result
        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        ok($(res[0]).hasClass('active'), "Should be highlighted");

        // Move down to last suggest result
        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        ok($(res[2]).hasClass("active"), "Should be highlighted");

        // None of results should be highlighted
        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        $.each(res, function () {
          ok(!$(this).hasClass("active"), "Should not be highlighted");
        });

        // Move back to first suggest result
        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        ok($(res[0]).hasClass('active'), "Should be highlighted");

        // Now we move up...
        el.simulate("keydown", {"keyCode" : keyCode.UP});
        $.each(res, function () {
          ok(!$(this).hasClass("active"), "Should not be highlighted");
        });

        // Move back to last suggest result
        el.simulate("keydown", {"keyCode" : keyCode.UP});
        ok($(res[2]).hasClass("active"), "Should be highlighted");

        start();
        remove();
      }, 500);
    });

    module('Basic UI Tests: remove a selected item', {
      teardown : function () {
        remove();
      }
    });

    test('Click close button to remove a name', 3, function () {
      el = create();

      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.TAB});

      sel = selections();
      equal(sel.length, 1, "Should have one name");

      // Click the close button
      $(sel[0]).find("a.as-close").simulate("click");

      sel = selections();
      equal(sel.length, 0, "Should have no name left");
      equal(value().val(), ",", "Should have no name left");
      remove();
    });

    test('Press delete key twice to remove a name', 4, function () {
      el = create();

      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.COMMA});

      sel = selections();
      equal(sel.length, 1, "Should have one name");

      // First time press delete key
      el.simulate("keydown", {"keyCode" : keyCode.DEL});

      sel = selections();
      ok($(sel[0]).hasClass("selected"), "Should be selected");

      // Second time press delete key
      el.simulate("keydown", {"keyCode" : keyCode.DEL});

      sel = selections();
      equal(sel.length, 0, "Should have no name left");
      equal(value().val(), ",", "Should have no name left");
      remove();
    });

    module('Basic UI Tests: close suggestions', {
      teardown : function () {
        remove();
      }
    });

    test('Type "Yao Ming" but press than ESC. No value should be selected.', 1, function () {
      el = create();
      // Type "Yap Ming" and ","
      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.ESC});

      sel = selections();
      equal(sel.length, 0, "Should have no name");
      remove();
    });


    module('Basic UI Tests (Regressions)', {
      teardown : function () {
        remove();
      }
    });

    // https://github.com/jsloane/jquery-autosuggest/commit/623f2426f0f225884dedbb2b0e3efdce6c983951
    asyncTest('Check for regression: Type "*". should not fail.', 2, function () {
      el = create();
      $.simulate2.triggerKeyEventsForString(el, '*', 0, true);

      setTimeout(function () {
        sel = selections();
        equal(sel.length, 0, "Should have no result.");
        equal(value().val(), "", "Should be empty.");

        start();
        remove();
      }, 500);
    });

    // https://github.com/jsloane/jquery-autosuggest/commit/623f2426f0f225884dedbb2b0e3efdce6c983951
    asyncTest('Check for regression: Type "[". should not fail.', 2, function () {
      el = create();
      $.simulate2.triggerKeyEventsForString(el, '[', 0, true);

      setTimeout(function () {
        sel = selections();
        equal(sel.length, 0, "Should have no result.");
        equal(value().val(), "", "Should be empty.");

        start();
        remove();
      }, 500);
    });

    // https://github.com/jsloane/jquery-autosuggest/commit/623f2426f0f225884dedbb2b0e3efdce6c983951
    asyncTest('Check for regression: Type "(". should not fail.', 2, function () {
      el = create();
      $.simulate2.triggerKeyEventsForString(el, '(', 0, true);

      setTimeout(function () {
        sel = selections();
        equal(sel.length, 0, "Should have no result.");
        equal(value().val(), "", "Should be empty.");

        start();
        remove();
      }, 500);
    });

    module('Configuration: "data"', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Use function for data source', 1, function () {
      var wasCalled = false;

      function get_data(query, next) {
        wasCalled = true;
        next([
          {value : '123', name : 'zzzfffgg'}
        ], query);
      }

      el = $('<input type="text" name="autosuggest" value="" />')
        .appendTo("#container").autoSuggest(get_data, options);

      el.focus();
      el.val("Y");
      el.simulate("keydown", {"keyCode" : keyCode.Y});

      setTimeout(function () {
        equal(wasCalled, true, "Was the callback called?");
        start();
        remove();
      }, 500);
    });

    module('Configuration: "options.start"', {
      teardown : function () {
        remove();
      }
    });

    test('Add and remove from code', 4, function () {
      var callbacks;
      var opts = $.extend({}, options, {
        start : function (_callbacks) {
          callbacks = _callbacks;
        }
      });
      el = create('', opts);

      ok(callbacks, 'A callback object must be defined.');
      callbacks.add(data[0]);
      equal(selections().length, 1, "Should select using a callback.");

      callbacks.remove(data[1].value);
      equal(selections().length, 1, "Should not remove anything when unselected value is removed.");

      callbacks.remove(data[0].value);
      equal(selections().length, 0, "Should remove using a callback.");
    });

    module('Configuration: "options.neverSubmit"', {
      teardown : function () {
        remove();
      }
    });

    test('Type "Yao Ming" and select it by ENTER', 3, function () {
      el = create(null, $.extend({}, options, {
        neverSubmit : true
      }));
      // Type "Yap Ming" and "\t"
      el.focus();
      el.val("Yao Ming");
      el.simulate("keydown", {"keyCode" : keyCode.ENTER});

      sel = selections();
      equal(sel.length, 1, "Should have one name");
      equal($(sel[0]).text(), "×Yao Ming", "Should be Yao Ming");
      equal(value().val(), ",Yao Ming,", "Should be Yao Ming");
      remove();
    });

    module('Configuration: "onAjaxRequestAlways"', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Check that the callback will be called on success.', 3, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Success(url), response, called = false, opts = $.extend({}, options, {
        onAjaxRequestAlways : function (result, statusText, serverResponse) {
          called = true;
          response = serverResponse;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        start();
        equal(called, true, 'Callback should be called.');
        equal(response.statusText, 'OK', 'Response statusText should be "OK".');
        equal(response.status, 200, 'Response status should be "200".');
        remove();
        destroyAjaxMock(ajaxMock);
      }, 1000);
    });

    asyncTest('Check that the callback will be called on error.', 3, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Error(url), response, called = false, opts = $.extend({}, options, {
        onAjaxRequestAlways : function (result, statusText, serverResponse) {
          called = true;
          response = serverResponse;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        start();
        equal(called, true, 'Callback should be called.');
        notEqual(response.statusText, 'OK', 'Response statusText should be not "OK".');
        notEqual(response.status, 200, 'Response status should be not "200".');
        remove();
        destroyAjaxMock(ajaxMock);
      }, 1000);
    });

    module('Configuration: "onAjaxRequestDone"', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Check that the callback will be called on success.', 3, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Success(url), response, called = false, opts = $.extend({}, options, {
        onAjaxRequestDone : function (result, statusText, serverResponse) {
          called = true;
          response = serverResponse;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        start();
        equal(called, true, 'Callback should be called.');
        equal(response.statusText, 'OK', 'Response statusText should be "OK".');
        equal(response.status, 200, 'Response status should be "200".');
        remove();
        destroyAjaxMock(ajaxMock);
      }, 1000);
    });

    asyncTest('Check that the callback will be not called on error.', 2, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Error(url), response = null, called = false, opts = $.extend({}, options, {
        onAjaxRequestDone : function (result, statusText, serverResponse) {
          called = true;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        start();
        equal(called, false, 'Callback should be not called.');
        equal(response, null, 'Response should be null.');
        remove();
        destroyAjaxMock(ajaxMock);
      }, 1000);
    });

    module('Configuration: "onAjaxRequestFail"', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Check that the callback will be not called on success.', 2, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Success(url), response = null, called = false, opts = $.extend({}, options, {
        onAjaxRequestFail : function (result, statusText, serverResponse) {
          if (statusText === 'abort') {
            // Ignore aborted requests.
            return;
          }
          called = true;
          response = serverResponse;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        start();
        equal(called, false, 'Callback should be not called.');
        equal(response, null, 'Response should be null.');
        remove();
        destroyAjaxMock(ajaxMock);
      }, 1000);
    });

    asyncTest('Check that the callback will be called on error.', 3, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Error(url), response, called = false, opts = $.extend({}, options, {
        onAjaxRequestFail : function (result, statusText, serverResponse) {
          called = true;
          response = serverResponse;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);

      setTimeout(function () {
        start();
        equal(called, true, 'Callback should be called.');
        notEqual(response.statusText, 'OK', 'Response statusText should be not "OK".');
        notEqual(response.status, 200, 'Response status should be not "200".');
        remove();
        destroyAjaxMock(ajaxMock);
      }, 1000);
    });

    module('Configuration: "options.extraParams"', {
      teardown : function () {
        remove();
      }
    });

    asyncTest('Add extraParams with function (instead of ONLY a string)', 2, function () {
      var url = 'url-' + Math.round(10000 * Math.random()) + '.html', ajaxMock = createAjaxMock_Success(url), opts = $.extend({}, options, {

        extraParams : function () {
          return '&specific_location=1';
        },

        // Should returns the inner result of the wrapped response. Internally, this checks the wrapped state.
        afterRequest : function (data) {

          // Because of the mocked ajax, the data here is wrapped.
          deepEqual({q : 'J', specific_location : '1'}, data.requestData, 'The mocked ajax response should provide a correct origin.');
          notEqual(null, data.result, 'The mocked ajax response should have a data result.');

          setTimeout(function () {
            start();
            remove();
            destroyAjaxMock(ajaxMock);
          }, 500);

          return data.result;
        }
      });

      el = create(url, opts);
      $.simulate2.triggerKeyEventsForString(el, 'J', 0, true);
    });

    module('XSS Tests', {
      teardown : function () {
        remove();
      }
    });

    /**
     * XSS Check
     *
     * This checks if the plugin works correctly with values which contains special
     * html chairs like ", <, > or &.
     * Both situations (unescaped content from the server and unescaped content
     * from the user) have to be handled the right way.
     *
     * The injected code itself will store an single unique information right
     * into the element's dataset under the key name "test".
     */
    test('Type a complete injectable fragment. The selection have to be selected, but no execution is allowed due XSS problems.', 7, function () {
      var xssString = "\"><script type=\"text/javascript\">$('#autosuggest').data({test:'Injection works :('})</script>";
      el = create();

      el.data('test', 'No injection :)');
      equal($('#autosuggest').data('test'), 'No injection :)', "Element's injection marker should be initial.");

      el.focus();
      el.val(xssString);
      el.simulate("keydown", {"keyCode" : keyCode.COMMA});

      var sel = selections();
      equal(sel.length, 1, "Should have one value");
      equal(el.data('test'), 'No injection :)', "The injected should not be executed. It must NEVER happen.");
      equal($(sel[0]).text(), "×" + xssString, "Should be the string with special chars");
      equal(value().val(), "," + xssString + ",", "Should be the correct id.");

      // Checks that removing will work, too!
      el.simulate("keydown", {"keyCode" : keyCode.DEL});
      el.simulate("keydown", {"keyCode" : keyCode.DEL});

      sel = selections();
      equal(sel.length, 0, "Should have no value");
      equal(value().val(), ",", "Should be empty.");

      remove();
    });

    /**
     * XSS
     *
     * This checks if the plugin works correctly with values which contains special
     * html chairs like ", <, > or &.
     * Both situations (unescaped content from the server and unescaped content
     * from the user) have to be handled the right way.
     *
     * The injected code itself will store an single unique information right
     * into the element's dataset under the key name "test".
     */
    asyncTest('Type "script" to match an injectable fragment. The selection have to be selected, but no execution is allowed due XSS problems.', 9, function () {
      var xssString = "\"><script type=\"text/javascript\">$('#autosuggest').data({test:'Injection works :('})</script>";
      var xssId = "4711";
      var el = create([
        {value : xssId, name : xssString}
      ]);

      el.data('test', 'No injection :)');
      equal($('#autosuggest').data('test'), 'No injection :)', "Element's injection marker should be initial.");

      el.focus();
      el.val("script");

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).text(), xssString, "Should be the injectable code.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        var sel = selections();
        equal(sel.length, 1, "Should have one value");
        equal(el.data('test'), 'No injection :)', "The injected should not be executed. It must NEVER happen.");
        equal($(sel[0]).text(), "×" + xssString, "Should be the string with special chars");
        equal(value().val(), "," + xssId + ",", "Should be the correct id.");

        // Checks that removing will work, too!
        el.simulate("keydown", {"keyCode" : keyCode.DEL});
        el.simulate("keydown", {"keyCode" : keyCode.DEL});

        sel = selections();
        equal(sel.length, 0, "Should have no value");
        equal(value().val(), ",", "Should be empty.");

        start();
        remove();
      }, 500);
    });


    /**
     * XSS
     *
     * This checks if the plugin works correctly with values which contains special
     * html chairs like ", <, > or &.
     * Both situations (unescaped content from the server and unescaped content
     * from the user) have to be handled the right way.
     *
     * The injected code itself will store an single unique information right
     * into the element's dataset under the key name "test".
     */
    asyncTest('Type "\\">" to match an injectable fragment. The selection have to be selected, but no execution is allowed due XSS problems.', 15, function () {
      var xssString = "\"><script type=\"text/javascript\">$('#autosuggest').data({test:'Injection works :('})</script>";
      var xssSelectionEscaped = '<em>\"&gt;&lt;</em>script type=\"text/javascript\"&gt;$(\'#autosuggest\').data({test:\'Injection works :(\'})&lt;/script&gt;';
      var xssId = "4711";
      var query = "\"><";
      var el = create([
        {value : xssId, name : xssString}
      ]);

      el.data('test', 'No injection :)');
      equal($('#autosuggest').data('test'), 'No injection :)', "Element's injection marker should be initial.");

      el.focus();
      el.val(query);

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).html(), xssSelectionEscaped, "Should be the injectable code.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        var sel = selections();
        equal(sel.length, 1, "Should have one value");
        equal(el.data('test'), 'No injection :)', "The injected should not be executed. It must NEVER happen.");
        equal($(sel[0]).text(), "×" + xssString, "Should be the string with special chars");
        equal(value().val(), "," + xssId + ",", "Should be the correct id.");

        // Checks that removing will work.
        el.simulate("keydown", {"keyCode" : keyCode.DEL});
        el.simulate("keydown", {"keyCode" : keyCode.DEL});

        sel = selections();
        equal(sel.length, 0, "Should have no value");
        equal(value().val(), ",", "Should be empty.");

        // Checks that retyping will work.
        el.focus();
        el.val(query);

        setTimeout(function () {
          res = results();
          equal(res.length, 1, "Should suggest one value.");
          equal($(res[0]).html(), xssSelectionEscaped, "Should be the injectable code.");

          el.simulate("keydown", {"keyCode" : keyCode.DOWN});
          el.simulate("keydown", {"keyCode" : keyCode.ENTER});

          sel = selections();
          equal(sel.length, 1, "Should have one value");
          equal(el.data('test'), 'No injection :)', "The injected should not be executed. It must NEVER happen.");
          equal($(sel[0]).text(), "×" + xssString, "Should be the string with special chars");
          equal(value().val(), "," + xssId + ",", "Should be the correct id.");

          // Checks that removing will work.
          el.simulate("keydown", {"keyCode" : keyCode.DEL});
          el.simulate("keydown", {"keyCode" : keyCode.DEL});

          start();
          remove();
        }, 500);
      }, 500);
    });

    module('Advanced HTML-Renderer', {
      teardown : function () {
        remove();
      }
    });

    /**
     * Extended test case with a custom format list renderer.
     */
    asyncTest('Custom result list formatter', 7, function () {
      var data = [
        {
          value : '4711',
          img : 'john.png',
          name : 'John Doe'
        }
      ];
      var opts = {
        asHtmlID : 'autosuggest',
        selectedItemProp : "name",
        searchObjProps : "name",
        formatList : function (data, elem) {
          return elem.append('<div><img src="' + data.img + '"/><span>' + data.name + '</span></div>');
        }
      };
      var query = 'Doe';
      el = create(data, opts);

      el.focus();
      el.val(query);

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).html(), '<div><img src="john.png"><span>John <em>Doe</em></span></div>', "Should be rendered output.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        var sel = selections();
        equal(sel.length, 1, "Should have one value");
        equal($(sel[0]).text(), '×John Doe', "Should be John Doe.");
        equal(value().val(), ",4711,", "Should be 4711.");

        // Checks that removing will work, too!
        el.simulate("keydown", {"keyCode" : keyCode.DEL});
        el.simulate("keydown", {"keyCode" : keyCode.DEL});

        sel = selections();
        equal(sel.length, 0, "Should have no value");
        equal(value().val(), ",", "Should be empty.");

        start();
        remove();
      }, 500);
    });


    /**
     * Extended test case with a custom format list renderer and prefilling content. After that, delete #2 and then #1.
     */
    asyncTest('Custom result list formatter + prefilling, delete them all.', 12, function () {
      var data = [
        {
          value : '4711',
          img : 'john.png',
          name : 'John Doe'
        }
      ];
      var opts = {
        asHtmlID : 'autosuggest',
        selectedItemProp : "name",
        searchObjProps : "name",
        formatList : function (data, elem) {
          return elem.append('<div><img src="' + data.img + '"/><span>' + data.name + '</span></div>');
        },
        preFill : [
          {
            value : '123',
            img : 'donald.png',
            name : 'Donald Duck'
          }
        ]
      };
      var query = 'Doe';
      el = create(data, opts);

      var sel = selections();
      equal(sel.length, 1, "Prefill: The number of selections should be exactly one.");
      equal(value().val(), ",123,", "Prefill: Value should be 123.");

      el.focus();
      el.val(query);

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).html(), '<div><img src="john.png"><span>John <em>Doe</em></span></div>', "Should be rendered output.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        sel = selections();
        equal(sel.length, 2, "Should have two values");
        equal($(sel[0]).text(), '×Donald Duck', "#1 should be Donald Duck.");
        equal($(sel[1]).text(), '×John Doe', "#2 should be John Doe.");
        equal(value().val(), ",123,4711,", "Should be 123,4711.");

        // Checks that removing will work, too!
        el.simulate("keydown", {"keyCode" : keyCode.DEL});
        el.simulate("keydown", {"keyCode" : keyCode.DEL});

        sel = selections();
        equal(sel.length, 1, "Should have one value");
        equal(value().val(), ",123,", "Should be 123.");

        el.simulate("keydown", {"keyCode" : keyCode.DEL});
        el.simulate("keydown", {"keyCode" : keyCode.DEL});

        sel = selections();
        equal(sel.length, 0, "Should have no value");
        equal(value().val(), ",", "Should be empty.");

        start();
        remove();
      }, 500);
    });


    /**
     * Extended test case with a custom format list renderer and prefilling content. After that, delete #1 and then #2
     */
    asyncTest('Custom result list formatter + prefilling, delete them all (w/ mouse).', 12, function () {
      var data = [
        {
          value : '4711',
          img : 'john.png',
          name : 'John Doe'
        }
      ];
      var opts = {
        asHtmlID : 'autosuggest',
        selectedItemProp : "name",
        searchObjProps : "name",
        formatList : function (data, elem) {
          return elem.append('<div><img src="' + data.img + '"/><span>' + data.name + '</span></div>');
        },
        preFill : [
          {
            value : '123',
            img : 'donald.png',
            name : 'Donald Duck'
          }
        ]
      };
      var query = 'Doe';
      el = create(data, opts);

      var sel = selections();
      equal(sel.length, 1, "Prefill: The number of selections should be exactly one.");
      equal(value().val(), ",123,", "Prefill: Value should be 123.");

      el.focus();
      el.val(query);

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).html(), '<div><img src="john.png"><span>John <em>Doe</em></span></div>', "Should be rendered output.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        sel = selections();
        equal(sel.length, 2, "Should have two values");
        equal($(sel[0]).text(), '×Donald Duck', "#1 should be Donald Duck.");
        equal($(sel[1]).text(), '×John Doe', "#2 should be John Doe.");
        equal(value().val(), ",123,4711,", "Should be 123,4711.");

        // Checks that removing will work, too!
        selections().eq(0).find('a.as-close').click();

        sel = selections();
        equal(sel.length, 1, "Should have one value");
        equal(value().val(), ",4711,", "Should be 4711.");

        selections().eq(0).find('a.as-close').click();

        sel = selections();
        equal(sel.length, 0, "Should have no value");
        equal(value().val(), ",", "Should be empty.");

        start();
        remove();
      }, 500);
    });


    /**
     * Extended test case with a custom html renderer and a prefilled entry.
     * Additionally, this customize the selection tokens w/ an additional image.
     */
    asyncTest('Custom result list formatter, prefilling and with image in selection tokens.', 9, function () {
      var renderer = function (data) {
        return $('<div><img src="' + data.img + '" height=16 width=16 style="float:left"/><span>' + data.name + '</span></div>');
      }, applyRenderer = function (data) {
        data.item = renderer(data);
        return data;
      };
      var data = [applyRenderer({
        value : '4711',
        img : 'john.png',
        name : 'John Doe'
      })];
      var opts = {
        asHtmlID : 'autosuggest',
        selectedItemProp : "item",
        searchObjProps : "name",
        formatList : function (data, elem) {
          return elem.append(data.item);
        },
        preFill : [applyRenderer({
          value : '123',
          img : 'donald.png',
          name : 'Donald Duck'
        })]
      };
      var query = 'Doe';
      el = create(data, opts);

      var sel = selections();
      equal(sel.length, 1, "Prefill: The number of selections should be exactly one.");
      equal($(sel[0]).html(), '<a class="as-close">×</a><div><img src="donald.png" height="16" width="16" style="float:left"><span>Donald Duck</span></div>', "#1 should be Donald Duck.");
      equal(value().val(), ",123,", "Prefill: Value should be 123.");

      el.focus();
      el.val(query);

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).html(), '<div><img src="john.png" height="16" width="16" style="float:left"><span>John <em>Doe</em></span></div>', "Should be rendered output.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        sel = selections();
        equal(sel.length, 2, "Should have two values");
        equal($(sel[0]).text(), '×Donald Duck', "#1 should be Donald Duck.");
        equal($(sel[1]).text(), '×John Doe', "#2 should be John Doe.");
        equal(value().val(), ",123,4711,", "Should be 123,4711.");
        start();
        remove();
      }, 500);
    });

    asyncTest('Custom result list formatter, prefilling and with image in selection tokens.', 10, function () {
      var renderer = function (data) {
        var escaped = $('<span/>').text(data.name).html();
        return $('<div><img src="' + data.img + '" height=16 width=16 style="float:left"/><span>' + escaped + '</span></div>');
      }, applyRenderer = function (data) {
        data.item = renderer(data);
        return data;
      };
      var data = [applyRenderer({
        value : '4711',
        img : 'john.png',
        name : "Bad John\"><script type=\"text/javascript\">$('#autosuggest').data({test:'Injection works (John) :('})</script>"
      })];
      var opts = {
        asHtmlID : 'autosuggest',
        selectedItemProp : "item",
        searchObjProps : "name",
        formatList : function (data, elem) {
          return elem.append(data.item);
        },
        preFill : [applyRenderer({
          value : '123',
          img : 'donald.png',
          name : "Bad Donald\"><script type=\"text/javascript\">$('#autosuggest').data({test:'Injection works (Donald) :('})</script>"
        })]
      };
      var query = 'john';
      el = create(data, opts);
      el.data('test', 'No injection :)');

      var sel = selections();
      equal(sel.length, 1, "Prefill: The number of selections should be exactly one.");
      equal($(sel[0]).html(), '<a class="as-close">×</a><div><img src="donald.png" height="16" width="16" style="float:left"><span>Bad Donald\"&gt;&lt;script type=\"text/javascript\"&gt;$(\'#autosuggest\').data({test:\'Injection works (Donald) :(\'})&lt;/script&gt;</span></div>', "#1 should be Donald Duck.");
      equal(value().val(), ",123,", "Prefill: Value should be 123.");

      el.focus();
      el.val(query);

      setTimeout(function () {
        var res = results();
        equal(res.length, 1, "Should suggest one value.");
        equal($(res[0]).html(), '<div><img src="john.png" height="16" width="16" style="float:left"><span>Bad <em>John</em>\"&gt;&lt;script type=\"text/javascript\"&gt;$(\'#autosuggest\').data({test:\'Injection works (<em>John</em>) :(\'})&lt;/script&gt;</span></div>', "Should be rendered output.");

        el.simulate("keydown", {"keyCode" : keyCode.DOWN});
        el.simulate("keydown", {"keyCode" : keyCode.ENTER});

        sel = selections();
        equal(el.data('test'), 'No injection :)', "The injected should not be executed. It must NEVER happen.");
        equal(sel.length, 2, "Should have two values");
        equal($(sel[0]).text(), '×Bad Donald\"><script type=\"text/javascript\">$(\'#autosuggest\').data({test:\'Injection works (Donald) :(\'})</script>', "#1 should be Donald Duck.");
        equal($(sel[1]).text(), '×Bad John\"><script type=\"text/javascript\">$(\'#autosuggest\').data({test:\'Injection works (John) :(\'})</script>', "#2 should be John Doe.");
        equal(value().val(), ",123,4711,", "Should be 123,4711.");
        start();
        remove();
      }, 500);
    });

  });


}(jQuery));
