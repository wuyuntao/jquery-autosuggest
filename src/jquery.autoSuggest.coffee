###
jQuery AutoSuggest 2

This is a rewritten version of Drew Wilsons "AutoSuggest" plugin from 2009/2010.
www.drewwilson.com / code.drewwilson.com/entry/autosuggest-jquery-plugin

Originally forked by Wu Yuntao (on GitHub)
http://github.com/wuyuntao/jquery-autosuggest
Based on the 1.6er release dated in July, 2012
###


# In our scope, override any existing $ with the original jQuery object.
$ = jQuery


### A collection of utility functions. ###
class Utils

  _ : undefined # intellij formatting workaround

  # Returns a string where the quotes are escaped correctly when used in inline HTML attributes.
  @escapeQuotes : (text) -> if text then text.replace /"/g, '\\"'

  # Returns a string where the html special chars are escaped correctly.
  @escapeHtml : (text) -> $('<span/>').text(text).html()
  
  # Move inputs' placeholder attribute to disabled-placeholder and vice versa
  @setPlaceholderEnabled : (input, enable) ->
    targets = ['placeholder', 'disabled-placeholder']
    if enable
      from = targets[1]
      to = targets[0]
    else
      from = targets[0]
      to = targets[1]
    
    return if input.attr(to) or not input.attr(from)
      
    input.attr to, -> input.attr from
    input.removeAttr(from)
    return
  


### A collection of configuration resolvers. ###
class ConfigResolver

  _ : undefined
  # intellij formatting workaround

  ###
  Resolving the extra params as an object.
  The input of options.extraParams can be a string, a function or an object.
  ###
  @getExtraParams = (options) ->
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


### The SelectionControl maintains and manage any selections.###
class SelectionHolder

  _ : undefined # intellij formatting workaround

  hiddenField : null
  items : null

  constructor : (@hiddenField, @items = []) ->

  syncToHiddenField : ->
    return unless @hiddenField
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


class Events

  @onSelectionAdd : (scope, containerElement, detachedElement, options, item, selections) ->
    element = options.onSelectionAdd.call scope, containerElement, detachedElement, options
    Utils.setPlaceholderEnabled scope, (selections.length is 0)
    if $.isFunction options.afterSelectionAdd
      options.afterSelectionAdd.call scope, element, item, selections
    return

  @onSelectionRemove : (scope, element, options, item, selections) ->
    if $.isFunction options.onSelectionRemove
      options.onSelectionRemove.call scope, element, options
    Utils.setPlaceholderEnabled scope, (selections.length is 0)
    if $.isFunction options.afterSelectionRemove
      options.afterSelectionRemove.call scope, element, item, selections
    return

  @onSelectionClick : (scope, element, options, item, selections) ->
    if $.isFunction options.afterSelectionClick
      options.afterSelectionClick.call scope, element, item, selections
    Utils.setPlaceholderEnabled scope, (selections.length is 0)
    return


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
   * RegEx to replace values in emptyText values with query text
   * @type regex
  ###
  emptyTextPlaceholder : /\{\d+\}/

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
   * Defines wether the result list should be filtered or not.
   * @type string default 'value'
  ###
  searchActive : true

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
   * number for 'limit' param on ajaxRequest
   * @type number
  ###
  retrieveLimit : null

  ###*
   * Defines additional extraParams which will be appended to the ajaxRequest.
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
  afterSelectionClick : null

  ###*
   * Defines a trigger after adding a selection element.
   * @type function with arguments: elementBefore, id
  ###
  afterSelectionAdd : null

  ###*
   * Defines a callback notifying when a element was removed.
   * @type function with arguments: element
  ###
  afterSelectionRemove : null

  ###*
   * Defines a callback for adding a selection item.
   * @type function with arguments: containerElement, detachedElement
  ###
  onSelectionAdd : (containerElement, detachedElement, options) ->
    containerElement.before detachedElement
    return containerElement.prev()

  ###*
   * Defines a callback for removing a selection item.
   * @type function with arguments: element
  ###
  onSelectionRemove : (element, options) ->
    if options.fadeOut
      element.fadeOut options.fadeOut, -> element.remove()
    else
      element.remove()

  ###*
   * Defines a callback called for every item that will be rendered.
   * @type function with arguments: element
  ###
  formatList : null

  ###*
   * Defines a callback function intercepting the url
   * @return String should return the ajaxRequest url
  ###
  beforeRequest : null

  ###*
   * Defines a callback function intercepting the result data.
  ###
  afterRequest : null

  ###*
   * Defines a deferred callback function for the internal ajax request (on success).
  ###
  onAjaxRequestDone : null

  ###*
   * Defines a deferred callback function for the internal ajax request (on error).
  ###
  onAjaxRequestFail : null

  ###*
   * Defines a deferred callback function for the internal ajax request (on complete).
  ###
  onAjaxRequestAlways : null

  ###*
   * Defines a trigger after clicking on a search result element.
   * @type function with arguments: data
  ###
  onResultItemClick : null

  ###*
   * Defines a trigger called after processData.
   * @type function
  ###
  afterResultListShow : null

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
   * Defines the base options used for the ajaxRequest.
  ###
  ajaxOptions :
    type : 'get'
    dataType : 'json'

  ###*
   * specifies a list of attributes which will be applied to each input on startup
  ###
  inputAttrs :
    autocomplete : 'off'

  ###*
   * Defines whether the removing of a selection should be animated (using fadeOut)
  ###
  fadeOut : false

  ###*
   * Defines whether the server filter remote or not. If asuming so, this prevents the plugin to filter again.
  ###
  remoteFilter : false


