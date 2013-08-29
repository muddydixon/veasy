describe 'pie chart', ->
  baseid = 'pie'
  id = 0
  
  pointData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..6 + id].map (i)->
      label: "category#{i}"
      value: 0|300 + Math.random() * 700
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]
    
  beforeEach ->
    this.__id__ = id++
    $('<div>', {id: "#{baseid}_#{this.__id__}"}).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()
  #

  it 'basically point', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    sales.x((d)-> d.label).y((d)-> d.value)
    sales.drawPie pointData

    # expect(chart.find('g.arc')).have.length 40
    # for d, idx in pointData
    #   expect(chart.find("rect.bar.serie-#{idx}")).have.length 10

  it 'basically point with margin', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart, {innerMargin: 120}
    sales.x((d)-> d.label).y((d)-> d.value)
    sales.drawPie pointData.slice(0, 3)
