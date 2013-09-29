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
    lineChart = $('<div>', {class: "pane", id: id})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  afterEach ->
    lineChart.remove?()

  it 'width option', ->
    sales = new Veasy lineChart, {width: 400}

    svg = $("##{id}").find('svg')
    expect(+svg.attr('width')).to.be.eql 400
    expect(+svg.attr('height')).to.be.eql 300

  it 'height option', ->
    sales = new Veasy lineChart, {height: 200}

    svg = $("##{id}").find('svg')
    expect(+svg.attr('width')).to.be.eql $("##{id}").width()
    expect(+svg.attr('height')).to.be.eql 200

  it 'accessor', ->
    sales = new Veasy lineChart, {height: 200}
    sales.x((d)-> d.x)
    expect(sales.x().toString()).to.be.eql ((d)-> d.x).toString()

    sales.y((d)-> d.y)
    expect(sales.y().toString()).to.be.eql ((d)-> d.y).toString()

    sales.color((d)-> d.color)
    expect(sales.color().toString()).to.be.eql ((d)-> d.color).toString()
