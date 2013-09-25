unless d3?
  throw new Error 'veasy require d3.\nwrite <script src="//d3js.org/d3.v3.min.js" charset="utf-8"></script>"'

unless $ or jQuery
  throw new Error 'veasy require jquery.\nwrite <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" charset="utf-8"></script>"'

class Veasy
  constructor: (@$target, @opt = {})->
    @id = "#{Date.now()}-#{$('svg').length}"
    @$target = $(@$target) unless $target instanceof jQuery
    @$target.attr('height', @opt.height)

    @margin = @parseMargin(@opt.margin or 50)
    @width  = (@opt.width or @$target.width() or 400) - @margin.width
    @height = (@opt.height or 300) - @margin.height

    @_x         = null
    @_y         = null
    @_symbol    = null
    @_size      = null
    @_value     = null
    @_color     = null
    @_dir       = null
    @_texture   = null

    @_legend    = null

    @xDefault = @opt.xDefault
    @yDefault = @opt.yDefault

    @svg = d3.select(@$target.get(0)).select('svg')
    if not @svg[0][0]?
      @svg = d3.select(@$target.get(0)).append('svg').attr('id', @id)
        .attr('width', @width + @margin.width)
        .attr('height', @height + @margin.height)
        .append('g')
        .attr('width', @width)
        .attr('height', @height)
        .attr('transform', "translate(#{@margin.left}, #{@margin.top})")

  parseMargin: (margin)->
    margins = null
    if typeof margin is 'number'
      margins = top: margin, right: margin, bottom: margin, left: margin
    else if margin instanceof Array
      if margin.length is 1
        margins = top: margin[0], right: margin[0], bottom: margin[0], left: margin[0]
      else if margin.length is 2
        margins = top: margin[0], right: margin[1], bottom: margin[0], left: margin[1]
      else if margin.length is 3
        margins = top: margin[0], right: margin[1], bottom: margin[2], left: margin[1]
      else
        margins = top: margin[0], right: margin[1], bottom: margin[3], left: margin[3]
    else if typeof margin is 'object'
      if typeof margin.top is 'number' and typeof margin.right is 'number' and typeof margin.bottom is 'number' and typeof margin.left is 'number'
        margins = margin

    if not margins?
      throw new Error("margin require number or [number]")

    margins.width = margins.left + margins.right
    margins.height = margins.top + margins.bottom

    margins

  #
  # ### accessors
  #
  x: (x)->
    if not x?
      return @_x
    @_x = x
    this
  y: (y)->
    if not y?
      return @_y
    if y instanceof Array
      @_y = y[0]
      @_ys = y
    else
      @_y = y
    this
  t: (t)->
    if not t?
      return @_t
    @_t = t
    this
  color: (color)->
    if not color?
      return @_color
    if typeof color is 'function'
      @_color = color
    else
      @_color = ()-> color
    this
  size: (size)->
    if not size?
      return @_size
    if typeof size is 'function'
      @_size = size
    else
      @_size = ()-> size
    this
  symbol: (symbol)->
    if not symbol?
      return @_symbol
    if typeof symbol is 'function'
      @_symbol = symbol
    else
      @_symbol = ()-> symbol
    this

  #
  # ### legend
  #
  legend: (position)->
    @_legend =
      position: position
    this

  appendLegend: (series, color)->
    return unless series? and series.length > 0
    return unless @_legend?

    category10 = d3.scale.category10()
    unless color?
      if @_color
        color = (serie, sid)=>
          try
            @_color(null, null, sid)
          catch err
            'grey'
      else
        color = (serie, sid)->
          serie.opt?.color or category10(sid)

    legend = @svg.append('g').attr('class', 'legend')
    rect = legend.append('rect').attr('fill', 'white').attr('stroke', 'grey').style('opacity', 0.9)
    list = legend.selectAll('text').data(series).enter()
      .append('text').text((d, sid)=>
        if @_symbol?
          "#{@_symbol(null, null, sid)} #{d.name}"
        else
          d.name
      ).attr('stroke', color)

    $list = @$target.find('svg g g.legend text')
    twidth = d3.max $list, (d)-> d.getBBox().width
    theight = d3.max $list, (d)-> d.getBBox().height
    padding = theight * 0.2

    if @_legend.position?.match 'v'
      list
        .attr('dy', (d, idx)-> theight + idx * (theight + padding))
        .attr('dx', padding * 2)
      width = twidth + padding * 4
      height = (theight + padding) * $list.length + padding * 2
    else if rows = @_legend.position?.match /(\d+)x/
      rows = rows[1]
      list
        .attr('dy', (d, idx)-> theight + (theight + padding) * (0|idx / rows))
        .attr('dx', (d, idx)-> padding * 2 + (twidth + padding) * (idx % rows))
      width = (twidth + padding) * rows + padding * 4
      height = (theight + padding) * (0|$list.length / rows + 0.9) + padding * 2
    else if cols = @_legend.position?.match /x(\d+)/
      cols = cols[1]
      list
        .attr('dy', (d, idx)-> theight + (theight + padding) * (idx % cols))
        .attr('dx', (d, idx)-> padding * 2 + (twidth + padding) * (0|idx / cols))
      width = (twidth + padding) * (0|$list.length / cols + 0.9) + padding * 4
      height = (theight + padding) * cols + padding * 2
    else
      list
        .attr('dy', theight)
        .attr('dx', (d, idx)-> idx * (twidth + padding) + padding * 2)
      width = (twidth + padding) * $list.length + padding * 4
      height = theight + padding * 2

    rect.attr('width', width).attr('height', height)

    left = (@width - width) / 2
    top  = (@height - height) / 2

    if @_legend.position?.match 'n'
      top = 20
    if @_legend.position?.match 'w'
      left = 20
    if @_legend.position?.match 's'
      top = @height - height - 20
    if @_legend.position?.match 'e'
      left = @width - width - 20

    legend.attr('transform', "translate(#{left}, #{top})")
    legend.on 'mouseover', (d)->
      d3.select(this).style('opacity', 0.3)
    legend.on 'mouseout', (d)->
      d3.select(this).style('opacity', 0.9)

  #
  # ### getMergedSeries
  #
  # get merged all series data to range
  #
  getMergedSeries: (series)->
    merged = []
    for serie in series
      merged = merged.concat serie.data
    merged

  #
  # ### isValidPositionAccessor
  #
  isValidPositionAccessor: (data)->
    return @errorHandler new Error "accessor x required" unless @_x
    return @errorHandler new Error "accessor y required" unless @_y

    if typeof @_x(data) is 'undefined'
      return @errorHandler new AccessorError @_x, @_y, data
    if typeof @_y(data) is 'undefined'
      return @errorHandler new AccessorError @_x, @_y, data

  #
  # ### inhibit
  #
  inhibitOther: (selector, opacity = 0.6)->
    svg = @svg
    (d)->
      svg.selectAll(selector).style('opacity', opacity)
      d3.select(this)
        .style('opacity', 1.0)

  clearInhibit: (selector)->
    svg = @svg
    (d)->
      svg.selectAll(selector).style('opacity', 1.0)

  #
  # ### errorHandler
  #
  errorHandler: (err)->
    @svg.append('text')
      .attr('x', @width / 2)
      .attr('y', @height / 2)
      .text(@opt.failMessage or "oops! draw chart fail...")
    throw err

  #############################################################
  #
  # ### draw line chart
  #
  drawLine: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    if err = @isValidPositionAccessor mergedSeries[0]
      return err
    opt = new Option @opt, opt

    allXrange = d3.extent mergedSeries, @_x
    allYrange = d3.extent mergedSeries, @_y

    xType = @_x(mergedSeries[0]).constructor
    yType = Number

    xScale = opt.xscale or "linear"
    yScale = opt.yscale or "linear"

    @xScale = x =
      if xType.name is 'Date' then d3.time.scale() else d3.scale[xScale]()
    x.domain(opt.xlim or d3.extent(allXrange))
      .range([0, @width])
    @yScale = y = d3.scale[yScale]()
    y.domain(opt.ylim or d3.extent(allYrange))
      .range([@height, 0])

    line = d3.svg.line()
      .x((d)=> x(@_x(d)))
      .y((d)=> y(@_y(d)))

    category10 = d3.scale.category10()
    series.forEach (serie, sid)=>
      if @_color
        color = (d, idx)=>
          @_color(null, idx, sid)
      else if serie.opt?.color?
        color = (d, idx)-> serie.opt.color
      else
        color = (d, idx)->
          category10(sid)

      l = @svg.append("path").attr('class', "line serie-#{sid}")
        .datum(if (sort = opt.sort) then serie.data.sort(sort) else serie.data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .style("cursor", 'pointer')
        .on('mouseover', @inhibitOther('path.line', 0.2))
        .on('touchstart', @inhibitOther('path.line', 0.2))
        .on('mouseout', @clearInhibit('path.line'))
        .on('touchend', @clearInhibit('path.line'))

      dot = @svg.selectAll("circle.serie-#{sid}").data(serie.data).enter()
        .append('circle').attr('class', "serie-#{sid}")
        .attr('cx', (d)=> x(@_x(d)))
        .attr('cy', (d)=> y(@_y(d)))
        .attr('r', @opt.withPoint?.size or 2)
        .attr('fill', color)
        .attr('stroke', 'none')
        .attr('stroke-width', 3)
        .style('cursor', 'pointer')
      if @opt.withPoint
        dot.on('mouseover', (d)=>
          dom = d3.select(d3.event.target)
          dom.attr('r', @opt.withPoint?.size + 3 or 4)
            .attr('stroke', dom.attr('fill'))
            .attr('fill', 'white')
        ).on('mouseout', (d)=>
          dom = d3.select(d3.event.target)
          dom.attr('r', @opt.withPoint?.size or 2)
            .attr('fill', dom.attr('stroke'))
            .attr('stroke', 'none')
        )

    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} circle").tipsy
        gravity: @opt.tooltip.gravity or "s"
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)

    if not @svg.select('g.xaxis')[0][0]
      xaxis = getAxis x, new Option({}, @opt.axis?.x)
      yaxis = getAxis y, new Option({orient: 'left'}, @opt.axis?.y)

      xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
        .attr("transform", "translate(0,#{@height})")
      xAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
      yAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")

      if @opt.axis?.x?.title
        xTitle = xAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.x?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.xaxis g.tick text')
        tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
        tickY = d3.max tickLabel, (d)-> d.getBBox().y
        xTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

      if @opt.axis?.y?.title
        yTitle = yAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.y?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.yaxis g.tick text')
        tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
        yTitle.attr('dx', -(@height + width) / 2).attr('dy', - (tickWidth + height))
        yTitle.attr('transform', "rotate(-90)")

    @appendLegend(series)

  #
  # ### draw area chart
  #
  drawArea: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    if err = @isValidPositionAccessor mergedSeries[0]
      return err
    opt = new Option @opt, opt

    allXrange = d3.extent mergedSeries, @_x
    allYrange = d3.extent mergedSeries, @_y

    xType = @_x(mergedSeries[0]).constructor
    yType = Number

    xScale = opt.xscale or "linear"
    yScale = opt.yscale or "linear"

    @xScale = x =
      if xType.name is 'Date' then d3.time.scale() else d3.scale[xScale]()
    x.domain(opt.xlim or d3.extent(allXrange))
      .range([0, @width])
    @yScale = y = d3.scale[yScale]()
    y.domain(opt.ylim or d3.extent(allYrange))
      .range([@height, 0])

    area = d3.svg.area()
      .x((d)=> x(@_x(d)))
      .y0(@height)
      .y1((d)=> y(@_y(d)))

    category10 = d3.scale.category10()
    series.forEach (serie, sid)=>
      if @_color
        color = (d, idx)=>
          @_color(null, idx, sid)
      else if serie.opt?.color?
        color = (d, idx)-> serie.opt.color
      else
        color = (d, idx)->
          category10(sid)

      l = @svg.append("path").attr('class', "area serie-#{sid}")
        .datum(if (sort = opt.sort) then serie.data.sort(sort) else serie.data)
        .attr("d", area)
        .attr("fill", color)
        .attr("stroke", "none")
        .style("cursor", 'pointer')
        .on('mouseover', @inhibitOther('path.area', 0.2))
        .on('touchstart', @inhibitOther('path.area', 0.2))
        .on('mouseout', @clearInhibit('path.area'))
        .on('touchend', @clearInhibit('path.area'))


    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} circle").tipsy
        gravity: @opt.tooltip.gravity or "s"
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)

    xaxis = getAxis x, new Option({}, @opt.axis?.x)
    yaxis = getAxis y, new Option({orient: 'left'}, @opt.axis?.y)

    if not @svg.select('g.xaxis')[0][0]
      xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
        .attr("transform", "translate(0,#{@height})")
      xAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
      yAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")

      if @opt.axis?.x?.title
        xTitle = xAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.x?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.xaxis g.tick text')
        tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
        tickY = d3.max tickLabel, (d)-> d.getBBox().y
        xTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

      if @opt.axis?.y?.title
        yTitle = yAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.y?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.yaxis g.tick text')
        tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
        yTitle.attr('dx', -(@height + width) / 2).attr('dy', - (tickWidth + height))
        yTitle.attr('transform', "rotate(-90)")

    @appendLegend(series)

  #
  # ### draw stack chart
  #
  drawStack: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    if err = @isValidPositionAccessor mergedSeries[0]
      return err
    opt = new Option @opt, opt

    allXrange = d3.extent mergedSeries, @_x
    allYrange = d3.extent mergedSeries, @_y

    rangeInEachX = d3.nest().key(@_x)
      .rollup((vals)=> vals.reduce(((p, c)=> p + @_y(c)), 0) )
      .entries(mergedSeries)

    xType = @_x(mergedSeries[0]).constructor
    yType = Number

    xScale = opt.xscale or "linear"
    yScale = opt.yscale or "linear"

    @xScale = x =
      if xType.name is 'Date' then d3.time.scale() else d3.scale[xScale]()
    x.domain(opt.xlim or d3.extent(allXrange))
      .range([0, @width])
    @yScale = y = d3.scale[yScale]()
    y.range([@height, 0])

    stack = d3.layout.stack()
      .offset('expand')
      .values((d)-> d.data)
      .y(@_y).x(@_x)

    area = d3.svg.area()
      .x((d)=> x(@_x(d)))
      .y0((d)-> y(d.y0))
      .y1((d, idx)=> y(d.y0 + d.y))

    category10 = d3.scale.category10()
    if @_color
      color = (d, idx, sid)=>
        @_color(null, idx, sid)
    else
      color = (d, idx, sid)->
        category10(sid)

    l = @svg.selectAll("path.stack").data(stack(series)).enter()
      .append("path").attr('class', (d, sid)-> "stack serie-#{sid}")
      .attr("d", (d)-> area(d.data))
      .attr("fill", (d, sid)-> color(d, null, sid))
      .attr("stroke", "none")
      .style("cursor", 'pointer')
      .on('mouseover', @inhibitOther('path.stack', 0.2))
      .on('touchstart', @inhibitOther('path.stack', 0.2))
      .on('mouseout', @clearInhibit('path.stack'))
      .on('touchend', @clearInhibit('path.stack'))

    xaxis = getAxis x, new Option({}, @opt.axis?.x)
    yaxis = getAxis y, new Option({orient: 'left'}, @opt.axis?.y)

    if not @svg.select('g.xaxis')[0][0]
      xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
        .attr("transform", "translate(0,#{@height})")
      xAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
      yAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")

      if @opt.axis?.x?.title
        xTitle = xAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.x?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.xaxis g.tick text')
        tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
        tickY = d3.max tickLabel, (d)-> d.getBBox().y
        xTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

      if @opt.axis?.y?.title
        yTitle = yAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.y?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.yaxis g.tick text')
        tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
        yTitle.attr('dx', -(@height + width) / 2).attr('dy', - (tickWidth + height))
        yTitle.attr('transform', "rotate(-90)")

    @appendLegend(series)

  #
  # ### draw bar chart
  #
  drawBar: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    if err = @isValidPositionAccessor mergedSeries[0]
      return err
    opt = new Option @opt, opt

    allLabels = null
    do (mergedSeries)=>
      labels = {}
      labels[@_x(dat)] = 1 for dat in mergedSeries
      allLabels = (label for label of labels).sort(@opt.sort)
    allYrange = d3.extent mergedSeries, @_y

    xType = String
    yType = Number

    @xScale = x = d3.scale.ordinal()
    @yScale = y = d3.scale[opt.yscale or "linear"]()

    if opt.transpose
      x.rangeBands([0, @height], 0.1).domain(allLabels)
      y.domain(opt.ylim or [0, d3.extent(allYrange)[1]])
        .range([0, @width])
    else
      x.rangeBands([0, @width], 0.1).domain(allLabels)
      y.domain(opt.ylim or [0, d3.extent(allYrange)[1]])
        .range([@height, 0])

    bandWidth = x.rangeBand() / series.length

    category10 = d3.scale.category10()
    series.forEach (serie, sid)=>
      if @_color
        color = (d, idx)=>
          @_color(d, idx, sid)
      else if serie.opt?.color?
        color = (d, idx)-> serie.opt.color
      else
        color = (d, idx)->
          category10(sid)

      rect = @svg.selectAll("rect.bar.serie-#{sid}").data(serie.data).enter()
        .append("rect").attr("class", "bar serie-#{sid}")

      if opt.transpose
        rect
          .attr("x", 0)
          .attr("width", (d)=> y(@_y(d)))
          .attr("y", (d)=> x(@_x(d)) + sid * bandWidth)
          .attr("height", bandWidth)
      else
        rect
          .attr("x", (d)=> x(@_x(d)) + sid * bandWidth)
          .attr("width", bandWidth)
          .attr("y", (d)=> y(@_y(d)))
          .attr("height", (d)=> @height - y(@_y(d)))

      rect
        .style("cursor", 'pointer')
        .attr("fill", color)
        .on('mouseover', @inhibitOther('rect.bar'))
        .on('touchstart', @inhibitOther('rect.bar'))
        .on('mouseout', @clearInhibit('rect.bar'))
        .on('touchend', @clearInhibit('rect.bar'))

    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} rect").tipsy
        gravity: @opt.tooltip.gravity or if opt.transpose then 'w' else 's'
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)

    if not @svg.select('g.xaxis')[0][0]
      if opt.transpose
        xaxis = getAxis x, new Option({orient: 'left'}, @opt.axis?.x)
        yaxis = getAxis y, new Option({}, @opt.axis?.y)

        xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
        xAxis.selectAll("path")
          .attr("fill", "none").attr("stroke", "black")
        yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
          .attr("transform", "translate(0,#{@height})")
        yAxis.selectAll("path")
          .attr("fill", "none").attr("stroke", "black")

        if @opt.axis?.x?.title
          xTitle = xAxis.append('text').attr('class', 'title')
            .text(@opt.axis?.x?.title).style('text-anchor', 'start')
          width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
          height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
          tickLabel = @$target.find('svg g.xaxis g.tick text')
          tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
          xTitle.attr('dx', -(@height + width) / 2).attr('dy', - (height + tickWidth))
          xTitle.attr('transform', "rotate(-90)")

        if @opt.axis?.y?.title
          yTitle = yAxis.append('text').attr('class', 'title')
            .text(@opt.axis?.y?.title).style('text-anchor', 'start')
          width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
          height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
          tickLabel = @$target.find('svg g.yaxis g.tick text')
          tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
          tickY = d3.max tickLabel, (d)-> d.getBBox().y
          yTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

      else
        xaxis = getAxis x, new Option({}, @opt.axis?.x)
        yaxis = getAxis y, new Option({orient: 'left'}, @opt.axis?.y)

        xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
          .attr("transform", "translate(0,#{@height})")
        xAxis.selectAll("path")
          .attr("fill", "none").attr("stroke", "black")
        yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
        yAxis.selectAll("path")
          .attr("fill", "none").attr("stroke", "black")

        if @opt.axis?.x?.title
          xTitle = xAxis.append('text').attr('class', 'title')
            .text(@opt.axis?.x?.title).style('text-anchor', 'start')
          width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
          height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
          tickLabel = @$target.find('svg g.xaxis g.tick text')
          tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
          tickY = d3.max tickLabel, (d)-> d.getBBox().y
          xTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

        if @opt.axis?.y?.title
          yTitle = yAxis.append('text').attr('class', 'title')
            .text(@opt.axis?.y?.title).style('text-anchor', 'start')
          width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
          height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
          tickLabel = @$target.find('svg g.yaxis g.tick text')
          tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
          yTitle.attr('dx', -(@height + width) / 2).attr('dy', - (tickWidth + height))
          yTitle.attr('transform', "rotate(-90)")

    @appendLegend(series)

  #
  # ### box plot
  #
  drawBox: (series, opt = {})->
    return new AccessorError "", @_y, data unless typeof @_y is 'function' and @_y(series[0].data[0])?
    mergedSeries = @getMergedSeries series
    opt = new Option @opt, opt

    allLabels = series.map (d)-> d.name
    allYrange = d3.extent mergedSeries, @_y

    xType = String
    yType = Number

    @xScale = x = d3.scale.ordinal()
    @yScale = y = d3.scale[opt.yscale or "linear"]()

    x.rangeBands([0, @width], 0.1).domain(allLabels)
    y.domain(opt.ylim or [0, d3.extent(allYrange)[1]])
      .range([@height, 0])

    bandWidth = x.rangeBand()

    category10 = d3.scale.category10()
    series.forEach (serie, sid)=>
      if @_color
        color = (d, idx)=>
          @_color(d, idx, sid)
      else if serie.opt?.color?
        color = (d, idx)-> serie.opt.color
      else
        color = (d, idx)->
          category10(sid)

      data = serie.data.map((d)=> @_y(d)).sort (a, b)-> a - b

      median = d3.median data
      first = d3.quantile data, 0.25
      third = d3.quantile data, 0.75
      hinge = third - first
      min = Math.max Math.min.apply(Math, data), first - 1.5 * hinge
      max = Math.min Math.max.apply(Math, data), third + 1.5 * hinge

      outlier = data.filter (d)-> d > max or d < min

      width = bandWidth * 0.8

      box = @svg.append('g')
        .attr('class', 'box serie-#{sid}"')
        .attr('transform', "translate(#{x(serie.name)}, 0)")
      box[0][0].__data__ =
        median: median
        first: first
        third: third
        hinge: hinge
        min: min
        max: max
        outlier: outlier



      box.append('rect')
        .attr('x', 0).attr('y', y(third))
        .attr('width', width).attr('height', y(first) - y(third))
        .attr('fill', 'white').attr('stroke', color).attr('stroke-width', 2)
      # median
      box.append('line').attr('stroke', color)
        .attr('x1', 0).attr('y1', y(median))
        .attr('x2', width).attr('y2', y(median))
        .attr('stroke-width', 3)
      # min
      box.append('line').attr('stroke', color)
        .attr('x1', width / 2).attr('y1', y(first))
        .attr('x2', width / 2).attr('y2', y(min))
      box.append('line').attr('stroke', color)
        .attr('x1', width * 0.25).attr('y1', y(min))
        .attr('x2', width * 0.75).attr('y2', y(min))
      # max
      box.append('line').attr('stroke', color)
        .attr('x1', width / 2).attr('y1', y(max))
        .attr('x2', width / 2).attr('y2', y(third))
      box.append('line').attr('stroke', color)
        .attr('x1', width * 0.25).attr('y1', y(max))
        .attr('x2', width * 0.75).attr('y2', y(max))
      box.selectAll('circle.outlier').data(outlier).enter()
        .append('circle').attr('class', 'outlier')
        .attr('cx', width / 2).attr('cy', (d)-> y(d))
        .attr('r', 3)
        .attr('stroke', color).attr('fill', 'none')


    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} g.box rect").tipsy
        gravity: @opt.tooltip.gravity or if opt.transpose then 'w' else 's'
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)

    if not @svg.select('g.xaxis')[0][0]
      xaxis = getAxis x, new Option({}, @opt.axis?.x)
      yaxis = getAxis y, new Option({orient: 'left'}, @opt.axis?.y)

      xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
        .attr("transform", "translate(0,#{@height})")
      xAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
      yAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")

      if @opt.axis?.x?.title
        xTitle = xAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.x?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.xaxis g.tick text')
        tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
        tickY = d3.max tickLabel, (d)-> d.getBBox().y
        xTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

      if @opt.axis?.y?.title
        yTitle = yAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.y?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.yaxis g.tick text')
        tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
        yTitle.attr('dx', -(@height + width) / 2).attr('dy', - (tickWidth + height))
        yTitle.attr('transform', "rotate(-90)")

    @appendLegend(series)

  #
  # ### draw pie chart
  #
  drawPie: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    if err = @isValidPositionAccessor mergedSeries[0]
      return err
    opt = new Option @opt, opt

    @svg.attr('transform', '')
      .attr('width', @width + @margin.width)
      .attr('height', @height + @margin.height)

    radius = Math.min((@width + @margin.width) / series.length, (@height + @margin.height)) / 2
    outerMargin = opt.outerMargin or 10
    innerMargin = Math.min (opt.innerMargin or 0), radius - outerMargin - 10

    @xScale = x = d3.scale.ordinal()
      .rangeBands([0, @width + @margin.width], 0.1)
      .domain((serie.name for serie in series))

    category10 = d3.scale.category10()
    series.forEach (serie, sid)=>
      if @_color
        color = @_color
      else if serie.opt?.color?
        color = (d, idx)-> serie.opt.color
      else
        color = (d, idx)->
          category10(idx)
      arc = d3.svg.arc()
        .outerRadius(radius - outerMargin)
        .innerRadius(innerMargin)
      pie = d3.layout.pie().sort(null).value(@_y)

      g = @svg.selectAll("g.arc.serie-#{sid}").data(pie(serie.data)).enter()
        .append('g').attr('class', "arc serie-#{sid}")
        .attr('transform', "translate(#{radius + x(serie.name)},#{radius})")
      g.append('path')
        .attr('d', arc)
        .attr('fill', color)
        .style("cursor", 'pointer')
      g
        .on('mouseover', @inhibitOther('g.arc'))
        .on('touchstart', @inhibitOther('g.arc'))
        .on('mouseout', @clearInhibit('g.arc'))
        .on('touchend', @clearInhibit('g.arc'))

    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} path").tipsy
        gravity: @opt.tooltip.gravity or "s"
        html: true
        title: ()->
          d = this.__data__.data
          tooltipFormat(d)

    @appendLegend(series, ()-> 'grey')

  #
  # ### draw flow chart
  #
  drawFlow: (data, opt = {})->
    opt = new Option @opt, opt
    unless d3.sankey?
      throw new Error 'veasy require d3.sankey.\nuse d3.sankey (https://github.com/d3/d3-plugins/tree/master/sankey)'
    unless data.nodes and data.links
      return @errorHandler new Error "flow chart require {nodes: [], links: []}"

    for node, idx in data.nodes
      node.id = node.id or idx

    color = d3.scale.category10()

    sankey = d3.sankey()
      .nodeWidth(opt.nodeWidth or 20)
      .nodePadding(opt.nodePadding or 0)
      .size([@width, @height])

    path = sankey.link()
    sankey.nodes(data.nodes)
      .links(data.links)
      .layout(32)

    link = @svg.selectAll('path.link')
      .data(data.links).enter()
      .append('path')
      .attr('class', (d)-> "link src-#{d.source.id} tgt-#{d.target.id}")
      .attr('d', path)
      .attr('stroke', 'grey')
      .attr('stroke-width', (d)-> Math.max(1, d.dy))
      .attr('fill', 'none')
      .style('opacity', 0.6)
      .style("cursor", 'pointer')
      .on('mouseover', (d)-> d3.select(this).style('opacity', 0.9))
      .on('mouseout', (d)-> d3.select(this).style('opacity', 0.6))


    # link style and attr

    node = @svg.selectAll('g.node')
      .data(data.nodes).enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d)-> "translate(#{d.x},#{d.y})")
    rect = node.append('rect')
      .attr('height', (d)-> d.dy)
      .attr('width', (d)-> sankey.nodeWidth())
      .attr('fill', (d)-> d.color or (d.color = color(d.name)))
      .style("cursor", 'pointer')
      .on('mouseover', @inhibitOther('g.node rect'))
      .on('touchstart', @inhibitOther('g.node rect'))
      .on('mouseout', @clearInhibit('g.node rect'))
      .on('touchend', @clearInhibit('g.node rect'))
    # node.append('text')
    # text

    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} g.node rect").tipsy
        gravity: @opt.tooltip.gravity or "s"
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)

      $("svg##{@id} path.link").tipsy
        gravity: @opt.tooltip.gravity or "s"
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)

  #
  # ### draw scatterPlot
  #
  drawScatterPlot: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    if error = @isValidPositionAccessor(mergedSeries[0])
      return @errorHandler error

    opt = new Option @opt, opt

    allXrange = d3.extent mergedSeries, @_x
    allYrange = d3.extent mergedSeries, @_y

    xType = @_x(mergedSeries[0]).constructor
    yType = Number

    xScale = opt.xscale or "linear"
    yScale = opt.yscale or "linear"

    @xScale = x = if xType.name is 'Date' then d3.time.scale() else d3.scale[xScale]()
    x.domain(opt.xlim or d3.extent(allXrange))
      .range([0, @width])
    @yScale = y = d3.scale[yScale]()
    y.domain(opt.ylim or d3.extent(allYrange))
      .range([@height, 0])

    category10 = d3.scale.category10()
    series.forEach (serie, sid)=>
      sym = d3.svg.symbol().type('circle')

      if @_color?
        color = (d, idx)=>
          @_color(d, idx, sid)
      else
        color = (d, idx)->
          category10(sid)
      if @_symbol?
        symbol = (d, idx)=>
          @_symbol(d, idx, sid)

      point = @svg.selectAll("path.plot.serie-#{sid}").data(serie.data).enter()
        .append('path').attr('class', "plot serie-#{sid}")
        .attr('d', (d, idx)=>
          sym.size(@_size?(d) or 48).type(symbol?(d, idx) or 'circle')(d))
        .attr('transform', (d)=> "translate(#{x(@_x(d))},#{y(@_y(d))})")
        .attr('fill', color)

      if tooltipFormat = @opt.tooltip?.format
        $("svg##{@id} path.plot.serie-#{sid}").tipsy
          gravity: @opt.tooltip.gravity or "s"
          html: true
          title: ()->
            d = this.__data__
            tooltipFormat(d)

    if not @svg.select('g.xaxis')[0][0]
      xaxis = getAxis x, new Option({}, @opt.axis?.x)
      yaxis = getAxis y, new Option({orient: 'left'}, @opt.axis?.y)

      xAxis = @svg.append("g").attr('class', 'xaxis').call(xaxis)
        .attr("transform", "translate(0,#{@height})")
      xAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").attr('class', 'yaxis').call(yaxis)
      yAxis.selectAll("path")
        .attr("fill", "none").attr("stroke", "black")

      if @opt.axis?.x?.title
        xTitle = xAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.x?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.xaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.xaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.xaxis g.tick text')
        tickHeight = d3.max tickLabel, (d)-> d.getBBox().height
        tickY = d3.max tickLabel, (d)-> d.getBBox().y
        xTitle.attr('dx', (@width - width) / 2).attr('dy', tickHeight + tickY + height)

      if @opt.axis?.y?.title
        yTitle = yAxis.append('text').attr('class', 'title')
          .text(@opt.axis?.y?.title).style('text-anchor', 'start')
        width = @$target.find('svg g.yaxis text.title')[0].getBBox().width
        height = @$target.find('svg g.yaxis text.title')[0].getBBox().height
        tickLabel = @$target.find('svg g.yaxis g.tick text')
        tickWidth = d3.max tickLabel, (d)-> d.getBBox().width
        yTitle.attr('dx', -(@height + width) / 2).attr('dy', - (tickWidth + height))
        yTitle.attr('transform', "rotate(-90)")

    @appendLegend(series)

  #
  # ### draw scatterMatrix
  #
  drawScatterMatrix: (series, opt = {})->
    mergedSeries = @getMergedSeries series
    opt = new Option @opt, opt

    attrs = (k for k of series[0].data[0])
    padding = 5
    margin  = 10
    r = 2

    width = 0|((@width - (padding * (attrs.length - 1))) / attrs.length) - margin * 2
    height = 0|((@height - (padding * (attrs.length - 1))) / attrs.length) - margin * 2

    extents = {}
    scales  = {}
    types  =  {}
    for attr, idx1 in attrs
      extent = extents[attr] = d3.extent(mergedSeries, (d)-> d[attr])
      type = types[attr] = mergedSeries[0][attr].constructor.name
      scales[attr] = (if type is 'Date' then d3.time.scale() else d3.scale.linear())
        .domain(extent)

    for attr1, idx1 in attrs
      for attr2, idx2 in attrs
        matrix = @svg.append('g').attr('class', 'scattermatrix')
          .attr('width', width).attr('height', height)
          .attr('transform', (d)->
            "translate(#{(width + padding + margin * 2) * idx2}, #{(height + padding + margin * 2) * idx1})")

        scale1 = scales[attr1].range([width, 0])
        scale2 = scales[attr2].range([0, height])

        if idx2 is 0
          text = matrix.append('text').text(attrs[idx1])
          text.attr('transform', "rotate(-90) translate(-#{height}, -40)")
          yaxis = d3.svg.axis().scale(scales[attr1]).orient('left')
            .ticks(5)
          if types[attr1] is 'Date'
            yaxis.tickFormat(d3.time.format("%y/%m/%d"))
          yAxis = matrix.append('g')
            .attr('class', 'yaxis')
            .call(yaxis)
          yAxis.selectAll('path').attr('fill', 'none')

        if idx1 is 0
          matrix.append('text').text(attrs[idx2])
            .attr('transform', "translate(0, -40)")
          xaxis = d3.svg.axis().scale(scales[attr2]).orient('top')
            .ticks(5)
          if types[attr2] is 'Date'
            xaxis.tickFormat(d3.time.format("%y/%m/%d"))
          xAxis = matrix.append('g')
            .attr('class', 'xaxis')
            .call(xaxis)
          xAxis.selectAll('path').attr('fill', 'none')
          xAxis.selectAll('text').attr('transform', 'rotate(-90) translate(20, 10)')

        matrix.append('rect')
          .attr('width', width + r * 2)
          .attr('height', height + r * 2)
          .attr('transform', "translate(#{-r}, #{-r})")
          .attr('stroke', 'black')
          .attr('fill', 'none')

        colors = d3.scale.category10()
        if idx1 is idx2
          scaleRange = scales[attr1].range([0, 9])
          mergedData = d3.nest().key((d)-> 0|scaleRange(d[attr1]) ).sortKeys()
            .rollup((vals)-> vals.length).entries(mergedSeries)
          w = (width + r * 2) / mergedData.length

          series.forEach (serie, sid)->
            data = d3.nest().key((d)-> 0|scaleRange(d[attr1]) ).sortKeys((a, b)-> a - b)
              .rollup((vals)-> vals.length).entries(serie.data)
            scale = d3.scale.linear().domain([0, d3.extent(data, (d)-> d.values)[1]])
              .range([(height / series.length), 0])

            matrix.append('g').selectAll('rect').data(data).enter()
              .append('rect')
              .attr('width', w)
              .attr('height', (d)-> height / series.length - scale(d.values))
              .attr('x', (d, idx)-> w * idx - r)
              .attr('y', (d)-> height / series.length * sid + scale(d.values) + r)
              .attr('fill', colors(sid))

          continue

        series.forEach (serie, idx)->
          matrix.append('g').selectAll("circle.scatter.serie-#{idx}")
            .data(serie.data).enter()
            .append('circle').attr('class', "scatter serie-#{idx}")
            .attr('cy', (d)-> scales[attr1](d[attr1]))
            .attr('cx', (d)-> scales[attr2](d[attr2]))
            .attr('r', r)
            .attr('fill', colors(idx)).attr('stroke', 'none')

  #
  # ### draw bubble
  #
  drawBubble: (data, opt = {})->

  #
  # ### draw colored table
  #
  drawColoredTable: (data, opt = {})->
    table = d3.select(@$target.get(0)).append('table')

    tr = table.selectAll('tr').data(data).enter()
      .append('tr')

    tr.selectAll('td').data((d)-> d.data).enter()
      .append('td')
      .text((d)=>
        @_y(d)
      )

# Axis utility
getAxis = (scale, opt = {})->
  axis = d3.svg.axis().scale(scale)
  for attr, value of opt
    if typeof axis[attr] is 'function'
      axis[attr] value
  axis

Veasy.Option = class Option
  # overwrite opt after options
  constructor: (opts...)->
    for opt in opts
      for k, v of opt
        this[k] = v

Veasy.AccessorError = class AccessorError extends Error
  constructor: (x, y, data)->
    @message = ["accessor uncorrespoding to data"
      "= x ====="
      "#{x.toString()}"
      "= y ====="
      "#{y.toString()}"
      "= data =="
      "#{JSON.stringify(data)}"
      "======="
      ].join("\n")

this.Veasy = Veasy
