baseid = 'line'
id = 0

seriesData = [0..3].map (id)->
  name: "series #{id}"
  data: [0..100].map (i)->
    time: new Date(2013, 0, i)
    value: 0|Math.random() * 1000
pointData = [0..3].map (id)->
  data = [0..100].map((i)->
    x: 0|Math.random() * 1000
    y: 0|Math.random() * 1000)
  name: "series #{id}"
  data: data.sort((a, b)-> a.x - b.x)
monochrom = ["#000", "#333", "#666", "#999", "#CCC"]

describe 'Line Chart', ->
  beforeEach ->
    this.__id__ = id++
    $('<div>', {class: "pane", id: "#{baseid}_#{this.__id__}"})
      .append($('<h1>').text("#{this.test.parent.title}/#{this.__id__}")).appendTo $('body')
  afterEach ->
    $("##{baseid}_#{this.__id__}").remove?()

  describe 'Basic Graph', ->
    it 'Sequential Data', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.time).y((d)-> d.value)
      sales.drawLine seriesData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"

    it 'Point Data', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"

  describe 'with Legend', ->
    it 'Position Bottom Right', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.x).y((d)-> d.y).legend('se')
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
      expect(chart.find('g.legend')).have.length 1

    it 'Position Upper Left', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.x).y((d)-> d.y).legend('nw')
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
      expect(chart.find('g.legend')).have.length 1

  describe 'with Axis Format', ->
    it 'custom format', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        axis:
          x:
            tickFormat: (d)-> d + "グラム"
          y:
            tickFormat: (d)-> d + "円"
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
      for text in chart.find(".xaxis .tick text")
        expect($(text).text()).to.have.string 'グラム'
      for text in chart.find(".yaxis .tick text")
        expect($(text).text()).to.have.string '円'

  describe 'with Axis Label', ->
    it 'Both Axis', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        axis:
          x:
            title: "X axis"
          y:
            title: "Y axis"
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
      expect(chart.find('.xaxis text.title')).have.length 1
      expect(chart.find('.yaxis text.title')).have.length 1

    it 'X Axis Only', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        axis:
          x:
            title: "X Axis"
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
      expect(chart.find('.xaxis text.title')).have.length 1

    it 'Y Axis Only', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        axis:
          y:
            title: "Y Axis"
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
      expect(chart.find('.yaxis text.title')).have.length 1

  describe 'with Point', ->
    it 'radius 3px', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        withPoint:
          size: 3
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"

    it 'radius 5px', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        withPoint:
          size: 5
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"

  describe 'with Tooltip', ->
    it 'specify Format', (next)->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        tooltip:
          format: (d)-> JSON.stringify d
      sales.x((d)-> d.x).y((d)-> d.y)
      sales.drawLine pointData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"

      expect($('div.tipsy')).have.length 0
      (target = chart.find('circle.serie-3').first()).trigger('mouseover')
      expect($('div.tipsy')).have.length 1
      target.trigger('mouseout')
      setTimeout ()->
        expect($('div.tipsy')).have.length 0
        next()
      , 300

  describe 'Error', ->
    it 'error uncorresponding accessor', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.x).y((d)-> d.y)

      expect(()->
        sales.drawLine seriesData
      ).throw(Error)

  describe 'Color Accessor', ->
    it 'custom color', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.time).y((d)-> d.value).color((d, idx, sid)-> monochrom[sid])
      sales.drawLine seriesData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('stroke')).to.be.eql monochrom[idx]

    it 'custom color of each serie', ->
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart
      sales.x((d)-> d.time).y((d)-> d.value)
      for serie, idx in seriesData
        serie.opt =
          color: monochrom[idx]
      sales.drawLine seriesData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('stroke')).to.be.eql monochrom[idx]

    it 'with xaxis format', ->
      ymd = d3.time.format('%y/%m/%d')
      chart = $("##{baseid}_#{this.__id__}")
      sales = new Veasy chart,
        axis:
          x:
            format: (d)->
              ymd(d)
          y:
            format: (d)->
              "#{d}円"

      sales.x((d)-> d.time).y((d)-> d.value)
      sales.drawLine seriesData

      lines = chart.find('path.line')
      expect(lines).have.length 4
      for line, idx in lines
        expect($(line).attr('d')).not.contain "NaN"
