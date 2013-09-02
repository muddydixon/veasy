unless d3?
  throw new Error 'veasy require d3.\nwrite <script src="//d3js.org/d3.v3.min.js" charset="utf-8"></script>"'
  
unless $ or jQuery
  throw new Error 'veasy require jquery.\nwrite <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" charset="utf-8"></script>"'

class Veasy
  constructor: (@$target, @opt = {})->
    @id = "#{Date.now()}-#{$('svg').length}"
    @$target = $(@$target) unless $target instanceof jQuery

    @margin = @opt.margin or [50, 50]
    @width  = (@opt.width or @$target.width() or 400) - @margin[0] * 2
    @height = (@opt.height or 300) - @margin[1] * 2

    @_x = null
    @_y = null
    @xDefault = @opt.xDefault
    @yDefault = @opt.yDefault

    @svg = d3.select(@$target.get(0)).append('svg').attr('id', @id)
      .attr('width', @width + @margin[0] * 2)
      .attr('height', @height + @margin[1] * 2)
      .append('g')
      .attr('width', @width)
      .attr('height', @height)
      .attr('transform', "translate(#{@margin[0]}, #{@margin[1]})")

    if @opt.color? and @opt.color instanceof Array
      @color = (d)-> @opt.color[d]
    else
      @color = d3.scale.category10()
      
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
    @_y = y
    this

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
  # ### checkAccessors
  #
  checkAccessorValidation: (data)->
    if typeof @_x(data) is 'undefined'
      return @errorHandler new Veasy.AccessorError @_x, @_y, data
    if typeof @_y(data) is 'undefined'
      return @errorHandler new Veasy.AccessorError @_x, @_y, data

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
  
  #
  # ### draw line chart
  # 
  drawLine: (series, opt = {})->
    return @errorHandler new Error "accessor x required" unless @_x
    return @errorHandler new Error "accessor y required" unless @_y
    opt = new Option @opt, opt

    for serie in series
      unless serie.data?
        series = [{name: "no name", data: series}]
        break;
    
    mergedSeries = @getMergedSeries series
    @checkAccessorValidation mergedSeries[0]

    allXrange = d3.extent mergedSeries, @_x
    allYrange = d3.extent mergedSeries, @_y

    xType = @_x(mergedSeries[0]).constructor
    yType = Number

    xScale = opt.xscale or "linear"
    yScale = opt.yscale or "linear"

    x = if xType.name is 'Date' then d3.time.scale() else d3.scale[xScale]()
    x.domain(opt.xlim or d3.extent(allXrange))
      .range([0, @width])
    y = d3.scale[yScale]()
    y.domain(opt.ylim or d3.extent(allYrange))
      .range([@height, 0])

    line = d3.svg.line()
      .x((d)=> x(@_x(d)))
      .y((d)=> y(@_y(d)))

    for serie, idx in series
      serie.color = serie.opt?.color or @color(idx)
      l = @svg.append("path").attr('class', 'line')
        .datum(if (sort = opt.sort) then serie.data.sort(sort) else serie.data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", serie.color)
        .attr("stroke-width", 2)
        .style("cursor", 'pointer')
        .on('mouseover', @inhibitOther('path.line', 0.2))
        .on('touchstart', @inhibitOther('path.line', 0.2))
        .on('mouseout', @clearInhibit('path.line'))
        .on('touchend', @clearInhibit('path.line'))
        
      dot = @svg.selectAll("circle.serie-#{idx}").data(serie.data).enter()
        .append('circle').attr('class', "serie-#{idx}")
        .attr('cx', (d)=> x(@_x(d)))
        .attr('cy', (d)=> y(@_y(d)))
        .attr('r', 5)
        .attr('fill', serie.color)
        .attr('stroke', 'none')
        .attr('stroke-width', 3)
        .style('cursor', 'pointer')
      dot.on('mouseover', (d)=>
        dom = d3.select(d3.event.target)
        dom.attr('r', 7)
          .attr('stroke', dom.attr('fill'))
          .attr('fill', 'white')
      ).on('mouseout', (d)=>
        dom = d3.select(d3.event.target)
        dom.attr('r', 5)
          .attr('fill', dom.attr('stroke'))
          .attr('stroke', 'none')
      )
      
    if tooltipFormat = @opt.tooltip?.format
      $("svg##{@id} circle").tipsy
        gravity: 'w'
        html: true
        title: ()->
          d = this.__data__
          tooltipFormat(d)
      
    xaxis = d3.svg.axis().scale(x)
    yaxis = d3.svg.axis().scale(y).orient("left")

    xAxis = @svg.append("g").call(xaxis)
      .attr("transform", "translate(0,#{@height})")
      .selectAll("path")
      .attr("fill", "none").attr("stroke", "black")
    yAxis = @svg.append("g").call(yaxis)
      .selectAll("path")
      .attr("fill", "none").attr("stroke", "black")
    
  #
  # ### draw bar chart
  # 
  drawBar: (series, opt = {})->
    return @errorHandler new Error "accessor x required" unless @_x
    return @errorHandler new Error "accessor y required" unless @_y
    opt = new Option @opt, opt
    
    for serie in series
      unless serie.data?
        series = [{name: "no name", data: series}]
        break;
    
    self = this

    mergedSeries = @getMergedSeries series
    @checkAccessorValidation mergedSeries[0]

    allLabels = null
    do (mergedSeries)=>
      labels = {}
      labels[@_x(dat)] = 1 for dat in mergedSeries
      allLabels = (label for label of labels).sort()
    allYrange = d3.extent mergedSeries, @_y

    xType = String
    yType = Number
    
    x = d3.scale.ordinal()
    y = d3.scale[opt.yscale or "linear"]()

    if opt.transpose
      x.rangeBands([0, @height], 0.1).domain(allLabels)
      y.domain(opt.ylim or [0, d3.extent(allYrange)[1]])
        .range([0, @width])
    else
      x.rangeBands([0, @width], 0.1).domain(allLabels)
      y.domain(opt.ylim or [0, d3.extent(allYrange)[1]])
        .range([@height, 0])

    bandWidth = x.rangeBand() / series.length
    
    series.forEach (serie, idx)=>
      serie.color = serie.opt?.color or @color(idx)
      rect = @svg.selectAll("rect.bar.serie-#{idx}").data(serie.data).enter()
        .append("rect").attr("class", "bar serie-#{idx}")

      if opt.transpose
        rect
          .attr("x", 0)
          .attr("width", (d)=> y(@_y(d)))
          .attr("y", (d)=> x(@_x(d)) + idx * bandWidth)
          .attr("height", bandWidth)
      else
        rect
          .attr("x", (d)=> x(@_x(d)) + idx * bandWidth)
          .attr("width", bandWidth)
          .attr("y", (d)=> y(@_y(d)))
          .attr("height", (d)=> @height - y(@_y(d)))
        
      rect
        .style("cursor", 'pointer')
        .attr("fill", serie.color)
        .on('mouseover', @inhibitOther('rect.bar'))
        .on('touchstart', @inhibitOther('rect.bar'))
        .on('mouseout', @clearInhibit('rect.bar'))
        .on('touchend', @clearInhibit('rect.bar'))

    if opt.transpose
      xaxis = d3.svg.axis().scale(x).orient("left")
      yaxis = d3.svg.axis().scale(y)

      xAxis = @svg.append("g").call(xaxis)
        .selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").call(yaxis)
        .attr("transform", "translate(0,#{@height})")
        .selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
    else
      xaxis = d3.svg.axis().scale(x)
      yaxis = d3.svg.axis().scale(y).orient("left")

      xAxis = @svg.append("g").call(xaxis)
        .attr("transform", "translate(0,#{@height})")
        .selectAll("path")
        .attr("fill", "none").attr("stroke", "black")
      yAxis = @svg.append("g").call(yaxis)
        .selectAll("path")
        .attr("fill", "none").attr("stroke", "black")

  #
  # ### draw pie chart
  # 
  drawPie: (series, opt = {})->
    return @errorHandler new Error "accessor x required" unless @_x
    return @errorHandler new Error "accessor y required" unless @_y
    opt = new Option @opt, opt

    for serie in series
      unless serie.data?
        series = [{name: "no name", data: series}]
        break

    radius = Math.min(@width / series.length, @height) / 2
    outerMargin = opt.outerMargin or 10
    innerMargin = Math.min (opt.innerMargin or 0), radius - outerMargin - 10

    x = d3.scale.ordinal()
      .rangeBands([0, @width], 0.1)
      .domain((serie.name for serie in series))

    series.forEach (serie, idx)=>
      color = d3.scale.category10()
      arc = d3.svg.arc()
        .outerRadius(radius - outerMargin)
        .innerRadius(innerMargin)
      pie = d3.layout.pie().sort(null).value(@_y)

      g = @svg.selectAll("g.arc.serie-#{idx}").data(pie(serie.data)).enter()
        .append('g').attr('class', "arc serie-#{idx}")
        .attr('transform', "translate(#{radius + x(serie.name)},#{radius})")
      g.append('path')
        .attr('d', arc)
        .attr('fill', (d, i)=> color(i))
        .style("cursor", 'pointer')
      g
        .on('mouseover', @inhibitOther('g.arc'))
        .on('touchstart', @inhibitOther('g.arc'))
        .on('mouseout', @clearInhibit('g.arc'))
        .on('touchend', @clearInhibit('g.arc'))
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

Veasy.Option = class Option
  # overwrite value after options
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
