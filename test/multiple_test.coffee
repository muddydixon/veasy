describe 'multiple chart', ->
  baseid = 'multi'
  id = 0
  
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
      height: 800
      margin: [50, 300]
    sales.x((d)-> d.time).y((d)-> d.value)
    
    sales.drawBar seriesData
    sales.drawScatterPlot seriesData

