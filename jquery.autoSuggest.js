 /*
 * AutoSuggest
 * Copyright 2009-2010 Drew Wilson
 * www.drewwilson.com
 * code.drewwilson.com/entry/autosuggest-jquery-plugin
 *
 * Originally gorked by Wu Yuntao
 * github.com/wuyuntao/jquery-autosuggest
 *
 * Forked by Jan Philipp (HL Solutions)
 * github.com/hlsolutions/jquery-autosuggest
 *
 * Version 1.7.0
 *
 * This Plug-In will auto-complete or auto-suggest completed search queries
 * for you as you type. You can add multiple selections and remove them on
 * the fly. It supports keybord navigation (UP + DOWN + RETURN), as well
 * as multiple AutoSuggest fields on the same page.
 *
 * Inspired by the Autocomplete plugin by: Joern Zaefferer
 * and the Facelist plugin by: Ian Tearle (iantearle.com)
 *
 * This AutoSuggest jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($){
    $.fn.autoSuggest = function(data, options) {
        var defaults = {
            asHtmlID: false,
            startText: "Enter Name Here",
            usePlaceholder: false,
            emptyText: "No Results Found",
            preFill: {},
            limitText: "No More Selections Are Allowed",
            selectedItemProp: "value", //name of object property
            selectedValuesProp: "value", //name of object property
            searchObjProps: "value", //comma separated list of object property names
            queryParam: "q",
            retrieveLimit: false, //number for 'limit' param on ajax request
            extraParams: "",
            matchCase: false,
            minChars: 1,
            keyDelay: 400,
            resultsHighlight: true,
            neverSubmit: false,
            selectionLimit: false,
            showResultList: true,
            showResultListWhenNoMatch: false,
            canGenerateNewSelections: true,
            start: function(){},
            selectionClick: function(elem){},
            selectionAdded: function(elem){},
            selectionRemoved: function(elem){ elem.remove(); },
            formatList: false, //callback function
            beforeRetrieve: function(string){ return string; },
            retrieveComplete: function(data){ return data; },
            resultClick: function(data){},
            resultsComplete: function(){},
            preventPropagationOnEscape : false
        };
        var opts = $.extend(defaults, options);

        function countValidItems(data) { var n = 0; for (k in data) if (data.hasOwnProperty(k)) n++; return n; }

        function getExtraParams() {
            var params = opts.extraParams;
            if($.isFunction(params)) {
                return params();
            }
            return params;
        }

        // Internal helper escaping html correctly.
        function escapeHtml(text) {
            return jQuery('<span/>').text(text).html();
        }
        // Internal helper escaping quotes correctly (when used in inline html templates).
        function escapeQuotes(text) {
            if (text) {
                return text.replace(/"/g, '\\"');
            }
        }

        var d_fetcher;
        var request = null;
        if(typeof data == "function") {
            d_fetcher = data;
        } else if(typeof data == "string") {
            d_fetcher = function(query, next) {
                var limit = "";
                if(opts.retrieveLimit){
                    limit = "&limit="+encodeURIComponent(opts.retrieveLimit);
                }
                request = $.getJSON(data+"?"+opts.queryParam+"="+encodeURIComponent(query)+limit+getExtraParams(), function(data){
                    var new_data = opts.retrieveComplete.call(this, data);
                    next(new_data, query);
                });
            };
        } else if(typeof data == "object" && countValidItems(data) > 0) {
            d_fetcher = function(query, next) { next(data, query); };
        }

        if(d_fetcher) {
            return this.each(function(x){
                if(!opts.asHtmlID){
                    x = x+""+Math.floor(Math.random()*100); //this ensures there will be unique IDs on the page if autoSuggest() is called multiple times
                    var x_id = "as-input-"+x;
                } else {
                    x = opts.asHtmlID;
                    var x_id = x;
                }
                opts.start.call(this, {
                    add: function(data) {
                             add_selected_item(data, 'u' + $('li', selections_holder).length).addClass('blur');
                         },
                    remove: function(value) {
                                Selections.remove(value);
                                selections_holder.find('li[data-value = "' + escapeHtml(value) + '"]').remove();
                            }
                });
                var input = $(this);
                input.attr("autocomplete","off").addClass("as-input").attr("id",x_id);
                if (opts.usePlaceholder) {
                    input.attr('placeholder', opts.startText);
                } else {
                    input.val(opts.startText);
                }
                var input_focus = false;

                // Setup basic elements and render them to the DOM
                input.wrap('<ul class="as-selections" id="as-selections-'+x+'"></ul>').wrap('<li class="as-original" id="as-original-'+x+'"></li>');
                var selections_holder = $("#as-selections-"+x);
                var org_li = $("#as-original-"+x);
                var results_holder = $('<div class="as-results" id="as-results-'+x+'"></div>').hide();
                var results_ul =  $('<ul class="as-list"></ul>');
                var values_input = $('<input type="hidden" class="as-values" name="as_values_'+x+'" id="as-values-'+x+'" />');
                // Setup a selections object maintaining the current selections.
                var Selections = (function(){
                   var items = [], syncToHiddenfield = function() {
                       var value = '', i = 0, c = items.length;
                       for (; i < c; i++) {
                           value = value + ',' + items[i];
                       }
                       if (value) {
                           value = value + ',';
                       }
                       // whenever the field was synced, there have to be an empty comma (legacy mode)
                       values_input.val(value || ',');
                   }
                   return {
                       add : function(item) {
                           if (!this.exist(item)) {
                               items.push(item);
                           }
                           syncToHiddenfield();
                       },
                       remove : function(item) {
                           items = jQuery.grep(items, function(value) {
                               return value !== item;
                           });
                           syncToHiddenfield();
                       },
                       isEmpty : function() {
                           return items.length === 0;
                       },
                       exist : function(item) {
                           return jQuery.inArray(item, items) !== -1;
                       },
                       getAll : function(){
                           // return cloned one
                           return items.slice(0);
                       },
                       clear : function() {
                           items = [];
                           syncToHiddenfield();
                       }
                   };
                })();
                var prefill_value = "";
                if(typeof opts.preFill == "string"){
                    var vals = opts.preFill.split(",");
                    for(var i=0; i < vals.length; i++){
                        var v_data = {};
                        v_data[opts.selectedValuesProp] = vals[i];
                        if(vals[i] != ""){
                            add_selected_item(v_data, "000"+i);
                        }
                    }
                    prefill_value = opts.preFill;
                } else {
                    prefill_value = "";
                    var prefill_count = 0;
                    for (k in opts.preFill) if (opts.preFill.hasOwnProperty(k)) prefill_count++;
                    if(prefill_count > 0){
                        for(var i=0; i < prefill_count; i++){
                            var new_v = opts.preFill[i][opts.selectedValuesProp];
                            if(new_v == undefined){ new_v = ""; }
                            prefill_value = prefill_value+new_v+",";
                            if(new_v != ""){
                                add_selected_item(opts.preFill[i], "000"+i);
                            }
                        }
                    }
                }
                if(prefill_value != ""){
                    input.val("");
                    $("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
                }
                input.after(values_input);
                selections_holder.click(function(){
                    input_focus = true;
                    input.focus();
                }).mousedown(function(){ input_focus = false; }).after(results_holder);

                var interval = null;
                var timeout = null;
                var prev = "";
                var totalSelections = 0;
                var tab_press = false;
                var lastKeyPressCode = null;

                // Handle input field events
                input.focus(function(){
                    if (!opts.usePlaceholder && $(this).val() == opts.startText && Selections.isEmpty()) {
                        $(this).val("");
                    } else if(input_focus){
                        $("li.as-selection-item", selections_holder).removeClass("blur");
                        if($(this).val() != ""){
                            results_ul.css("width",selections_holder.outerWidth());
                            results_holder.show();
                        }
                    }
                    if (interval) clearInterval(interval);
                    interval = setInterval(function() {
                        if(opts.showResultList){
                            if(opts.selectionLimit && $("li.as-selection-item", selections_holder).length >= opts.selectionLimit){
                                results_ul.html('<li class="as-message">'+opts.limitText+'</li>');
                                results_holder.show();
                            } else {
                                keyChange();
                            }
                        }
                    }, opts.keyDelay);
                    input_focus = true;
                    if (opts.minChars == 0){
                      processRequest($(this).val());
                    }
                    return true;
                }).blur(function(){
                    if (!opts.usePlaceholder && $(this).val() == "" && Selections.isEmpty() && prefill_value == "" && opts.minChars > 0) {
                        $(this).val(opts.startText);
                    } else if(input_focus){
                        $("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
                        results_holder.hide();
                    }
                    if (interval) clearInterval(interval);
                }).keydown(function(e) {
                    // track last key pressed
                    lastKeyPressCode = e.keyCode;
                    first_focus = false;
                    switch(e.keyCode) {
                        case 38: // up
                            e.preventDefault();
                            moveSelection("up");
                            break;
                        case 40: // down
                            e.preventDefault();
                            moveSelection("down");
                            break;
                        case 8:  // delete
                            if(input.val() == ""){
                                var last = Selections.getAll();
                                if (last.length > 0) {
                                    last = last[last.length - 1];
                                } else {
                                    last = null;
                                }
                                selections_holder.children().not(org_li.prev()).removeClass("selected");
                                if(org_li.prev().hasClass("selected")){
                                    Selections.remove(last);
                                    opts.selectionRemoved.call(this, org_li.prev());
                                } else {
                                    opts.selectionClick.call(this, org_li.prev());
                                    org_li.prev().addClass("selected");
                                }
                            }
                            if(input.val().length == 1){
                                results_holder.hide();
                                prev = "";
                                abortRequest();
                            }
                            if($(":visible",results_holder).length > 0){
                                if (timeout){ clearTimeout(timeout); }
                                timeout = setTimeout(function(){ keyChange(); }, opts.keyDelay);
                            }
                            break;
                        case 9: case 188:  // tab or comm
                            if(opts.canGenerateNewSelections){
                                tab_press = true;
                                var i_input = input.val().replace(/(,)/g, "");
                                var active = $("li.active:first", results_holder);
                                // Generate a new bubble with text when no suggestion selected
                                if (i_input !== "" && !Selections.exist(i_input) && i_input.length >= opts.minChars && active.length === 0) {
                                    e.preventDefault();
                                    var n_data = {};
                                    n_data[opts.selectedItemProp] = i_input;
                                    n_data[opts.selectedValuesProp] = i_input;
                                    var lis = $("li", selections_holder).length;
                                    add_selected_item(n_data, "00"+(lis+1));
                                    input.val("");
                                    // Cancel previous request when new tag is added
                                    abortRequest();
                                    break;
                                }
                            }
                        case 13: // return
                            tab_press = false;
                            var active = $("li.active:first", results_holder);
                            if(active.length > 0){
                                active.click();
                                results_holder.hide();
                            }
                            if(opts.neverSubmit || active.length > 0){
                                e.preventDefault();
                            }
                            break;
                        // ignore if the following keys are pressed: [escape] [shift] [capslock]
                        case 27: // escape
                            // Prevent event bubbling when pressing escape (e.g. when used in dialogs).
                            if (opts.preventPropagationOnEscape && $(':visible', results_holder).length > 0) {
                                e.stopPropagation();
                            }
                        case 16: // shift
                        case 20: // capslock
                            abortRequest();
                            results_holder.hide();
                            break;
                    }
                });

                function keyChange() {
                    // Since most IME does not trigger any key events, if we press [del]
                    // and type some chinese character, `lastKeyPressCode` will still be [del].
                    // This might cause problem so we move the line to key events section;
                    // ignore if the following keys are pressed: [del] [shift] [capslock]
                    // if( lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32) ){ return results_holder.hide(); }
                    var string = input.val().replace(/[\\]+|[\/]+/g,"");
                    if (string == prev) return;
                    prev = string;
                    if (string.length >= opts.minChars) {
                        selections_holder.addClass("loading");
                        processRequest(string);
                    } else {
                        selections_holder.removeClass("loading");
                        results_holder.hide();
                    }
                }
                function processRequest(string){
                  if(opts.beforeRetrieve){
                      string = opts.beforeRetrieve.call(this, string);
                  }
                  abortRequest();
                  d_fetcher(string, processData);
                }
                var num_count = 0;
                function processData(data, query){
                    if (!opts.matchCase){ query = query.toLowerCase(); }
                    query = query.replace("(", "\\(", "g").replace(")", "\\)", "g");
                    var matchCount = 0;
                    results_holder.html(results_ul.html("")).hide();
                    var d_count = countValidItems(data);
                    for(var i=0;i<d_count;i++){
                        var num = i;
                        num_count++;
                        var forward = false;
                        if(opts.searchObjProps == "value") {
                            var str = data[num].value;
                        } else {
                            var str = "";
                            var names = opts.searchObjProps.split(",");
                            for(var y=0;y<names.length;y++){
                                var name = $.trim(names[y]);
                                str = str+data[num][name]+" ";
                            }
                        }
                        if(str){
                            if (!opts.matchCase){ str = str.toLowerCase(); }
                            if (str.search(query) != -1 && !Selections.exist(data[num][opts.selectedValuesProp])) {
                                forward = true;
                            }
                        }
                        if(forward){
                            var formatted = $('<li class="as-result-item" id="as-result-item-'+num+'"></li>').click(function(){
                                    var raw_data = $(this).data("data");
                                    var number = raw_data.num;
                                    if($("#as-selection-"+number, selections_holder).length <= 0 && !tab_press){
                                        var data = raw_data.attributes;
                                        input.val("").focus();
                                        prev = "";
                                        add_selected_item(data, number);
                                        opts.resultClick.call(this, raw_data);
                                        results_holder.hide();
                                    }
                                    tab_press = false;
                                }).mousedown(function(){ input_focus = false; }).mouseover(function(){
                                    $("li", results_ul).removeClass("active");
                                    $(this).addClass("active");
                                }).data("data",{attributes: data[num], num: num_count});
                            var this_data = $.extend({},data[num]);
                            query = query.replace(/"/g, '\\"');
                            if (!opts.matchCase){
                                var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "gi");
                            } else {
                                var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "g");
                            }
                            // When this is a string, escape the value and process a regular replacement for highlighting.
                            if (typeof this_data[opts.selectedItemProp] === 'string') {
                                this_data[opts.selectedItemProp] = escapeHtml(this_data[opts.selectedItemProp]);
                                if (opts.resultsHighlight && query.length > 0){
                                    this_data[opts.selectedItemProp] = this_data[opts.selectedItemProp].replace(regx,"<em>$1</em>");
                                }
                            } else {
                                // jQuery Object.
                                this_data[opts.selectedItemProp].html(this_data[opts.selectedItemProp].html().replace(regx,"<em>$1</em>"));
                            }
                            if (!opts.formatList){
                                formatted = formatted.html(this_data[opts.selectedItemProp]);
                            } else {
                                formatted = opts.formatList.call(this, this_data, formatted);
                            }
                            results_ul.append(formatted);
                            delete this_data;
                            matchCount++;
                            if(opts.retrieveLimit && opts.retrieveLimit == matchCount ){ break; }
                        }
                    }
                    selections_holder.removeClass("loading");
                    if(matchCount <= 0){
                        results_ul.html('<li class="as-message">'+opts.emptyText+'</li>');
                    }
                    results_ul.css("width", selections_holder.outerWidth());
                    if (matchCount > 0 || !opts.showResultListWhenNoMatch) {
                        results_holder.show();
                    }
                    opts.resultsComplete.call(this);
                }

                function add_selected_item(data, num){
                    Selections.add(data[opts.selectedValuesProp]);
                    var item = $('<li class="as-selection-item" id="as-selection-' + num + '" data-value="' + escapeQuotes(escapeHtml(data[opts.selectedValuesProp])) + '"></li>').click(function() {
                            opts.selectionClick.call(this, $(this));
                            selections_holder.children().removeClass("selected");
                            $(this).addClass("selected");
                        }).mousedown(function(){ input_focus = false; });
                    var close = $('<a class="as-close">&times;</a>').click(function(){
                            Selections.remove(data[opts.selectedValuesProp]);
                            opts.selectionRemoved.call(this, item);
                            input_focus = true;
                            input.focus();
                            return false;
                        });
                    if (typeof data[opts.selectedItemProp] !== 'string') {
                        org_li.before(item.append(data[opts.selectedItemProp]).prepend(close));
                    } else {
                        org_li.before(item.text(data[opts.selectedItemProp]).prepend(close));
                    }
                    opts.selectionAdded.call(this, org_li.prev(), data[opts.selectedValuesProp]);
                    return org_li.prev();
                }

                function moveSelection(direction){
                    if($(":visible",results_holder).length > 0){
                        var lis = $("li", results_holder);
                        if(direction == "down"){
                            var start = lis.eq(0);
                        } else {
                            var start = lis.filter(":last");
                        }
                        var active = $("li.active:first", results_holder);
                        if(active.length > 0){
                            if(direction == "down"){
                            start = active.next();
                            } else {
                                start = active.prev();
                            }
                        }
                        lis.removeClass("active");
                        start.addClass("active");
                    }
                }

                function abortRequest() {
                    if (request) {
                        request.abort();
                        request = null;
                    }
                }

            });
        }
    };
})(jQuery);
