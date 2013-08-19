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
      result = result(this)

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

  @onAjaxRequestDone : (scope, ajaxRequest, options) ->
    if $.isFunction(options.onAjaxRequestDone) then ajaxRequest.done options.onAjaxRequestDone
    return

  @onAjaxRequestFail : (scope, ajaxRequest, options) ->
    if $.isFunction(options.onAjaxRequestFail) then ajaxRequest.fail options.onAjaxRequestFail
    return

  @onAjaxRequestAlways : (scope, ajaxRequest, options) ->
    if $.isFunction(options.onAjaxRequestAlways) then ajaxRequest.always options.onAjaxRequestAlways
    return

  @onRenderErrorMessage : (scope, validationData, element, options) ->
    if $.isFunction options.onRenderErrorMessage
      options.onRenderErrorMessage.call scope, validationData, element, options
    return

  @onRemoveErrorMessage : (scope, validationData, element, options) ->
    if $.isFunction options.onRenderErrorMessage
      options.onRemoveErrorMessage.call scope, validationData, element, options
    return


###*
 * plugin's default options
###
defaults =

  asHtmlID : false

  useOriginalInputName : false

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
   * Defines the minimum number of characters allowed for a tag to be valid.
   * @type number default 1
  ###
  minChars : 1

  ###*
   * Defines the maximum number of characters allowed for a tag to be valid.
   * @type number default 100
  ###
  maxChars : 100

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
   * Defines a callback for rendering a validation error.
   * @type function with arguments: validationData, element
  ###
  onRenderErrorMessage : (validationData, element, options) ->
    error = $("##{validationData.id}")
    unless error.length
      element.closest('ul').after "<span id='#{validationData.id}' class='as-error'></span>"
      error = $("##{validationData.id}")
    error.text validationData.errorMessage
    # Brief timeout to ensure focus even when user presses tab.
    setTimeout (-> element.focus()), 10

  ###*
   * Defines a callback for removing a validation error.
   * @type function with arguments: validationData, element
  ###
  onRemoveErrorMessage : (validationData, element, options) ->
    $("##{validationData.id}").remove()

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
              data = options.afterRequest.apply this, [data]
            callback(data, query)
          ajaxRequest = $.ajax(ajaxRequestConfig).done(onDone)

          # Apply jQuery Deferred Callbacks.
          Events.onAjaxRequestDone this, ajaxRequest, options
          Events.onAjaxRequestFail this, ajaxRequest, options
          Events.onAjaxRequestAlways this, ajaxRequest, options

          return # return nothing

      when 'array', 'object' # handle an object a list of objects
        (query, callback) -> callback(dataSource, query)

    # Abort plugin when no fetcher was specified (in this case, type of option "dataSource" is not supported).
    return unless fetcher

    ###
    For each selected item, we will create an own scope.
    All variables above are "instance" locale!
    ###
    return @each ->

      # prevent null pointer exceptions
      options.inputAttrs = $.extend options.inputAttrs, {}

      # TODO: intention of input_focus?
      input_focus = false
      # TODO: should this be checked if it is really an input?
      input = $(this)

      # TODO: needs definition
      element = null
      elementId = null
      hiddenInputField = null
      hiddenInputFieldId = null
      hiddenInputFieldName = null
      validationErrorId = null

      # Configure local IDs.
      if options.asHtmlID
        element = options.asHtmlID
        elementId = element
        hiddenInputFieldId = "as-values-#{element}"
        validationErrorId = "as-validation-error-#{element}"
        if options.useOriginalInputName
          hiddenInputFieldName = input.attr('name')
          input.attr name: "old_#{input.attr('name')}"
        else
          hiddenInputFieldName = "as_values_#{element}"
      else
        # ensures there will be unique IDs on the page if autoSuggest() is called multiple times
        element = "#{element || ''}#{Math.floor(Math.random() * 100)}"
        elementId = "as-input-#{element}"
        hiddenInputFieldId = "as-values-#{element}"
        validationErrorId = "as-validation-error-#{element}"
        if options.useOriginalInputName
          hiddenInputFieldName = input.attr('name')
          input.attr name: "old_#{input.attr('name')}"
        else
          hiddenInputFieldName = "as_values_#{element}"

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

      # Create the hidden field which contains all selections (see also SelectionHolder).
      hiddenInputField = $("<input type=\"hidden\" class=\"as-values\" name=\"#{hiddenInputFieldName}\" id=\"#{hiddenInputFieldId}\" />")

      currentSelection = new SelectionHolder(hiddenInputField)
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
      clonePublicApi = ->
        add : publicApi.add
        remove : publicApi.remove

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
            element = $(this)
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
        options.start.call this, clonePublicApi()

      switch $.type options.preFill
        when 'string'
          for value in options.preFill.split ','
            item = {}
            item["#{options.selectedValuesProp}"] = value
            if value isnt ''
              addSelection item, "000#{i}"
        when 'array'
          if options.preFill.length
            # Call the afterRequest interceptor if required.
            if $.isFunction options.afterRequest
              options.preFill = options.afterRequest.call this, options.preFill
            for item, i in options.preFill
              new_value = item[options.selectedValuesProp]
              if typeof new_value is 'undefined'
                new_value = ''
              if new_value isnt ''
                addSelection item, "000#{i}"

      unless currentSelection.isEmpty()
        input.val ''
        selectionsContainer.find('li.as-selection-item').addClass('blur').removeClass('selected')
        Utils.setPlaceholderEnabled input, false
      # Append input to DOM.
      input.after hiddenInputField
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
        if lastKeyPressCode is 46 || lastKeyPressCode in [9...31]
          resultsContainer.hide()
          return
        string = input.val().replace /[\\]+|[\/]+/g, ''

        return if string isnt '' && string is prev

        prev = string

        if validations.allValid(string.length) || (options.minChars is 0 && string.length is 0)
          selectionsContainer.addClass 'loading'
          processRequest string
        else
          selectionsContainer.removeClass 'loading'
          resultsContainer.hide()

      processRequest = (string) ->
        # Call hook "before-request"
        if $.isFunction options.beforeRequest
          string = options.beforeRequest.apply this, [string, options]
        abortRequest()
        fetcher string, processData

      processData = (data, query) ->
        creation_hint = false
        original_query = query
        if !options.matchCase
          query = query.toLowerCase()
        query = query.replace('(', '\(', 'g').replace(')', '\)', 'g')
        matchCount = 0
        resultsContainer.hide().html(resultsList.html(''))
        num = 0
        if options.canGenerateNewSelections and
           options.creationText and
           $.grep(data, (item) -> item[options.selectedItemProp].toLowerCase() is query ).length is 0 and
           not currentSelection.exist(query)
          formatted = $("<li class=\"as-result-item\" id=\"as-result-item-#{num}\"></li>")
          formatted.on
            click : ->
              n_data = {}
              n_data["#{options.selectedItemProp}"] = original_query
              n_data["#{options.selectedValuesProp}"] = original_query
              input.val('').focus()
              prev = ''
              addSelection n_data, "00#{selectionsContainer.find('li').length + 1}"
              resultsContainer.hide()
              return
            mousedown : ->
              input_focus = false
              return
            mouseover : ->
              element = $(this)
              resultsList.find('li').removeClass 'active'
              element.addClass 'active'
              return
          formatted.data 'data',
            attributes : data[num]
            num : num_count
          formatted = formatted.html '<em>' + original_query + '</em>' + options.creationText
          resultsList.append formatted
          creation_hint = true
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
            formatted = $("<li class=\"as-result-item\" id=\"as-result-item-#{num}\"></li>")
            formatted.on
              click : ->
                element = $(this)
                raw_data = element.data 'data'
                number = raw_data.num
                if selectionsContainer.find("#as-selection-#{number}").length <= 0 && !lastKeyWasTab
                  data = raw_data.attributes
                  input.val('').focus()
                  prev = ''
                  addSelection data, number
                  if $.isFunction(options.onResultItemClick) then options.onResultItemClick.call this, raw_data
                  resultsContainer.hide()
                lastKeyWasTab = false
                return
              mousedown : ->
                input_focus = false
                return
              mouseover : ->
                element = $(this)
                resultsList.find('li').removeClass 'active'
                element.addClass 'active'
                return
            formatted.data 'data',
              attributes : data[num]
              num : num_count
            # copy the data object to work with it
            workingData = $.extend {}, data[num]
            query = query.replace /"/g, '\\"'
            regex =  unless options.matchCase
              new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + Utils.escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "gi")
            else
              new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + Utils.escapeHtml(query) + ")(?![^<>]*>)(?![^&;]+;)", "g")
            ### When this is a string, escape the value and process a regular replacement for highlighting.###
            if typeof workingData[options.selectedItemProp] is 'string'
              workingData[options.selectedItemProp] = Utils.escapeHtml(workingData[options.selectedItemProp])
              if options.resultsHighlight && query.length > 0
                workingData[options.selectedItemProp] = workingData[options.selectedItemProp].replace(regex, '<em>$1</em>')
            else
              # $ object
              if options.resultsHighlight && query.length > 0
                workingData[options.selectedItemProp].html workingData[options.selectedItemProp].html().replace(regex, '<em>$1</em>')
            unless options.formatList
              formatted = formatted.html workingData[options.selectedItemProp]
            else
              formatted = options.formatList.call this, workingData, formatted
            resultsList.append formatted
            matchCount++
            if options.retrieveLimit && options.retrieveLimit is matchCount
              break
          num += 1
        selectionsContainer.removeClass 'loading'
        if matchCount <= 0 && !creation_hint
          text = options.emptyText
          if $.type(options.emptyTextPlaceholder) is 'regexp'
            text = text.replace options.emptyTextPlaceholder, query
          resultsList.html "<li class=\"as-message\">#{text}</li>"
        resultsList.css width : selectionsContainer.outerWidth()
        resultsContainerVisible = matchCount > 0 || options.showResultListWhenNoMatch || options.creationText
        if resultsContainerVisible
          resultsContainer.show()
        if $.isFunction(options.afterResultListShow) then options.afterResultListShow.call this, resultsContainerVisible
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

      validations =
        clear: ->
          data = { id: validationErrorId }
          Events.onRemoveErrorMessage input, data, input, options
        allValid: (charLength) ->
          charLength >= options.minChars && charLength <= options.maxChars
        renderMinChars: ->
          data =
            id: validationErrorId
            errorMessage: "must be at least #{options.minChars} characters"
            type: 'minChars'
            limit: options.minChars
          Events.onRenderErrorMessage input, data, input, options
        renderMaxChars: ->
          data =
            id: validationErrorId
            errorMessage: "must be #{options.maxChars} characters or fewer"
            type: 'maxChars'
            limit: options.maxChars
          Events.onRenderErrorMessage input, data, input, options

      input.on
        focus : -> # On input focus
          element = $(this)
          if !options.usePlaceholder && element.val() is options.startText && currentSelection.isEmpty()
            element.val ''
          else if input_focus
            selectionsContainer.find('li.as-selections-item').removeClass('blur')
            unless element.val() is ''
              resultsList.css width : selectionsContainer.outerWidth()
              resultsContainer.show() if validations.allValid()
          if interval then clearInterval interval
          interval = setInterval (->
            if options.showResultList
              if options.selectionLimit && selectionsContainer.find('li.as-selection-item').length >= options.selectionLimit
                resultsList.html "<li class=\"as-message\">#{options.limitText}</li>"
                resultsContainer.show() if validations.allValid()
              else
                keyChange()
            return
          ), options.keyDelay
          input_focus = true
          if options.minChars is 0
            processRequest element.val()
          return true

        blur : -> # On input blur
          element = $(this)
          if !options.usePlaceholder && element.val() is '' && currentSelection.isEmpty() && options.minChars > 0
            element.val options.startText
          else if input_focus
            selectionsContainer.find('li.as-selection-item').addClass('blur').removeClass('selected')
            resultsContainer.hide()
          if interval then clearInterval interval
          Utils.setPlaceholderEnabled element, currentSelection.isEmpty()
          return

        keyup: () ->
          charLength = (input.val().replace /(,)/g, '').length
          if charLength > options.maxChars
            validations.renderMaxChars()
          if validations.allValid(charLength) || charLength == 0
            validations.clear()

        keydown : (event) -> # On input keydown
          ### track the last key pressed ###
          lastKeyPressCode = event.keyCode
          first_focus = false
          # remove all comma
          i_input = input.val().replace /(,)/g, ''

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
                validations.clear()
              if resultsContainer.find(':visible').length
                if timeout then clearTimeout timeout
                timeout = setTimeout (->
                  keyChange()
                  return
                ), options.keyDelay
            when 9, 13, 188 # tab, return, comma
              lastKeyWasTab = event.keyCode is 9
              active = resultsContainer.find('li.active:visible:first')
              if event.keyCode is 13 and resultsContainer.find('li.active:first').length
                active.click()
                resultsContainer.hide()
                event.preventDefault() if options.neverSubmit
                active = resultsContainer.find('li.active:first')
              else if options.canGenerateNewSelections
                ### Generate a new bubble with text when no suggestion selected ###
                if i_input.length > options.maxChars
                  validations.renderMaxChars()
                else if i_input.length != 0 && i_input.length < options.minChars
                  validations.renderMinChars()
                else if i_input isnt '' and not currentSelection.exist(i_input) and active.length is 0
                  event.preventDefault()
                  n_data = {}
                  n_data["#{options.selectedItemProp}"] = i_input
                  n_data["#{options.selectedValuesProp}"] = i_input
                  addSelection n_data, "00#{selectionsContainer.find('li').length + 1}"
                  input.val ''
                  validations.clear()
                  ### Cancel previous ajaxRequest when new tag is added ###
                  abortRequest()
              else
                input.val('')
              if active.length
                lastKeyWasTab = false
                active.click()
                resultsContainer.hide()
                event.preventDefault() if options.neverSubmit
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
    element = $(this)
    for item in items
      element.trigger 'addSelection', item
    return

  # plugin method to remove an item
  remove : (values...) ->
    element = $(this)
    for value in values
      element.trigger 'removeSelection', value
    return

  # plugin method to reset the defaults (optionally reset)
  defaults : (options, replace = false) ->
    defaults = {} if replace
    $.extend defaults, options
    return

# Define the actual jQuery plugin constructor.
$.fn.autoSuggest = (method) ->
  if pluginMethods[method]
    pluginMethods[method].apply this, (Array.prototype.slice.call arguments, 1)
  else
    pluginMethods.init.apply this, arguments