describe 'box plot', ->
  baseid = 'box'
  id = 0

  pointData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..9].map (i)->
      label: "category#{i}"
      value: 0|300 + Math.random() * 700
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]

  beforeEach ->
    this.__id__ = id++
    $('<div>', {id: "#{baseid}_#{this.__id__}"})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()
  #

  it 'basically point', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      width: 600
      tooltip:
        format: (d)-> "domain: [#{d.min}, #{d.max}]<br>IQR: #{d.first}, #{d.median}, #{d.third}"
    sales.x((d)-> d.label).y((d)-> d.value)
    sales.drawBox pointData
