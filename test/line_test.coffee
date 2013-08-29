describe 'line chart', ->
  baseid = 'line'
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
    $('<div>', {id: "#{baseid}_#{this.__id__}"}).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()

  it 'basically series', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Chart chart
    sales.x((d)-> d.time).y((d)-> d.value)
    sales.drawLine seriesData

    lines = chart.find('path.line') 
    expect(lines).have.length 4
    for line, idx in lines
      expect($(line).attr('d')).not.contain "NaN"

  it 'basically point', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Chart chart, {sort: (a, b)-> a.x - b.x}
    sales.x((d)-> d.x).y((d)-> d.y)
    sales.drawLine pointData

    lines = chart.find('path.line') 
    expect(lines).have.length 4
    for line, idx in lines
      expect($(line).attr('d')).not.contain "NaN"
    
  it 'error uncorresponding accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Chart chart
    sales.x((d)-> d.x).y((d)-> d.y)

    expect(()->
      sales.drawLine seriesData
    ).throw(Error)

  it 'only one serie', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Chart chart
    sales.x((d)-> d.time).y((d)-> d.value)
    sales.drawLine seriesData[0].data

    lines = chart.find('path.line')
    expect(lines).have.length 1
    expect($(lines).attr('d')).not.contain "NaN"

    
  it 'custom color', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Chart chart, {color: monochrom}
    sales.x((d)-> d.time).y((d)-> d.value)
    sales.drawLine seriesData
  
    lines = chart.find('path.line')
    expect(lines).have.length 4
    for line, idx in lines
      expect($(line).attr('stroke')).to.be.eql monochrom[idx]
      
  it 'custom color of each serie', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Chart chart
    sales.x((d)-> d.time).y((d)-> d.value)
    for serie, idx in seriesData
      serie.opt =
        color: monochrom[idx]
    sales.drawLine seriesData

    lines = chart.find('path.line')
    expect(lines).have.length 4
    for line, idx in lines
      expect($(line).attr('stroke')).to.be.eql monochrom[idx]

