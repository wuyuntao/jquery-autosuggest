/*! jQuery AutoSuggest - v2.5.0 - 2013-08-22
 * URL: http://hlsolutions.github.com/jquery-autosuggest
 * Copyright (c) 2013 Jan Philipp
 * Licensed MIT, GPL */

/*
jQuery AutoSuggest 2

This is a rewritten version of Drew Wilsons "AutoSuggest" plugin from 2009/2010.
www.drewwilson.com / code.drewwilson.com/entry/autosuggest-jquery-plugin

Originally forked by Wu Yuntao (on GitHub)
http://github.com/wuyuntao/jquery-autosuggest
Based on the 1.6er release dated in July, 2012
*/


(function() {
  var $, ConfigResolver, Events, SelectionHolder, Utils, defaults, pluginMethods,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  $ = jQuery;

  /* A collection of utility functions.*/


  Utils = (function() {
    function Utils() {}

    Utils.prototype._ = void 0;

    Utils.escapeQuotes = function(text) {
      if (text) {
        return text.replace(/"/g, '\\"');
      }
    };

    Utils.escapeHtml = function(text) {
      return $('<span/>').text(text).html();
    };

    Utils.setPlaceholderEnabled = function(input, enable) {
      var from, targets, to;
      targets = ['placeholder', 'disabled-placeholder'];
      if (enable) {
        from = targets[1];
        to = targets[0];
      } else {
        from = targets[0];
        to = targets[1];
      }
      if (input.attr(to) || !input.attr(from)) {
        return;
      }
      input.attr(to, function() {
        return input.attr(from);
      });
      input.removeAttr(from);
    };

    return Utils;

  })();

  /* A collection of configuration resolvers.*/


  ConfigResolver = (function() {
    function ConfigResolver() {}

    ConfigResolver.prototype._ = void 0;

    /*
    Resolving the extra params as an object.
    The input of options.extraParams can be a string, a function or an object.
    */


    ConfigResolver.getExtraParams = function(options) {
      var obj, pair, parts, result, _i, _len, _ref;
      result = options.extraParams;
      if ($.isFunction(result)) {
        result = result(this);
      }
      /**
       * AutoSuggest <= 1.7 supported only a string of params. Since 2, the extra params will be used as a standard
       * $.fn.Ajax "data" parameter. The next lines will ensure that the result is such an object.
      */

      if ($.type(result) === 'string') {
        obj = {};
        _ref = result.split('&');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pair = _ref[_i];
          if (!(pair !== '')) {
            continue;
          }
          parts = pair.split('=', 2);
          if (parts.length) {
            obj[parts[0]] = parts[1];
          }
        }
        result = obj;
      }
      return result;
    };

    return ConfigResolver;

  })();

  /* The SelectionControl maintains and manage any selections.*/


  SelectionHolder = (function() {
    SelectionHolder.prototype._ = void 0;

    SelectionHolder.prototype.hiddenField = null;

    SelectionHolder.prototype.items = null;

    function SelectionHolder(hiddenField, items) {
      this.hiddenField = hiddenField;
      this.items = items != null ? items : [];
    }

    SelectionHolder.prototype.syncToHiddenField = function() {
      var item, value, _i, _len, _ref;
      if (!this.hiddenField) {
        return;
      }
      value = '';
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        value += ',' + item;
      }
      if (value) {
        value += ',';
      }
      this.hiddenField.val(value || ',');
    };

    SelectionHolder.prototype.add = function(item) {
      if (!this.exist(item)) {
        this.items.push(item);
      }
      this.syncToHiddenField();
    };

    SelectionHolder.prototype.remove = function(item) {
      this.items = $.grep(this.items, function(value) {
        return value !== item;
      });
      this.syncToHiddenField();
    };

    SelectionHolder.prototype.isEmpty = function() {
      return this.items.length === 0;
    };

    SelectionHolder.prototype.exist = function(item) {
      return $.inArray(item, this.items) !== -1;
    };

    SelectionHolder.prototype.getAll = function() {
      return this.items.slice(0);
    };

    SelectionHolder.prototype.clear = function() {
      this.items = [];
      this.syncToHiddenField();
    };

    return SelectionHolder;

  })();

  Events = (function() {
    function Events() {}

    Events.onSelectionAdd = function(scope, containerElement, detachedElement, options, item, selections) {
      var element;
      element = options.onSelectionAdd.call(scope, containerElement, detachedElement, options);
      Utils.setPlaceholderEnabled(scope, selections.length === 0);
      if ($.isFunction(options.afterSelectionAdd)) {
        options.afterSelectionAdd.call(scope, element, item, selections);
      }
    };

    Events.onSelectionRemove = function(scope, element, options, item, selections) {
      if ($.isFunction(options.onSelectionRemove)) {
        options.onSelectionRemove.call(scope, element, options);
      }
      Utils.setPlaceholderEnabled(scope, selections.length === 0);
      if ($.isFunction(options.afterSelectionRemove)) {
        options.afterSelectionRemove.call(scope, element, item, selections);
      }
    };

    Events.onSelectionClick = function(scope, element, options, item, selections) {
      if ($.isFunction(options.afterSelectionClick)) {
        options.afterSelectionClick.call(scope, element, item, selections);
      }
      Utils.setPlaceholderEnabled(scope, selections.length === 0);
    };

    Events.onAjaxRequestDone = function(scope, ajaxRequest, options) {
      if ($.isFunction(options.onAjaxRequestDone)) {
        ajaxRequest.done(options.onAjaxRequestDone);
      }
    };

    Events.onAjaxRequestFail = function(scope, ajaxRequest, options) {
      if ($.isFunction(options.onAjaxRequestFail)) {
        ajaxRequest.fail(options.onAjaxRequestFail);
      }
    };

    Events.onAjaxRequestAlways = function(scope, ajaxRequest, options) {
      if ($.isFunction(options.onAjaxRequestAlways)) {
        ajaxRequest.always(options.onAjaxRequestAlways);
      }
    };

    Events.onRenderErrorMessage = function(scope, validationData, element, options) {
      if ($.isFunction(options.onRenderErrorMessage)) {
        options.onRenderErrorMessage.call(scope, validationData, element, options);
      }
    };

    Events.onRemoveErrorMessage = function(scope, validationData, element, options) {
      if ($.isFunction(options.onRenderErrorMessage)) {
        options.onRemoveErrorMessage.call(scope, validationData, element, options);
      }
    };

    return Events;

  })();

  /**
   * plugin's default options
  */


  defaults = {
    prefix: 'as',
    asHtmlID: false,
    useOriginalInputName: false,
    /**
     * Defines whether the HTML5 placeholder attribute should used.
    */

    usePlaceholder: false,
    /**
     * Defines predefined values which will be selected.
     * @type string a comma seperated list of name/id values OR array of object items
    */

    preFill: null,
    /**
     * Defines text shown as a placeholder.
     * This text will be displayed when nothing is selected and the field isn't focused.
     * @type string
    */

    startText: 'Enter Name Here',
    /**
     * Defines text shown in the suggestion resultbox when there isn't a match.
     * @type string
    */

    emptyText: 'No Results Found',
    /**
     * RegEx to replace values in emptyText values with query text
     * @type regex
    */

    emptyTextPlaceholder: /\{\d+\}/,
    /**
     * Defines text shown when the limit of selections was exceeded.
     * @type string
    */

    limitText: 'No More Selections Are Allowed',
    /**
     * Defines the property of an item which will be used for display.
     * @type string default 'value'
    */

    selectedItemProp: 'value',
    /**
     * Defines the property of an item which will be used for identification (id).
     * @type string default 'value'
    */

    selectedValuesProp: 'value',
    /**
     * Defines wether the result list should be filtered or not.
     * @type string default 'value'
    */

    searchActive: true,
    /**
     * Defines the property of an item which will be used for searching.
     * @type string default 'value'
    */

    searchObjProps: 'value',
    /**
     * Defines the query parameter. Used for sending the search query.
     * @type string default 'q'
    */

    queryParam: 'q',
    /**
     * Defines the limit parameter. Used for limiting the results.
     * @type string default 'limit'
    */

    limitParam: 'limit',
    /**
     * number for 'limit' param on ajaxRequest
     * @type number
    */

    retrieveLimit: null,
    /**
     * Defines additional extraParams which will be appended to the ajaxRequest.
     * The recommended way is defining an object or a function returning such a object.
     *
     * If this is a string or a function returning a string, the string must be a valid query url. Internally,
     * the string will be split by '&' and '=' and built to an object. This is only available due backwards
     * compatibility.
     *
     * @type string, function or object
    */

    extraParams: null,
    /**
     * Defines whether the user input is case sensitive or not. Default is case insensitive.
     * @type boolean default false
    */

    matchCase: false,
    /**
     * Defines the minimum number of characters allowed for a tag to be valid.
     * @type number default 1
    */

    minChars: 1,
    /**
     * Defines the maximum number of characters allowed for a tag to be valid.
     * @type number default 100
    */

    maxChars: 100,
    /**
     * Defines the key delay. This is a recommended way when using an asynchronous fetcher (Ajax).
     * @type number default 400
    */

    keyDelay: 400,
    /**
     * Defines whether the result list's search/suggestion results should be highlight with the user query.
     * @type boolean default true
    */

    resultsHighlight: true,
    /**
     * Defines the limit of search/suggestion results.
     * @type number default none
    */

    selectionLimit: false,
    /**
     * Defines whether the result list should be displayed.
     * @type boolean default true
    */

    showResultList: true,
    /**
     * Defines whether the result list should be displayed even when there are no results.
     * @type boolean default false
    */

    showResultListWhenNoMatch: false,
    /**
     * Defines whether the input field can create new selections which aren't part of the suggestion.
     * @type boolean default true
    */

    canGenerateNewSelections: true,
    /**
     * FIXME needs doc
     * @type function
    */

    start: null,
    /**
     * Defines a trigger when clicking on a selection element.
     * @type function with arguments: element
    */

    afterSelectionClick: null,
    /**
     * Defines a trigger after adding a selection element.
     * @type function with arguments: elementBefore, id
    */

    afterSelectionAdd: null,
    /**
     * Defines a callback notifying when a element was removed.
     * @type function with arguments: element
    */

    afterSelectionRemove: null,
    /**
     * Defines a callback for adding a selection item.
     * @type function with arguments: containerElement, detachedElement
    */

    onSelectionAdd: function(containerElement, detachedElement, options) {
      containerElement.before(detachedElement);
      return containerElement.prev();
    },
    /**
     * Defines a callback for removing a selection item.
     * @type function with arguments: element
    */

    onSelectionRemove: function(element, options) {
      if (options.fadeOut) {
        return element.fadeOut(options.fadeOut, function() {
          return element.remove();
        });
      } else {
        return element.remove();
      }
    },
    /**
     * Defines a callback for rendering a validation error.
     * @type function with arguments: validationData, element
    */

    onRenderErrorMessage: function(validationData, element, options) {
      var error;
      error = $("#" + validationData.id);
      if (!error.length) {
        element.closest('ul').after("<span id='" + validationData.id + "' class='" + options.prefix + "-error'></span>");
        error = $("#" + validationData.id);
      }
      error.text(validationData.errorMessage);
      return setTimeout((function() {
        return element.focus();
      }), 10);
    },
    /**
     * Defines a callback for removing a validation error.
     * @type function with arguments: validationData, element
    */

    onRemoveErrorMessage: function(validationData, element, options) {
      return $("#" + validationData.id).remove();
    },
    /**
     * Defines a callback called for every item that will be rendered.
     * @type function with arguments: element
    */

    formatList: null,
    /**
     * Defines a callback function intercepting the url
     * @return String should return the ajaxRequest url
    */

    beforeRequest: null,
    /**
     * Defines a callback function intercepting the result data.
    */

    afterRequest: null,
    /**
     * Defines a deferred callback function for the internal ajax request (on success).
    */

    onAjaxRequestDone: null,
    /**
     * Defines a deferred callback function for the internal ajax request (on error).
    */

    onAjaxRequestFail: null,
    /**
     * Defines a deferred callback function for the internal ajax request (on complete).
    */

    onAjaxRequestAlways: null,
    /**
     * Defines a trigger after clicking on a search result element.
     * @type function with arguments: data
    */

    onResultItemClick: null,
    /**
     * Defines a trigger called after processData.
     * @type function
    */

    afterResultListShow: null,
    /**
     * Defines whether an "event.preventDefault()" should be executed on an ENTER key.
     * @type boolean default false
    */

    neverSubmit: false,
    /**
     * Defines whether an "event.stopPropagation()" should be executed on an ESC key.
     * @type boolean default false
    */

    preventPropagationOnEscape: false,
    /**
     * Defines the base options used for the ajaxRequest.
    */

    ajaxOptions: {
      type: 'get',
      dataType: 'json'
    },
    /**
     * specifies a list of attributes which will be applied to each input on startup
    */

    inputAttrs: {
      autocomplete: 'off'
    },
    /**
     * Defines whether the removing of a selection should be animated (using fadeOut)
    */

    fadeOut: false,
    /**
     * Defines whether the server filter remote or not. If asuming so, this prevents the plugin to filter again.
    */

    remoteFilter: false
  };

  pluginMethods = {
    init: function(dataSource, options) {
      var ajaxRequest, fetcher;
      options = $.extend({}, defaults, options);
      ajaxRequest = null;
      if (options.remoteFilter === 'auto') {
        options.remoteFilter = ($.type(dataSource)) === 'string';
      }
      fetcher = (function() {
        switch ($.type(dataSource)) {
          case 'function':
            return dataSource;
          case 'string':
            return function(query, callback) {
              var ajaxRequestConfig, extraParams, onDone, params;
              params = {};
              /* ensures query is encoded*/

              params["" + options.queryParam] = encodeURIComponent(decodeURIComponent(query));
              if (options.retrieveLimit) {
                params[options.limitParam] = encodeURIComponent(options.retrieveLimit);
              }
              extraParams = ConfigResolver.getExtraParams(options);
              if ($.type(extraParams) === 'object') {
                $.extend(params, extraParams);
              }
              ajaxRequestConfig = $.extend({}, options.ajaxOptions, {
                url: dataSource,
                data: params
              });
              onDone = function(data) {
                if ($.isFunction(options.afterRequest)) {
                  data = options.afterRequest.apply(this, [data]);
                }
                return callback(data, query);
              };
              ajaxRequest = $.ajax(ajaxRequestConfig).done(onDone);
              Events.onAjaxRequestDone(this, ajaxRequest, options);
              Events.onAjaxRequestFail(this, ajaxRequest, options);
              Events.onAjaxRequestAlways(this, ajaxRequest, options);
            };
          case 'array':
          case 'object':
            return function(query, callback) {
              return callback(dataSource, query);
            };
        }
      })();
      if (!fetcher) {
        return;
      }
      /*
      For each selected item, we will create an own scope.
      All variables above are "instance" locale!
      */

      return this.each(function() {
        var abortRequest, addSelection, clonePublicApi, currentSelection, element, elementId, hiddenInputField, hiddenInputFieldId, hiddenInputFieldName, i, input, inputWrapper, input_focus, interval, item, keyChange, lastKeyPressCode, lastKeyWasTab, moveResultSelection, new_value, num_count, prev, processData, processRequest, publicApi, resultsContainer, resultsList, selectionsContainer, timeout, timmedInput, validationErrorId, validations, value, _i, _j, _len, _len1, _ref, _ref1;
        options.inputAttrs = $.extend(options.inputAttrs, {});
        input_focus = false;
        input = $(this);
        element = null;
        elementId = null;
        hiddenInputField = null;
        hiddenInputFieldId = null;
        hiddenInputFieldName = null;
        validationErrorId = null;
        if (options.asHtmlID) {
          element = options.asHtmlID;
          elementId = element;
          hiddenInputFieldId = "" + options.prefix + "-values-" + element;
          validationErrorId = "" + options.prefix + "-validation-error-" + element;
          if (options.useOriginalInputName) {
            hiddenInputFieldName = input.attr('name');
            input.attr({
              name: "old_" + (input.attr('name'))
            });
          } else {
            hiddenInputFieldName = "" + options.prefix + "_values_" + element;
          }
        } else {
          element = "" + (element || '') + (Math.floor(Math.random() * 100));
          elementId = "" + options.prefix + "-input-" + element;
          hiddenInputFieldId = "" + options.prefix + "-values-" + element;
          validationErrorId = "" + options.prefix + "-validation-error-" + element;
          if (options.useOriginalInputName) {
            hiddenInputFieldName = input.attr('name');
            input.attr({
              name: "old_" + (input.attr('name'))
            });
          } else {
            hiddenInputFieldName = "" + options.prefix + "_values_" + element;
          }
        }
        options.inputAttrs.id = elementId;
        if (!options.usePlaceholder) {
          options.inputAttrs.placeholder = options.startText;
        }
        input.attr(options.inputAttrs);
        input.addClass("" + options.prefix + "-input");
        if (!options.usePlaceholder) {
          input.val(options.startText);
        }
        input.wrap("<ul class=\"" + options.prefix + "-selections\" id=\"" + options.prefix + "-selections-" + element + "\"></ul>").wrap("<li class=\"" + options.prefix + "-original\" id=\"" + options.prefix + "-original-" + element + "\"></li>");
        selectionsContainer = $("#" + options.prefix + "-selections-" + element);
        inputWrapper = $("#" + options.prefix + "-original-" + element);
        resultsContainer = $("<div class=\"" + options.prefix + "-results\" id=\"" + options.prefix + "-results-" + element + "\"></div>");
        resultsList = $("<ul class=\"" + options.prefix + "-list\"></ul>");
        hiddenInputField = $("<input type=\"hidden\" class=\"" + options.prefix + "-values\" name=\"" + hiddenInputFieldName + "\" id=\"" + hiddenInputFieldId + "\" />");
        currentSelection = new SelectionHolder(hiddenInputField);
        interval = null;
        timeout = null;
        prev = '';
        lastKeyWasTab = false;
        lastKeyPressCode = null;
        num_count = 0;
        /*
          This api will be exposed to the "start" callback.
        */

        publicApi = {
          add: function(data) {
            var counted, item;
            counted = $(selectionsContainer).find('li').length;
            item = addSelection(data, "u" + counted);
            if (item != null) {
              item.addClass('blur');
            }
          },
          remove: function(value) {
            currentSelection.remove(value);
            selectionsContainer.find("li[data-value=\"" + (Utils.escapeHtml(value)) + "\"]").remove();
          }
        };
        clonePublicApi = function() {
          return {
            add: publicApi.add,
            remove: publicApi.remove
          };
        };
        input.bind('addSelection', function(event, data) {
          return publicApi.add(data);
        });
        input.bind('removeSelection', function(event, value) {
          return publicApi.remove(value);
        });
        /**
         * Adds the specified selection.
         * @param Object data
         * @param Number num
        */

        addSelection = function(data, num) {
          var closeElement, item;
          currentSelection.add(data[options.selectedValuesProp]);
          item = $("<li class=\"" + options.prefix + "-selection-item\" id=\"" + options.prefix + "-selection-" + num + "\" data-value=\"" + (Utils.escapeQuotes(Utils.escapeHtml(data[options.selectedValuesProp]))) + "\"></li>");
          item.on({
            'click': function() {
              element = $(this);
              Events.onSelectionClick(input, element, options, data[options.selectedValuesProp], currentSelection.getAll());
              selectionsContainer.children().removeClass('selected');
              element.addClass('selected');
            },
            'mousedown': function() {
              input_focus = false;
            }
          });
          closeElement = $("<a class=\"" + options.prefix + "-close\">&times;</a>");
          closeElement.click(function() {
            currentSelection.remove(data[options.selectedValuesProp]);
            Events.onSelectionRemove(input, item, options, null, currentSelection.getAll());
            input_focus = true;
            input.focus();
            return false;
          });
          if (typeof data[options.selectedItemProp] !== 'string') {
            Events.onSelectionAdd(input, inputWrapper, item.append(data[options.selectedItemProp]).prepend(closeElement), options, data, currentSelection.getAll());
          } else {
            Events.onSelectionAdd(input, inputWrapper, item.text(data[options.selectedItemProp]).prepend(closeElement), options, data, currentSelection.getAll());
          }
          return inputWrapper.prev();
        };
        /*
          DO START
        */

        if ($.isFunction(options.start)) {
          options.start.call(this, clonePublicApi());
        }
        switch ($.type(options.preFill)) {
          case 'string':
            _ref = options.preFill.split(',');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              value = _ref[_i];
              item = {};
              item["" + options.selectedValuesProp] = value;
              if (value !== '') {
                addSelection(item, "000" + i);
              }
            }
            break;
          case 'array':
            if (options.preFill.length) {
              if ($.isFunction(options.afterRequest)) {
                options.preFill = options.afterRequest.call(this, options.preFill);
              }
              _ref1 = options.preFill;
              for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
                item = _ref1[i];
                new_value = item[options.selectedValuesProp];
                if (typeof new_value === 'undefined') {
                  new_value = '';
                }
                if (new_value !== '') {
                  addSelection(item, "000" + i);
                }
              }
            }
        }
        if (!currentSelection.isEmpty()) {
          input.val('');
          selectionsContainer.find("li." + options.prefix + "-selection-item").addClass('blur').removeClass('selected');
          Utils.setPlaceholderEnabled(input, false);
        }
        input.after(hiddenInputField);
        selectionsContainer.on({
          'click': function() {
            input_focus = true;
            input.focus();
          },
          'mousedown': function() {
            selectionsContainer.children().removeClass('selected');
            input_focus = false;
          }
        });
        selectionsContainer.after(resultsContainer);
        keyChange = function() {
          /*
          Since most IME does not trigger any key events, if we press [del]
          and type some chinese character, `lastKeyPressCode` will still be [del].
          This might cause problem so we move the line to key events section;
          ignore if the following keys are pressed: [del] [shift] [capslock]
          */

          var string, _k, _results;
          if (lastKeyPressCode === 46 || __indexOf.call((function() {
            _results = [];
            for (_k = 9; _k < 31; _k++){ _results.push(_k); }
            return _results;
          }).apply(this), lastKeyPressCode) >= 0) {
            resultsContainer.hide();
            return;
          }
          string = input.val().replace(/[\\]+|[\/]+/g, '');
          if (string !== '' && string === prev) {
            return;
          }
          prev = string;
          if (validations.allValid(string.length) || (options.minChars === 0 && string.length === 0)) {
            selectionsContainer.addClass('loading');
            return processRequest(string);
          } else {
            selectionsContainer.removeClass('loading');
            return resultsContainer.hide();
          }
        };
        processRequest = function(string) {
          if ($.isFunction(options.beforeRequest)) {
            string = options.beforeRequest.apply(this, [string, options]);
          }
          abortRequest();
          return fetcher(string, processData);
        };
        processData = function(data, query) {
          var creation_hint, formatted, forward, matchCount, name, num, original_query, regex, resultsContainerVisible, str, text, workingData, _k, _l, _len2, _len3, _ref2;
          creation_hint = false;
          original_query = query;
          if (!options.matchCase) {
            query = query.toLowerCase();
          }
          query = query.replace('(', '\(', 'g').replace(')', '\)', 'g');
          matchCount = 0;
          resultsContainer.hide().html(resultsList.html(''));
          num = 0;
          if (options.canGenerateNewSelections && options.creationText && $.grep(data, function(item) {
            return item[options.selectedItemProp].toLowerCase() === query;
          }).length === 0 && !currentSelection.exist(query)) {
            formatted = $("<li class=\"" + options.prefix + "-result-item\" id=\"" + options.prefix + "-result-item-" + num + "\"></li>");
            formatted.on({
              click: function() {
                var n_data;
                n_data = {};
                n_data["" + options.selectedItemProp] = original_query;
                n_data["" + options.selectedValuesProp] = original_query;
                input.val('').focus();
                prev = '';
                addSelection(n_data, "00" + (selectionsContainer.find('li').length + 1));
                resultsContainer.hide();
              },
              mousedown: function() {
                input_focus = false;
              },
              mouseover: function() {
                element = $(this);
                resultsList.find('li').removeClass('active');
                element.addClass('active');
              }
            });
            formatted.data('data', {
              attributes: data[num],
              num: num_count
            });
            formatted = formatted.html('<em>' + original_query + '</em>' + options.creationText);
            resultsList.append(formatted);
            creation_hint = true;
          }
          for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
            item = data[_k];
            num_count++;
            forward = false;
            if (options.searchObjProps === 'value') {
              str = item.value;
            } else {
              str = '';
              _ref2 = options.searchObjProps.split(',');
              for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
                name = _ref2[_l];
                str += "" + item[$.trim(name)] + " ";
              }
            }
            if (str) {
              if (!options.matchCase) {
                str = str.toLowerCase();
              }
              if (!options.searchActive || ((str.indexOf(query) !== -1 || options.remoteFilter) && !currentSelection.exist(item[options.selectedValuesProp]))) {
                forward = true;
              }
            }
            if (forward) {
              formatted = $("<li class=\"" + options.prefix + "-result-item\" id=\"a" + options.prefix + "-result-item-" + num + "\"></li>");
              formatted.on({
                click: function() {
                  var number, raw_data;
                  element = $(this);
                  raw_data = element.data('data');
                  number = raw_data.num;
                  if (selectionsContainer.find("#" + options.prefix + "-selection-" + number).length <= 0 && !lastKeyWasTab) {
                    data = raw_data.attributes;
                    input.val('').focus();
                    prev = '';
                    addSelection(data, number);
                    if ($.isFunction(options.onResultItemClick)) {
                      options.onResultItemClick.call(this, raw_data);
                    }
                    resultsContainer.hide();
                  }
                  lastKeyWasTab = false;
                },
                mousedown: function() {
                  input_focus = false;
                },
                mouseover: function() {
                  element = $(this);
                  resultsList.find('li').removeClass('active');
                  element.addClass('active');
                }
              });
              formatted.data('data', {
                attributes: data[num],
                num: num_count
              });
              workingData = $.extend({}, data[num]);
              query = query.replace(/"/g, '\\"');
              regex = !options.matchCase ? new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + Utils.escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "gi") : new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + Utils.escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "g");
              /* When this is a string, escape the value and process a regular replacement for highlighting.*/

              if (typeof workingData[options.selectedItemProp] === 'string') {
                workingData[options.selectedItemProp] = Utils.escapeHtml(workingData[options.selectedItemProp]);
                if (options.resultsHighlight && query.length > 0) {
                  workingData[options.selectedItemProp] = workingData[options.selectedItemProp].replace(regex, '<em>$1</em>');
                }
              } else {
                if (options.resultsHighlight && query.length > 0) {
                  workingData[options.selectedItemProp].html(workingData[options.selectedItemProp].html().replace(regex, '<em>$1</em>'));
                }
              }
              if (!options.formatList) {
                formatted = formatted.html(workingData[options.selectedItemProp]);
              } else {
                formatted = options.formatList.call(this, workingData, formatted);
              }
              resultsList.append(formatted);
              matchCount++;
              if (options.retrieveLimit && options.retrieveLimit === matchCount) {
                break;
              }
            }
            num += 1;
          }
          selectionsContainer.removeClass('loading');
          if (matchCount <= 0 && !creation_hint) {
            text = options.emptyText;
            if ($.type(options.emptyTextPlaceholder) === 'regexp') {
              text = text.replace(options.emptyTextPlaceholder, query);
            }
            resultsList.html("<li class=\"" + options.prefix + "-message\">" + text + "</li>");
          }
          resultsList.css({
            width: selectionsContainer.outerWidth()
          });
          resultsContainerVisible = matchCount > 0 || options.showResultListWhenNoMatch || options.creationText;
          if (resultsContainerVisible) {
            resultsContainer.show();
          }
          if ($.isFunction(options.afterResultListShow)) {
            options.afterResultListShow.call(this, resultsContainerVisible);
          }
        };
        moveResultSelection = function(direction) {
          var active, lis, start;
          if (resultsContainer.find(':visible').length) {
            lis = resultsContainer.find('li');
            switch (direction) {
              case 'down':
                start = lis.eq(0);
                break;
              default:
                start = lis.filter(':last');
            }
            active = resultsContainer.find('li.active:first');
            if (active.length) {
              switch (direction) {
                case 'down':
                  start = active.next();
                  break;
                default:
                  start = active.prev();
              }
            }
            lis.removeClass('active');
            start.addClass('active');
          }
        };
        abortRequest = function() {
          if (!ajaxRequest) {
            return;
          }
          ajaxRequest.abort();
          ajaxRequest = null;
        };
        timmedInput = function(rawInput) {
          return $.trim(rawInput.replace(/(,)/g, ''));
        };
        validations = {
          clear: function() {
            var data;
            data = {
              id: validationErrorId
            };
            return Events.onRemoveErrorMessage(input, data, input, options);
          },
          allValid: function(charLength) {
            return charLength >= options.minChars && charLength <= options.maxChars;
          },
          renderMinChars: function() {
            var data;
            data = {
              id: validationErrorId,
              errorMessage: "must be at least " + options.minChars + " characters",
              type: 'minChars',
              limit: options.minChars
            };
            return Events.onRenderErrorMessage(input, data, input, options);
          },
          renderMaxChars: function() {
            var data;
            data = {
              id: validationErrorId,
              errorMessage: "must be " + options.maxChars + " characters or fewer",
              type: 'maxChars',
              limit: options.maxChars
            };
            return Events.onRenderErrorMessage(input, data, input, options);
          }
        };
        return input.on({
          focus: function() {
            element = $(this);
            if (!options.usePlaceholder && element.val() === options.startText && currentSelection.isEmpty()) {
              element.val('');
            } else if (input_focus) {
              selectionsContainer.find("li." + options.prefix + "-selections-item").removeClass('blur');
              if (element.val() !== '') {
                resultsList.css({
                  width: selectionsContainer.outerWidth()
                });
                if (validations.allValid()) {
                  resultsContainer.show();
                }
              }
            }
            if (interval) {
              clearInterval(interval);
            }
            interval = setInterval((function() {
              if (options.showResultList) {
                if (options.selectionLimit && selectionsContainer.find("li." + options.prefix + "-selection-item").length >= options.selectionLimit) {
                  resultsList.html("<li class=\"" + options.prefix + "-message\">" + options.limitText + "</li>");
                  if (validations.allValid()) {
                    resultsContainer.show();
                  }
                } else {
                  keyChange();
                }
              }
            }), options.keyDelay);
            input_focus = true;
            if (options.minChars === 0) {
              processRequest(element.val());
            }
            return true;
          },
          blur: function() {
            element = $(this);
            if (!options.usePlaceholder && element.val() === '' && currentSelection.isEmpty() && options.minChars > 0) {
              element.val(options.startText);
            } else if (input_focus) {
              selectionsContainer.find("li." + options.prefix + "-selection-item").addClass('blur').removeClass('selected');
              resultsContainer.hide();
            }
            if (interval) {
              clearInterval(interval);
            }
            Utils.setPlaceholderEnabled(element, currentSelection.isEmpty());
          },
          keyup: function() {
            var charLength;
            charLength = timmedInput(input.val()).length;
            if (charLength > options.maxChars) {
              validations.renderMaxChars();
            }
            if (validations.allValid(charLength) || charLength === 0) {
              return validations.clear();
            }
          },
          keydown: function(event) {
            /* track the last key pressed*/

            var active, first_focus, i_input, n_data, _selection, _selections;
            lastKeyPressCode = event.keyCode;
            first_focus = false;
            i_input = timmedInput(input.val());
            switch (event.keyCode) {
              case 38:
                event.preventDefault();
                moveResultSelection('up');
                break;
              case 40:
                event.preventDefault();
                if ($(":visible", resultsContainer).length > 0) {
                  moveResultSelection('down');
                } else {
                  if (timeout) {
                    clearTimeout(timeout);
                  }
                  timeout = setTimeout((function() {
                    keyChange();
                  }), options.keyDelay);
                }
                break;
              case 8:
                if (input.val() === '') {
                  _selections = currentSelection.getAll();
                  _selection = null;
                  if (_selections.length) {
                    _selection = _selections[_selections.length - 1];
                  } else {
                    _selection = null;
                  }
                  selectionsContainer.children().not(inputWrapper.prev()).removeClass('selected');
                  if (inputWrapper.prev().hasClass('selected')) {
                    currentSelection.remove(_selection);
                    Events.onSelectionRemove(input, inputWrapper.prev(), options, null, currentSelection.getAll());
                  } else {
                    Events.onSelectionClick(input, inputWrapper.prev(), options, null, currentSelection.getAll());
                    inputWrapper.prev().addClass('selected');
                  }
                }
                if (input.val().length === 1) {
                  resultsContainer.hide();
                  prev = '';
                  abortRequest();
                  validations.clear();
                }
                if (resultsContainer.find(':visible').length) {
                  if (timeout) {
                    clearTimeout(timeout);
                  }
                  timeout = setTimeout((function() {
                    keyChange();
                  }), options.keyDelay);
                }
                break;
              case 9:
              case 13:
              case 188:
                lastKeyWasTab = event.keyCode === 9;
                active = resultsContainer.find('li.active:visible:first');
                if (event.keyCode === 13 && resultsContainer.find('li.active:first').length) {
                  active.click();
                  resultsContainer.hide();
                  if (options.neverSubmit) {
                    event.preventDefault();
                  }
                  active = resultsContainer.find('li.active:first');
                } else if (options.canGenerateNewSelections) {
                  /* Generate a new bubble with text when no suggestion selected*/

                  if (i_input.length > options.maxChars) {
                    validations.renderMaxChars();
                  } else if (i_input.length !== 0 && i_input.length < options.minChars) {
                    validations.renderMinChars();
                  } else if (i_input !== '' && !currentSelection.exist(i_input) && active.length === 0) {
                    event.preventDefault();
                    n_data = {};
                    n_data["" + options.selectedItemProp] = i_input;
                    n_data["" + options.selectedValuesProp] = i_input;
                    addSelection(n_data, "00" + (selectionsContainer.find('li').length + 1));
                    input.val('');
                    validations.clear();
                    /* Cancel previous ajaxRequest when new tag is added*/

                    abortRequest();
                  }
                } else {
                  input.val('');
                }
                if (active.length) {
                  lastKeyWasTab = false;
                  active.click();
                  resultsContainer.hide();
                  if (options.neverSubmit) {
                    event.preventDefault();
                  }
                }
                break;
              case 27:
                if (options.preventPropagationOnEscape && resultsContainer.find(':visible').length) {
                  event.stopPropagation();
                }
                break;
              case 16:
              case 20:
                abortRequest();
                resultsContainer.hide();
            }
            Utils.setPlaceholderEnabled(input, currentSelection.isEmpty());
          }
        });
      });
    },
    add: function() {
      var element, item, items, _i, _len;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      element = $(this);
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        element.trigger('addSelection', item);
      }
    },
    remove: function() {
      var element, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      element = $(this);
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        element.trigger('removeSelection', value);
      }
    },
    defaults: function(options, replace) {
      if (replace == null) {
        replace = false;
      }
      if (replace) {
        defaults = {};
      }
      $.extend(defaults, options);
    }
  };

  $.fn.autoSuggest = function(method) {
    if (pluginMethods[method]) {
      return pluginMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
      return pluginMethods.init.apply(this, arguments);
    }
  };

}).call(this);
