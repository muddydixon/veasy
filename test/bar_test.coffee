describe 'bar chart', ->
  baseid = 'bar'
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
      tooltip:
        format: (d)->
          d.value
    sales.x((d)-> d.label).y((d)-> d.value).legend('vsw')
    sales.drawBar pointData

    expect(chart.find('rect.bar')).have.length 40
    for d, idx in pointData
      expect(chart.find("rect.bar.serie-#{idx}")).have.length 10

  it 'error uncorresponding accessor', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    sales.x((d)-> d.x).y((d)-> d.y)
    expect(()->
      sales.drawBar pointData
    ).throw(Error)

  it 'transpose serie', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      transpose: true, margin: [100, 30], ylim: [0, 1500]
      width: 500, height: 600
    sales.x((d)-> d.label).y((d)-> d.value)
    sales.drawBar pointData

    expect(chart.find('rect.bar')).have.length 40
    for d, idx in pointData
      expect(chart.find("rect.bar.serie-#{idx}")).have.length 10

  it 'transpose serie with axis title', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      transpose: true, margin: [100, 50], ylim: [0, 1500]
      width: 500, height: 600
      axis:
        x: title: "X軸です"
        y: title: "Y軸です"
    sales.x((d)-> d.label).y((d)-> d.value)
    sales.drawBar pointData

    expect(chart.find('rect.bar')).have.length 40
    for d, idx in pointData
      expect(chart.find("rect.bar.serie-#{idx}")).have.length 10

  it 'custom color', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart
    sales.color((d, idx, sid)-> monochrom[sid]).x((d)-> d.label).y((d)-> d.value)
    sales.drawBar pointData

    bars = chart.find('rect.bar')
    expect(bars).have.length 40
    for dat, idx in pointData
      expect(chart.find("rect.bar.serie-#{idx}")).have.length 10
      for bar in chart.find("rect.bar.serie-#{idx}")
        expect($(bar).attr('fill')).to.be.eql monochrom[idx]

  it 'custom color of each serie', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      axis:
        x:
          title: "僕のX軸"
        y:
          title: "あなたのy軸"
    sales.x((d)-> d.label).y((d)-> d.value).legend('vsw')
    for serie, idx in pointData
      serie.opt =
        color: monochrom[idx]
    sales.drawBar pointData

    bars = chart.find('rect.bar')
    expect(bars).have.length 40
    for dat, idx in pointData
      expect(chart.find("rect.bar.serie-#{idx}")).have.length 10
      for bar in chart.find("rect.bar.serie-#{idx}")
        expect($(bar).attr('fill')).to.be.eql monochrom[idx]
