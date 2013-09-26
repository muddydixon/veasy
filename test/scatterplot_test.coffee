describe 'scatter plot', ->
  baseid = 'scatter'
  id = 0

  seriesData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..100].map (i)->
      time: new Date(2013, 0, i)
      value: 0|Math.random() * 500 + 500
      sales: 0|Math.random() * 1000
      cost: 0|Math.random() * 100
      country: 0|Math.random() * 7
  pointData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..100].map (i)->
      x: 0|Math.random() * 1000
      y: 0|Math.random() * 1000
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]

  beforeEach ->
    this.__id__ = id++
    $('<div>', {class: "pane", id: "#{baseid}_#{this.__id__}"})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()

  it 'basically series', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    sales.x((d)-> d.time).y((d)-> d.value).legend('s')
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"

  it 'basically series color accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    sales.x((d)-> d.time).y((d)-> d.value)
      .color((d, idx)-> color(d.sales))
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"

  it 'basically series color accessor, size accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    sales.x((d)-> d.time).y((d)-> d.value)
      .color((d, idx)-> color(d.sales))
      .size((d)-> d.cost)
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"

  it 'basically series size accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    sales.x((d)-> d.time).y((d)-> d.value)
      .size((d)-> 0|d.cost)
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"

  it 'basically series symbol accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    symbol = d3.svg.symbolTypes
    sales.x((d)-> d.time).y((d)-> d.value)
      .size((d)-> 0|d.cost)
      .symbol((d, idx, sid)-> symbol[sid % 7])
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"
    #
  it 'basically series symbol accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    symbol = d3.svg.symbolTypes
    sales.x((d)-> d.time).y((d)-> d.value)
      .size((d)-> 0|d.cost)
      .color((d, idx, sid)-> color(d.sales))
      .symbol((d, idx, sid)-> symbol[sid % 7])
      .legend('es')
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"

  it 'basically series symbol accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      tooltip:
        format: (d, idx)->
          "sales: #{d.sales}"

    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    symbol = d3.svg.symbolTypes
    sales.x((d)-> d.time).y((d)-> d.value)
      .size((d)-> d.sales / 5)
      .color((d, idx, sid)-> color(d.sales))
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"

  it 'axis title', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      tooltip:
        format: (d, idx)->
          "sales: #{d.sales}"
      axis:
        x:
          title: "タイトル X 軸"
        y:
          title: "タイトル Y 軸"

    sales.x((d)-> d.time).y((d)-> d.value)
      .size((d)-> d.sales / 5)
    sales.drawScatterPlot seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"
