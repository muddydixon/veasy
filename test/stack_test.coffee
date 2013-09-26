describe 'stack chart', ->
  baseid = 'stack'
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
    $('<div>', {class: "pane", id: "#{baseid}_#{this.__id__}"})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()

  it 'basically series', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      axis:
        x:
          title: "x axis"
        y:
          title: "y axis"
    sales.x((d)-> d.time).y((d)-> d.value)
    sales.drawStack seriesData

    stacks = chart.find('path.stack')
    expect(stacks).have.length 4
    for stack, idx in stacks
      expect($(stack).attr('d')).not.contain "NaN"
