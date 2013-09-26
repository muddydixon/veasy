describe 'scatter matrix', ->
  baseid = 'scattermatrix'
  id = 0

  seriesData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..30].map (i)->
      time: new Date(2013, 0, i)
      value: Math.random() * 0.1 + Math.sin i
      sales: Math.random() * 0.1  + Math.cos i
      cost:  0|Math.random() * 100
      country: 0|Math.random() * 7 * (id + 1)
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
    sales = new Veasy chart,
      height: 800
      width: 800
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"])
    sales.x((d)-> d.time).y((d)-> d.value)
    sales.drawScatterMatrix seriesData

    # lines = chart.find('path.line')
    # expect(lines).have.length 4
    # for line, idx in lines
    #   expect($(line).attr('d')).not.contain "NaN"
