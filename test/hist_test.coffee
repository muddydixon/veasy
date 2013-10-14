describe 'histgram', ->
  baseid = 'hist'
  id = 0

  pointData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..200 - 1].map (i)->
      label: "category#{i}"
      value: 0|300 + Math.random() * 700
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]

  beforeEach ->
    this.__id__ = id++
    $('<div>', {class: "pane", id: "#{baseid}_#{this.__id__}"})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()
  #

  it 'basically point', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      width: 300
      tooltip:
        format: (d)->
          d.value
    sales.x((d)-> d.label).y((d)-> d.value).legend('swx3')
    sales.drawHist pointData
