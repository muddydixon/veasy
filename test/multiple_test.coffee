describe 'multiple chart', ->
  baseid = 'multi'
  id = 0
  ymd = d3.time.format('%y/%m/%d')

  seriesData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..100].map (i)->
      time: new Date(2013, 0, i)
      value: 0|Math.random() * 1000
  pointData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..100].map (i)->
      x: 0|Math.random() * 1000
      y: 0|Math.random() * 1000
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]

  beforeEach ->
    this.__id__ = id++
    $('<div>', {id: "#{baseid}_#{this.__id__}"})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()

  it 'multiple series', ->
    chart = $("##{baseid}_#{this.__id__}")

    sales = new Veasy chart,
      height: 400
      margin: [50, 50]
      axis:
        x:
          ticks: 8
          tickFormat: (d)-> ymd(new Date(d))
    sales.x((d)-> d.time).y((d)-> d.value)

    sales.drawScatterPlot seriesData
    sales.drawBar seriesData
