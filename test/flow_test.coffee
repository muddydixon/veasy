describe 'flow chart', ->
  baseid = 'flow'
  id = 0
  
  fromNodes = [0..3].map (i)->
    name: "node #{i}"
    id: i
  toNodes = [0..3].map (i)->
    name: "node #{fromNodes.length + i}"
    id: fromNodes.length + i
  links = []
  fromNodes.map (fromNode, fromIdx)->
    toNodes.map (toNode, toIdx)->
      links.push 
        source: fromNode.id
        target: toNode.id
        value: 0|Math.random() * 1000

  monochrom = ["#000", "#333", "#666", "#999", "#CCC"]
    
  beforeEach ->
    this.__id__ = id++
    $('<div>', {id: "#{baseid}_#{this.__id__}"}).appendTo $('body')
  # afterEach ->
  #   $("##{baseid}_#{this.__id__}").remove?()
  #

  it 'basically data', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart, {width: 500}
    sales.drawFlow {nodes: fromNodes.concat(toNodes), links: links}

  it 'basically data', ->
    chart = $("##{baseid}_#{this.__id__}")
    sales = new Veasy chart,
      width: 500
      tooltip:
        gravity: 'w'
        format: (d)->
          "#{d.name}"
    sales.drawFlow {nodes: fromNodes.concat(toNodes), links: links}

