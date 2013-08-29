describe 'chart', ->
  id = 'line'
  lineChart = null
  seriesData = [0..3].map (id)->
    name: "series #{id}"
    data: [0..100].map (i)->
      time: new Date(2013, 0, i)
      value: 0|Math.random() * 1000
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]
    
  beforeEach ->
    lineChart = $('<div>', {id: id}).appendTo $('body')
  afterEach ->
    lineChart.remove?()
    
  it 'width option', ->
    sales = new Chart lineChart, {width: 400}

    svg = $("##{id}").find('svg')
    expect(+svg.attr('width')).to.be.eql 400
    expect(+svg.attr('height')).to.be.eql 300
    
  it 'height option', ->
    sales = new Chart lineChart, {height: 200}

    svg = $("##{id}").find('svg')
    expect(+svg.attr('width')).to.be.eql $("##{id}").width()
    expect(+svg.attr('height')).to.be.eql 200
    