pluginMethods =

  init : (dataSource, options) ->
    # Creates a new options object and appending the default and the actual user options.
    options = $.extend {}, defaults, options

    # global reference to the plugin's ajax request object
    ajaxRequest = null

    # PRIVATE API: Indicates whether a server is responsible for a result list or not.
    if options.remoteFilter is 'auto'
      options.remoteFilter = ($.type dataSource) is 'string'

    # defines the actual fetcher strategy based on the option "dataSource"
    fetcher = switch $.type dataSource
      when 'function' # handle a callback function
        dataSource

      when 'string' # handle an url string
        (query, callback) ->
          # CHECKED: The fetcher will be invoked with two arguments. No null check is required.
          params = {}
          ### ensures query is encoded ###
          params["#{options.queryParam}"] = encodeURIComponent(decodeURIComponent(query))

          if options.retrieveLimit
            params[options.limitParam] = encodeURIComponent options.retrieveLimit

          extraParams = ConfigResolver.getExtraParams options
          if $.type(extraParams) is 'object'
            $.extend params, extraParams

          ajaxRequestConfig = $.extend {}, options.ajaxOptions,
            url : dataSource
            data : params

          onDone = (data) ->
            if $.isFunction options.afterRequest
              data = options.afterRequest.apply @, [data]
            callback(data, query)
          ajaxRequest = $.ajax(ajaxRequestConfig).done(onDone)

          # Apply jQuery Deferred Callbacks.
          if options.onAjaxRequestDone then ajaxRequest.done options.onAjaxRequestDone
          if options.onAjaxRequestFail then ajaxRequest.fail options.onAjaxRequestFail
          if options.onAjaxRequestAlways then ajaxRequest.always options.onAjaxRequestAlways

          return # return nothing

      when 'array', 'object' # handle an object a list of objects
        (query, callback) -> callback(dataSource, query)

    # Abort plugin when no fetcher was specified (in this case, type of option "dataSource" is not supported).
    return unless fetcher

    ###
    For each selected item, we will create an own scope.
    All variables above are "instance" locale!
    ###
    return @each (element) ->

      # prevent null pointer exceptions
      options.inputAttrs = $.extend options.inputAttrs, {}

      # TODO: intention of input_focus?
      input_focus = false
      # TODO: should this be checked if it is really an input?
      input = $(@)

      # TODO: needs definition
      element = null
      elementId = null

      # Configure local IDs.
      unless options.asHtmlID
        # ensures there will be unique IDs on the page if autoSuggest() is called multiple times
        element = "#{element || ''}#{Math.floor(Math.random() * 100)}"
        elementId = "as-input-#{element}"
      else
        element = options.asHtmlID
        elementId = element

      # override always the id
      options.inputAttrs.id = elementId

      # override placeholder if this is required
      unless options.usePlaceholder
        options.inputAttrs.placeholder = options.startText

      input.attr options.inputAttrs
      input.addClass 'as-input'
      unless options.usePlaceholder
        input.val options.startText

      # Setup basic elements and render them to the DOM
      input.wrap("<ul class=\"as-selections\" id=\"as-selections-#{element}\"></ul>").wrap("<li class=\"as-original\" id=\"as-original-#{element}\"></li>")
      selectionsContainer = $("#as-selections-#{element}")
      inputWrapper = $("#as-original-#{element}")
      resultsContainer = $("<div class=\"as-results\" id=\"as-results-#{element}\"></div>")
      resultsList =  $("<ul class=\"as-list\"></ul>")
      hiddenInput = $("<input type=\"hidden\" class=\"as-values\" name=\"as_values_#{element}\" id=\"as-values-#{element}\" />")

      currentSelection = new SelectionHolder(hiddenInput)
      prefilledValue = ''
      interval = null
      timeout = null
      prev = ''
      lastKeyWasTab = false
      lastKeyPressCode = null
      num_count = 0
      
      ###
        This api will be exposed to the "start" callback.
      ###
      publicApi =
        add : (data) ->
          counted = $(selectionsContainer).find('li').length
          item = addSelection data, "u#{counted}"
          item?.addClass 'blur'
          return
        remove : (value) ->
          currentSelection.remove value
          selectionsContainer.find("li[data-value=\"#{Utils.escapeHtml(value)}\"]").remove()
          return

      # Register an add event.
      input.bind 'addSelection', (event, data) ->
        publicApi.add data
      input.bind 'removeSelection', (event, value) ->
        publicApi.remove value

      ###*
       * Adds the specified selection.
       * @param Object data
       * @param Number num
      ###
      addSelection = (data, num) ->
        currentSelection.add data[options.selectedValuesProp]
        item = $ "<li class=\"as-selection-item\" id=\"as-selection-#{num}\" data-value=\"#{Utils.escapeQuotes(Utils.escapeHtml(data[options.selectedValuesProp]))}\"></li>"
        item.on
          'click' : ->
            element = $(@)
            Events.onSelectionClick input, element, options, data[options.selectedValuesProp], currentSelection.getAll()
            selectionsContainer.children().removeClass 'selected'
            element.addClass 'selected'
            return
          'mousedown' : ->
            input_focus = false
            return
        closeElement = $ "<a class=\"as-close\">&times;</a>"
        closeElement.click ->
          currentSelection.remove data[options.selectedValuesProp]
          Events.onSelectionRemove input, item, options, null, currentSelection.getAll()
          input_focus = true
          input.focus()
          return false
        if typeof data[options.selectedItemProp] isnt 'string'
          Events.onSelectionAdd input, inputWrapper, item.append(data[options.selectedItemProp]).prepend(closeElement), options, data, currentSelection.getAll()
        else
          Events.onSelectionAdd input, inputWrapper, item.text(data[options.selectedItemProp]).prepend(closeElement), options, data, currentSelection.getAll()

        return inputWrapper.prev()

      ###
        DO START
      ###
      if $.isFunction options.start
        options.start.call @, publicApi

      switch $.type options.preFill
        when 'string'
          for value in options.preFill.split ','
            item = {}
            item["#{options.selectedValuesProp}"] = value
            if value isnt ''
              addSelection item, "000#{i}"
          prefilledValue = options.preFill
        when 'array'
          prefilledValue = ''
          if options.preFill.length
            # Call the afterRequest interceptor if required.
            if $.isFunction options.afterRequest
              options.preFill = options.afterRequest.call @, options.preFill
            for item, i in options.preFill
              new_value = item[options.selectedValuesProp]
              if typeof new_value is 'undefined'
                new_value = ''
              prefilledValue += new_value + ','
              if new_value isnt ''
                addSelection item, "000#{i}"

      if prefilledValue isnt ''
        input.val ''
        selectionsContainer.find('li.as-selection-item').addClass('blur').removeClass('selected')
        Utils.setPlaceholderEnabled input, false
      # Append input to DOM.
      input.after hiddenInput
      selectionsContainer.on
        'click' : ->
          input_focus = true
          input.focus()
          return
        'mousedown' : ->
          selectionsContainer.children().removeClass 'selected'
          input_focus = false
          return
      # Append selectionsContainer to DOM.
      selectionsContainer.after(resultsContainer)

      keyChange = () ->
        ###
        Since most IME does not trigger any key events, if we press [del]
        and type some chinese character, `lastKeyPressCode` will still be [del].
        This might cause problem so we move the line to key events section;
        ignore if the following keys are pressed: [del] [shift] [capslock]
        ###
        if lastKeyPressCode is 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32)
          resultsContainer.hide()
          return
        string = input.val().replace /[\\]+|[\/]+/g, ''

        return if string isnt '' && string is prev

        prev = string
        if (string.length >= options.minChars) || (options.minChars is 0 && string.length is 0)
          selectionsContainer.addClass 'loading'
          processRequest string
        else
          selectionsContainer.removeClass 'loading'
          resultsContainer.hide()

      processRequest = (string) ->
        # Call hook "before-request"
        if $.isFunction options.beforeRequest
          string = options.beforeRequest.apply @, [string, options]
        abortRequest()
        fetcher string, processData

      processData = (data, query) ->
        if !options.matchCase
          query = query.toLowerCase()
        query = query.replace('(', '\(', 'g').replace(')', '\)', 'g')
        matchCount = 0
        resultsContainer.hide().html(resultsList.html(''))
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
            if !options.searchActive || ((str.indexOf(query) isnt -1 || options.remoteFilter) && !currentSelection.exist(item[options.selectedValuesProp]))
              forward = true
          if forward
            formatted = $ "<li class=\"as-result-item\" id=\"as-result-item-#{num}\"></li>"
            formatted.click ->
              element = $(@)
              raw_data = element.data 'data'
              number = raw_data.num
              if selectionsContainer.find("#as-selection-#{number}").length <= 0 && !lastKeyWasTab
                data = raw_data.attributes
                input.val('').focus()
                prev = ''
                addSelection data, number
                if $.isFunction(options.onResultItemClick) then options.onResultItemClick.call @, raw_data
                resultsContainer.hide()
              lastKeyWasTab = false
              return
            formatted.mousedown ->
              input_focus = false
              return
            formatted.mouseover ->
              element = $(@)
              resultsList.find('li').removeClass 'active'
              element.addClass 'active'
              return
            formatted.data 'data',
              attributes : data[num]
              num : num_count
            this_data = $.extend {}, data[num]
            query = query.replace /"/g, '\\"'
            regx =  unless options.matchCase
              new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + Utils.escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "gi")
            else
              new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + Utils.escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "g")
            ### When this is a string, escape the value and process a regular replacement for highlighting.###
            if typeof this_data[options.selectedItemProp] is 'string'
              this_data[options.selectedItemProp] = Utils.escapeHtml(this_data[options.selectedItemProp])
              if options.resultsHighlight && query.length > 0
                this_data[options.selectedItemProp] = this_data[options.selectedItemProp].replace regx, '<em>$1</em>'
            else
              # $ object
              this_data[options.selectedItemProp].html this_data[options.selectedItemProp].html().replace(regx, '<em>$1</em>')
            unless options.formatList
              formatted = formatted.html(this_data[options.selectedItemProp])
            else
              formatted = options.formatList.call @, this_data, formatted
            resultsList.append formatted
            # GC: free memory
            this_data = null
            matchCount++
            if options.retrieveLimit && options.retrieveLimit is matchCount
              break
          num += 1
        selectionsContainer.removeClass 'loading'
        if matchCount <= 0
          text = options.emptyText
          if $.type(options.emptyTextPlaceholder) is 'regexp'
            text = text.replace options.emptyTextPlaceholder, query
          resultsList.html "<li class=\"as-message\">#{text}</li>"
        resultsList.css width : selectionsContainer.outerWidth()
        resultsContainerVisible = matchCount > 0 || options.showResultListWhenNoMatch
        if resultsContainerVisible
          resultsContainer.show()
        if $.isFunction(options.afterResultListShow) then options.afterResultListShow.call @, resultsContainerVisible
        return

      moveResultSelection = (direction) ->
        if resultsContainer.find(':visible').length
          lis = resultsContainer.find('li')
          switch direction
            when 'down'
              start = lis.eq(0)
            else
              start = lis.filter(':last')
          active = resultsContainer.find('li.active:first')
          if active.length
            switch direction
              when 'down'
                start = active.next()
              else
                start = active.prev()
          lis.removeClass 'active'
          start.addClass 'active'
        return

      abortRequest = ->
        return unless ajaxRequest
        ajaxRequest.abort()
        ajaxRequest = null
        return

      input.on
        focus : -> # On input focus
          element = $(@)
          if !options.usePlaceholder && element.val() is options.startText && currentSelection.isEmpty()
            element.val ''
          else if input_focus
            selectionsContainer.find('li.as-selections-item').removeClass('blur')
            unless element.val() is ''
              resultsList.css width : selectionsContainer.outerWidth()
              resultsContainer.show()
          if interval then clearInterval interval
          interval = setInterval (->
            if options.showResultList
              if options.selectionLimit && selectionsContainer.find('li.as-selection-item').length >= options.selectionLimit
                resultsList.html "<li class=\"as-message\">#{options.limitText}</li>"
                resultsContainer.show()
              else
                keyChange()
            return
          ), options.keyDelay
          input_focus = true
          if options.minChars is 0
            processRequest element.val()
          return true

        blur : -> # On input blur
          element = $(@)
          if !options.usePlaceholder && element.val() is '' && currentSelection.isEmpty() && prefilledValue is '' && options.minChars > 0
            element.val options.startText
          else if input_focus
            selectionsContainer.find('li.as-selection-item').addClass('blur').removeClass('selected')
            resultsContainer.hide()
          if interval then clearInterval interval
          Utils.setPlaceholderEnabled element, currentSelection.isEmpty()
          return
          
        keydown : (event) -> # On input keydown
          ### track the last key pressed ###
          lastKeyPressCode = event.keyCode
          first_focus = false
          switch event.keyCode
            when 38 # up key
              event.preventDefault()
              moveResultSelection 'up'
            when 40 # down key
              event.preventDefault()
              if $(":visible", resultsContainer).length > 0
                moveResultSelection 'down'
              else
                if timeout then clearTimeout timeout
                timeout = setTimeout (->
                  keyChange()
                  return
                ), options.keyDelay
            when 8 # delete key
              if input.val() is ''
                _selections = currentSelection.getAll()
                _selection = null
                if _selections.length
                  _selection = _selections[_selections.length - 1]
                else
                  _selection = null
                selectionsContainer.children().not(inputWrapper.prev()).removeClass 'selected'
                if inputWrapper.prev().hasClass 'selected'
                  currentSelection.remove _selection
                  Events.onSelectionRemove input, inputWrapper.prev(), options, null, currentSelection.getAll()
                else
                  Events.onSelectionClick input, inputWrapper.prev(), options, null, currentSelection.getAll()
                  inputWrapper.prev().addClass 'selected'
              if input.val().length is 1
                resultsContainer.hide()
                prev = ''
                abortRequest()
              if resultsContainer.find(':visible').length
                if timeout then clearTimeout timeout
                timeout = setTimeout (->
                  keyChange()
                  return
                ), options.keyDelay
            when 9, 188 # tab, comma
              active = resultsContainer.find('li.active:first')
              if options.canGenerateNewSelections
                lastKeyWasTab = true
                # remove all comma
                i_input = input.val().replace /(,)/g, ''
                ### Generate a new bubble with text when no suggestion selected ###
                if i_input isnt '' && !currentSelection.exist(i_input) && i_input.length >= options.minChars && active.length is 0
                  event.preventDefault()
                  n_data = {}
                  n_data["#{options.selectedItemProp}"] = i_input
                  n_data["#{options.selectedValuesProp}"] = i_input
                  addSelection n_data, "00#{selectionsContainer.find('li').length + 1}"
                  input.val ''
                  ### Cancel previous ajaxRequest when new tag is added ###
                  abortRequest()
              if active.length
                lastKeyWasTab = false
                active.click()
                resultsContainer.hide()
                event.preventDefault()
            when 13 # return
              lastKeyWasTab = false
              active = resultsContainer.find('li.active:first')
              if active.length
                active.click()
                resultsContainer.hide()
              if options.neverSubmit || active.length
                event.preventDefault()
            when 27 # esc
              if options.preventPropagationOnEscape && resultsContainer.find(':visible').length
                event.stopPropagation()
            when 16, 20 # shift, capslock
              abortRequest()
              resultsContainer.hide()
          
          Utils.setPlaceholderEnabled input, currentSelection.isEmpty()
          return

  # plugin method to add an item
  add : (items...) ->
    element = $(@)
    for item in items
      element.trigger 'addSelection', item
    return

  # plugin method to remove an item
  remove : (values...) ->
    element = $(@)
    for value in values
      element.trigger 'removeSelection', value
    return


# Define the actual jQuery plugin constructor.
$.fn.autoSuggest = (method) ->
  if pluginMethods[method]
    pluginMethods[method].apply @, (Array.prototype.slice.call arguments, 1)
  else
    pluginMethods.init.apply @, arguments