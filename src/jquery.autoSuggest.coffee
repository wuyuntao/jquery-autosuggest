###
This is a rewritten version of Drew Wilsons "AutoSuggest" plugin from 2009/2010.
www.drewwilson.com / code.drewwilson.com/entry/autosuggest-jquery-plugin

Originally forked by Wu Yuntao (on GitHub)
http://github.com/wuyuntao/jquery-autosuggest
Based on the 1.6er release dated in July, 2012
###

### Override any existing $ ###
$ = jQuery

### The SelectionControl maintains and manage any selections.###
class SelectionControl

  hiddenField : null
  items : null

  constructor : (@hiddenField, @items = []) ->

  syncToHiddenField : ->
    value = ''
    for item in @items
      value += ',' + item
    if value
      value += ','
    # whenever the field was synced, there have to be an empty comma (legacy mode)
    @hiddenField.val value || ','
    return

  add : (item) ->
    unless @exist item
      @items.push item
    @syncToHiddenField()
    return

  remove : (item) ->
    # Exclude only item.
    @items = $.grep @items, (value) -> value isnt item
    @syncToHiddenField()
    return

  isEmpty : -> @items.length is 0

  exist : (item) -> $.inArray(item, @items) isnt -1

  getAll : -> @items.slice 0 # clone

  clear : ->
    @items = []
    @syncToHiddenField()
    return

###
Defines the actual jQuery plugin
###
$.fn.autoSuggest = (data, options) ->

  ###*
   * plugin's default options
  ###
  defaults =

    asHtmlID : false

    ###*
     * Defines whether the HTML5 placeholder attribute should used.
    ###
    usePlaceholder : false

    ###*
     * Defines predefined values which will be selected.
     * @type string a comma seperated list of name/id values OR array of object items ###
    preFill : null

    ###*
     * Defines text shown as a placeholder.
     * This text will be displayed when nothing is selected and the field isn't focused.
     * @type string
    ###
    startText : 'Enter Name Here'

    ###*
     * Defines text shown in the suggestion resultbox when there isn't a match.
     * @type string
    ###
    emptyText : 'No Results Found'

    ###*
     * Defines text shown when the limit of selections was exceeded.
     * @type string
    ###
    limitText : 'No More Selections Are Allowed'

    ###*
     * Defines the property of an item which will be used for display.
     * @type string default 'value'
    ###
    selectedItemProp : 'value'

    ###*
     * Defines the property of an item which will be used for identification (id).
     * @type string default 'value'
    ###
    selectedValuesProp : 'value'

    ###*
     * Defines the property of an item which will be used for searching.
     * @type string default 'value'
    ###
    searchObjProps : 'value'

    ###*
     * Defines the query parameter. Used for sending the search query.
     * @type string default 'q'
    ###
    queryParam : 'q'

    ###*
     * Defines the limit parameter. Used for limiting the results.
     * @type string default 'limit'
    ###
    limitParam : 'limit'

    ###*
     * number for 'limit' param on ajax request
     * @type number
    ###
    retrieveLimit : null

    ###*
     * Defines additional extraParams which will be appended to the Ajax request.
     * The recommended way is defining an object or a function returning such a object.
     *
     * If this is a string or a function returning a string, the string must be a valid query url. Internally,
     * the string will be split by '&' and '=' and built to an object. This is only available due backwards
     * compatibility.
     *
     * @type string, function or object
    ###
    extraParams : null

    ###*
     * Defines whether the user input is case sensitive or not. Default is case insensitive.
     * @type boolean default false
    ###
    matchCase : false

    ###*
     * Defines the minimum of characters before the input will be a query against the defined fetcher (i.e. Ajax).
     * @type number default 1
    ###
    minChars : 1

    ###*
     * Defines the key delay. This is a recommended way when using an asynchronous fetcher (Ajax).
     * @type number default 400
    ###
    keyDelay : 400

    ###*
     * Defines whether the result list's search/suggestion results should be highlight with the user query.
     * @type boolean default true
    ###
    resultsHighlight : true

    ###*
     * Defines the limit of search/suggestion results.
     * @type number default none
    ###
    selectionLimit : false

    ###*
     * Defines whether the result list should be displayed.
     * @type boolean default true
    ###
    showResultList : true

    ###*
     * Defines whether the result list should be displayed even when there are no results.
     * @type boolean default false
    ###
    showResultListWhenNoMatch : false

    ###*
     * Defines whether the input field can create new selections which aren't part of the suggestion.
     * @type boolean default true
    ###
    canGenerateNewSelections : true

    ###*
     * FIXME needs doc
     * @type function
    ###
    start : null

    ###*
     * Defines a trigger when clicking on a selection element.
     * @type function with arguments: element
    ###
    selectionClick : null

    ###*
     * Defines a trigger after adding a selection element.
     * @type function with arguments: elementBefore, id
    ###
    selectionAdded : null

    ###*
     * Defines a callback for removing a selection item.
     * Note: Overriding this options means that the plugin itself won't destroy the element anymore.
     * @type function with arguments: element
    ###
    selectionRemoved : (elem) -> elem.remove()

    ###*
     * Defines a callback called for every item that will be rendered.
     * @type function with arguments: element
    ###
    formatList : null

    ###*
     * interceptor
    ###
    beforeRetrieve : (string) -> string

    ###*
     * interceptor
    ###
    retrieveComplete : (data) -> data

    ###*
     * Defines a trigger after clicking on a search result element.
     * @type function with arguments: data
    ###
    resultClick : null

    ###*
     * Defines a trigger called after processData.
     * @type function
    ###
    resultsComplete : null

    ###*
     * Defines whether an "event.preventDefault()" should be executed on an ENTER key.
     * @type boolean default false
    ###
    neverSubmit : false

    ###*
     * Defines whether an "event.stopPropagation()" should be executed on an ESC key.
     * @type boolean default false
    ###
    preventPropagationOnEscape : false

    ###*
     * Defines the base options used for the Ajax request.
    ###
    ajaxOptions :
      type : 'get'
      dataType : 'json'

  # build settings merging configuration with options
  options = $.extend {}, defaults, options

  ### TODO ###
  countObjectProperties = (object) -> (item for own item of object).length

  ###
  TODO: Utility
  ###
  getExtraParams = ->
    result = options.extraParams
    if $.isFunction result
      result = result(@)

    ###*
     * AutoSuggest <= 1.7 supported only a string of params. Since 2, the extra params will be used as a standard
     * $.fn.Ajax "data" parameter. The next lines will ensure that the result is such an object.
    ###
    if $.type(result) is 'string'
      obj = {}
      for pair in result.split '&' when pair isnt ''
        parts = pair.split '=', 2
        obj[parts[0]] = parts[1] if parts.length
      result = obj

    return result

  ###
  TODO: Utility
  Internal helper escaping HTML correctly.
  ###
  escapeHtml = (text) ->
    $('<span/>').text(text).html()

  ###
  TODO: Utility
  Internal helper escaping quotes correctly when used in inline HTML attributes).
  ###
  escapeQuotes = (text) ->
    if text then text.replace /"/g, '\\"'

  request = null
  fetcher = switch $.type data
    when 'function' # Callback
      data
    when 'string' # URL
      (query, next) ->
        params = {}
        ### ensures query is encoded ###
        params["#{options.queryParam}"] = encodeURIComponent(decodeURIComponent(query))

        if options.retrieveLimit
          params[options.limitParam] = encodeURIComponent options.retrieveLimit

        extraParams = getExtraParams()
        if $.type(extraParams) is 'object'
          $.extend params, extraParams

        ajaxCfg = $.extend {}, options.ajaxOptions,
          url : data
          data : params
        request = $.ajax(ajaxCfg).done (data) -> next(options.retrieveComplete.call(@, data), query)
    when 'array', 'object'
      (query, next) -> next(data, query)

  return unless fetcher

  ###
  For each selected item, we will create an own scope.
  ###
  return @each (element) ->
    input_focus = false
    input = $ @

    # Configure local IDs.
    unless options.asHtmlID
      # ensures there will be unique IDs on the page if autoSuggest() is called multiple times
      element = "#{element}#{Math.floor(Math.random() * 100)}"
      elementId = "as-input-#{element}"
    else
      element = options.asHtmlID
      elementId = element

    # Setup instance properties.

    input.attr autocomplete : 'off', id : elementId
    input.addClass 'as-input'
    if options.usePlaceholder
      input.attr placeholder : options.startText
    else
      input.val options.startText

    add_selected_item = (data, num) ->
      Selections.add data[options.selectedValuesProp]
      item = $ "<li class=\"as-selection-item\" id=\"as-selection-#{num}\" data-value=\"#{escapeQuotes(escapeHtml(data[options.selectedValuesProp]))}\"></li>"
      item.click ->
        element = $ @
        if $.isFunction(options.selectionClick) then options.selectionClick.call @, element
        selections_holder.children().removeClass 'selected'
        element.addClass 'selected'
        return
      item.mousedown ->
        input_focus = false
        return
      close = $ "<a class=\"as-close\">&times;</a>"
      close.click ->
        Selections.remove data[options.selectedValuesProp]
        if $.isFunction(options.selectionRemoved) then options.selectionRemoved.call @, item
        input_focus = true
        input.focus()
        return false
      if typeof data[options.selectedItemProp] isnt 'string'
        org_li.before item.append(data[options.selectedItemProp]).prepend(close)
      else
        org_li.before item.text(data[options.selectedItemProp]).prepend(close)
      if $.isFunction(options.selectionAdded) then options.selectionAdded.call @, org_li.prev(), data[options.selectedValuesProp]
      return org_li.prev()

    # Setup basic elements and render them to the DOM
    input.wrap("<ul class=\"as-selections\" id=\"as-selections-#{element}\"></ul>").wrap("<li class=\"as-original\" id=\"as-original-#{element}\"></li>")
    selections_holder = $ "#as-selections-#{element}"
    org_li = $ "#as-original-#{element}"
    results_holder = $ "<div class=\"as-results\" id=\"as-results-#{element}\"></div>"
    results_ul =  $ "<ul class=\"as-list\"></ul>"
    values_input = $ "<input type=\"hidden\" class=\"as-values\" name=\"as_values_#{element}\" id=\"as-values-#{element}\" />"

    ###
      DO START
    ###
    if $.isFunction options.start
      options.start.call @,
        add : (data) ->
          counted = $(selections_holder).find('li').length
          item = add_selected_item data, "u#{counted}"
          item?.addClass 'blur'
        remove : (value) ->
          Selections.remove value
          selections_holder.find("li[data-value=\"#{escapeHtml(value)}\"]").remove()

    Selections = new SelectionControl(values_input)
    prefill_value = ''

    switch $.type options.preFill
      when 'string'
        for value in options.preFill.split ','
          item = {}
          item["#{options.selectedValuesProp}"] = value
          if value isnt ''
            add_selected_item item, "000#{i}"
        prefill_value = options.preFill
      when 'array'
        prefill_value = ''
        if options.preFill.length
          for item, i in options.preFill
            new_value = item[options.selectedValuesProp]
            if typeof new_value is 'undefined'
              new_value = ''
            prefill_value += new_value + ','
            if new_value isnt ''
              add_selected_item item, "000#{i}"

    if prefill_value isnt ''
      input.val ''
      selections_holder.find('li.as-selection-item').addClass('blur').removeClass('selected')
    # Append input to DOM.
    input.after values_input
    selections_holder.click ->
      input_focus = true
      input.focus()
      return
    selections_holder.mousedown ->
      input_focus = false
      return
    # Append selections_holder to DOM.
    selections_holder.after(results_holder)

    interval = null
    timeout = null
    prev = ''
    totalSelections = 0
    # FIXME unused
    tab_press = false
    lastKeyPressCode = null
    num_count = 0

    keyChange = () ->
      ###
      Since most IME does not trigger any key events, if we press [del]
      and type some chinese character, `lastKeyPressCode` will still be [del].
      This might cause problem so we move the line to key events section;
      ignore if the following keys are pressed: [del] [shift] [capslock]
      ###
      #if lastKeyPressCode is 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32) then return results_holder.hide()
      string = input.val().replace /[\\]+|[\/]+/g, ''

      return if string is prev

      prev = string
      if string.length >= options.minChars
        selections_holder.addClass 'loading'
        processRequest string
      else
        selections_holder.removeClass 'loading'
        results_holder.hide()

    processRequest = (string) ->
      if $.isFunction options.beforeRetrieve
        string = options.beforeRetrieve.call @, string
        abortRequest()
        fetcher string, processData

    processData = (data, query) ->
      if !options.matchCase
        query = query.toLowerCase()
      query = query.replace('(', '\(', 'g').replace(')', '\)', 'g')
      matchCound = 0
      results_holder.hide().html(results_ul.html(''))
      num = 0
      for item in data
        num_count++
        forward = false
        if options.searchObjProps is 'value'
          str = item.value
        else
          str = ''
          for name in options.searchObjProps.split ','
            str += "#{item[$.trim(name)]} "
        if str
          unless options.matchCase
            str = str.toLowerCase()
          if str.indexOf(query) isnt -1 && !Selections.exist(item[options.selectedValuesProp])
            forward = true
        if forward
          formatted = $ "<li class=\"as-result-item\" id=\"as-result-item-#{num}\"></li>"
          formatted.click ->
            element = $ @
            raw_data = element.data 'data'
            number = raw_data.num
            if selections_holder.find("#as-selection-#{number}").length <= 0 && !tab_press
              data = raw_data.attributes
              input.val('').focus()
              prev = ''
              add_selected_item data, number
              if $.isFunction(options.resultClick) then options.resultClick.call @, raw_data
              results_holder.hide()
            tab_press = false
            return
          formatted.mousedown ->
            input_focus = false
            return
          formatted.mouseover ->
            element = $ @
            results_ul.find('li').removeClass 'active'
            element.addClass 'active'
            return
          formatted.data 'data',
            attributes : data[num]
            num : num_count
          this_data = $.extend {}, data[num]
          query = query.replace /"/g, '\\"'
          regx =  unless options.matchCase
            new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "gi")
          else
            new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "g")
          ### When this is a string, escape the value and process a regular replacement for highlighting.###
          if typeof this_data[options.selectedItemProp] is 'string'
            this_data[options.selectedItemProp] = escapeHtml(this_data[options.selectedItemProp])
            if options.resultsHighlight && query.length > 0
              this_data[options.selectedItemProp] = this_data[options.selectedItemProp].replace regx, '<em>$1</em>'
          else
            # $ object
            this_data[options.selectedItemProp].html this_data[options.selectedItemProp].html().replace(regx, '<em>$1</em>')
          unless options.formatList
            formatted = formatted.html(this_data[options.selectedItemProp])
          else
            formatted = options.formatList.call @, this_data, formatted
          results_ul.append formatted
          # GC: free memory
          this_data = null
          matchCound++
          if options.retrieveLimit && options.retrieveLimit is matchCound
            break
        num += 1
      selections_holder.removeClass 'loading'
      if matchCound <= 0
        results_ul.html "<li class=\"as-message\">#{options.emptyText}</li>"
      results_ul.css width : selections_holder.outerWidth()
      if matchCound > 0 || !options.showResultListWhenNoMatch
        results_holder.show()
      if $.isFunction(options.resultsComplete) then options.resultsComplete.call @
      return

    moveSelection = (direction) ->
      if results_holder.find(':visible').length
        lis = results_holder.find('li')
        switch direction
          when 'down'
            start = lis.eq(0)
          else
            start = lis.filter(':last')
        active = results_holder.find('li.active:first')
        if active.length
          switch direction
            when 'down'
              start = active.next()
            else
              start = active.prev()
        lis.removeClass 'active'
        start.addClass 'active'

    abortRequest = ->
      return unless request
      request.abort()
      request = null

    input.focus ->
      element = $ @
      if !options.usePlaceholder && element.val() is options.startText && Selections.isEmpty()
        element.val ''
      else if input_focus
        selections_holder.find('li.as-selections-item').removeClass('blur')
        unless element.val() is ''
          results_ul.css width : selections_holder.outerWidth()
          results_holder.show()
      if interval then clearInterval interval
      interval = setInterval (->
        if options.showResultList
          if options.selectionLimit && selections_holder.find('li.as-selection-item').length >= options.selectionLimit
            results_ul.html "<li class=\"as-message\">#{options.limitText}</li>"
            results_holder.show()
          else
            keyChange()
        return
      ), options.keyDelay
      input_focus = true
      if options.minChars is 0
        processRequest element.val()
      return true

    input.blur ->
      element = $ @
      if !options.usePlaceholder && element.val() is '' && Selections.isEmpty() && prefill_value is '' && options.minChars > 0
        element.val options.startText
      else if input_focus
        selections_holder.find('li.as-selection-item').addClass('blur').removeClass('selected')
        results_holder.hide()
      if interval then clearInterval interval
      return
    input.keydown (event) ->
      ### track the last key pressed ###
      lastKeyPressCode = event.keyCode
      first_focus = false
      switch event.keyCode
        when 38 # up key
          event.preventDefault()
          moveSelection 'up'
        when 40 # down key
          event.preventDefault()
          moveSelection 'down'
        when 8 # delete key
          if input.val() is ''
            last = Selections.getAll()
            if last.length
              last = last[last.length - 1]
            else
              last = null
            selections_holder.children().not(org_li.prev()).removeClass 'selected'
            if org_li.prev().hasClass 'selected'
              Selections.remove last
              if $.isFunction(options.selectionRemoved) then options.selectionRemoved.call @, org_li.prev()
            else
              if $.isFunction(options.selectionClick) then options.selectionClick.call @, org_li.prev()
              org_li.prev().addClass 'selected'
          if input.val().length is 1
            results_holder.hide()
            prev = ''
            abortRequest()
          if results_holder.find(':visible').length
            if timeout then clearTimeout timeout
            timeout = setTimeout (->
              keyChange()
              return
            ), options.keyDelay
        when 9, 188 # tab, comma
          if options.canGenerateNewSelections
            tab_press = true
            i_input = input.val().replace /(,)/g, ''
            # remove all comma
            active = results_holder.find('li.active:first')
            ### Generate a new bubble with text when no suggestion selected ###
            if i_input isnt '' && !Selections.exist(i_input) && i_input.length >= options.minChars && active.length is 0
              event.preventDefault()
              n_data = {}
              n_data["#{options.selectedItemProp}"] = i_input
              n_data["#{options.selectedValuesProp}"] = i_input
              add_selected_item n_data, "00#{selections_holder.find('li').length + 1}"
              input.val ''
              ### Cancel previous request when new tag is added ###
              abortRequest()
        when 13 # return
          tab_press = false
          active = results_holder.find('li.active:first')
          if active.length
            active.click()
            results_holder.hide()
          if options.neverSubmit || active.length
            event.preventDefault()
        when 27 # esc
          if options.preventPropagationOnEscape && results_holder.find(':visible').length
            event.stopPropagation()
        when 16, 20 # shift, capslock
          abortRequest()
          results_holder.hide()
      return
