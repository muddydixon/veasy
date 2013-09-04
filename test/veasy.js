var expect;

mocha.setup("bdd");

expect = chai.expect;

describe('bar chart', function() {
  var baseid, id, monochrom, pointData;
  baseid = 'bar';
  id = 0;
  pointData = [0, 1, 2, 3].map(function(id) {
    return {
      name: "series " + id,
      data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(i) {
        return {
          label: "category" + i,
          value: 0 | 300 + Math.random() * 700
        };
      })
    };
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    this.__id__ = id++;
    return $('<div>', {
      id: "" + baseid + "_" + this.__id__
    }).appendTo($('body'));
  });
  it('basically point', function() {
    var chart, d, idx, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      tooltip: {
        format: function(d) {
          return d.value;
        }
      }
    });
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    sales.drawBar(pointData);
    expect(chart.find('rect.bar')).have.length(40);
    _results = [];
    for (idx = _i = 0, _len = pointData.length; _i < _len; idx = ++_i) {
      d = pointData[idx];
      _results.push(expect(chart.find("rect.bar.serie-" + idx)).have.length(10));
    }
    return _results;
  });
  it('error uncorresponding accessor', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    });
    return expect(function() {
      return sales.drawBar(pointData);
    })["throw"](Error);
  });
  it('transpose serie', function() {
    var chart, d, idx, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      transpose: true,
      margin: [100, 30],
      ylim: [0, 1500],
      width: 500,
      height: 600
    });
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    sales.drawBar(pointData);
    expect(chart.find('rect.bar')).have.length(40);
    _results = [];
    for (idx = _i = 0, _len = pointData.length; _i < _len; idx = ++_i) {
      d = pointData[idx];
      _results.push(expect(chart.find("rect.bar.serie-" + idx)).have.length(10));
    }
    return _results;
  });
  it('custom color', function() {
    var bar, bars, chart, dat, idx, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.color(function(d, idx, sid) {
      return monochrom[sid];
    }).x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    sales.drawBar(pointData);
    bars = chart.find('rect.bar');
    expect(bars).have.length(40);
    _results = [];
    for (idx = _i = 0, _len = pointData.length; _i < _len; idx = ++_i) {
      dat = pointData[idx];
      expect(chart.find("rect.bar.serie-" + idx)).have.length(10);
      _results.push((function() {
        var _j, _len1, _ref, _results1;
        _ref = chart.find("rect.bar.serie-" + idx);
        _results1 = [];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          bar = _ref[_j];
          _results1.push(expect($(bar).attr('fill')).to.be.eql(monochrom[idx]));
        }
        return _results1;
      })());
    }
    return _results;
  });
  return it('custom color of each serie', function() {
    var bar, bars, chart, dat, idx, sales, serie, _i, _j, _len, _len1, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    for (idx = _i = 0, _len = pointData.length; _i < _len; idx = ++_i) {
      serie = pointData[idx];
      serie.opt = {
        color: monochrom[idx]
      };
    }
    sales.drawBar(pointData);
    bars = chart.find('rect.bar');
    expect(bars).have.length(40);
    _results = [];
    for (idx = _j = 0, _len1 = pointData.length; _j < _len1; idx = ++_j) {
      dat = pointData[idx];
      expect(chart.find("rect.bar.serie-" + idx)).have.length(10);
      _results.push((function() {
        var _k, _len2, _ref, _results1;
        _ref = chart.find("rect.bar.serie-" + idx);
        _results1 = [];
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          bar = _ref[_k];
          _results1.push(expect($(bar).attr('fill')).to.be.eql(monochrom[idx]));
        }
        return _results1;
      })());
    }
    return _results;
  });
});

describe('chart', function() {
  var id, lineChart, monochrom, seriesData;
  id = 'line';
  lineChart = null;
  seriesData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          time: new Date(2013, 0, i),
          value: 0 | Math.random() * 1000
        };
      })
    };
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    return lineChart = $('<div>', {
      id: id
    }).appendTo($('body'));
  });
  afterEach(function() {
    return typeof lineChart.remove === "function" ? lineChart.remove() : void 0;
  });
  it('width option', function() {
    var sales, svg;
    sales = new Veasy(lineChart, {
      width: 400
    });
    svg = $("#" + id).find('svg');
    expect(+svg.attr('width')).to.be.eql(400);
    return expect(+svg.attr('height')).to.be.eql(300);
  });
  it('height option', function() {
    var sales, svg;
    sales = new Veasy(lineChart, {
      height: 200
    });
    svg = $("#" + id).find('svg');
    expect(+svg.attr('width')).to.be.eql($("#" + id).width());
    return expect(+svg.attr('height')).to.be.eql(200);
  });
  return it('accessor', function() {
    var sales;
    sales = new Veasy(lineChart, {
      height: 200
    });
    sales.x(function(d) {
      return d.x;
    });
    expect(sales.x().toString()).to.be.eql((function(d) {
      return d.x;
    }).toString());
    sales.y(function(d) {
      return d.y;
    });
    expect(sales.y().toString()).to.be.eql((function(d) {
      return d.y;
    }).toString());
    sales.color(function(d) {
      return d.color;
    });
    return expect(sales.color().toString()).to.be.eql((function(d) {
      return d.color;
    }).toString());
  });
});

describe('flow chart', function() {
  var baseid, fromNodes, id, links, monochrom, toNodes;
  baseid = 'flow';
  id = 0;
  fromNodes = [0, 1, 2, 3].map(function(i) {
    return {
      name: "node " + i,
      id: i
    };
  });
  toNodes = [0, 1, 2, 3].map(function(i) {
    return {
      name: "node " + (fromNodes.length + i),
      id: fromNodes.length + i
    };
  });
  links = [];
  fromNodes.map(function(fromNode, fromIdx) {
    return toNodes.map(function(toNode, toIdx) {
      return links.push({
        source: fromNode.id,
        target: toNode.id,
        value: 0 | Math.random() * 1000
      });
    });
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    this.__id__ = id++;
    return $('<div>', {
      id: "" + baseid + "_" + this.__id__
    }).appendTo($('body'));
  });
  it('basically data', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      width: 500
    });
    return sales.drawFlow({
      nodes: fromNodes.concat(toNodes),
      links: links
    });
  });
  return it('basically data', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      width: 500,
      tooltip: {
        gravity: 'w',
        format: function(d) {
          return "" + d.name;
        }
      }
    });
    return sales.drawFlow({
      nodes: fromNodes.concat(toNodes),
      links: links
    });
  });
});

describe('line chart', function() {
  var baseid, id, monochrom, pointData, seriesData;
  baseid = 'line';
  id = 0;
  seriesData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          time: new Date(2013, 0, i),
          value: 0 | Math.random() * 1000
        };
      })
    };
  });
  pointData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          x: 0 | Math.random() * 1000,
          y: 0 | Math.random() * 1000
        };
      })
    };
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    this.__id__ = id++;
    return $('<div>', {
      id: "" + baseid + "_" + this.__id__
    }).appendTo($('body'));
  });
  it('basically series', function() {
    var chart, idx, line, lines, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    });
    sales.drawLine(seriesData);
    lines = chart.find('path.line');
    expect(lines).have.length(4);
    _results = [];
    for (idx = _i = 0, _len = lines.length; _i < _len; idx = ++_i) {
      line = lines[idx];
      _results.push(expect($(line).attr('d')).not.contain("NaN"));
    }
    return _results;
  });
  it('basically point data', function() {
    var chart, idx, line, lines, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      sort: function(a, b) {
        return a.x - b.x;
      },
      tooltip: {
        format: function(d) {
          return "x = " + d.x;
        }
      }
    });
    sales.x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    });
    sales.drawLine(pointData);
    lines = chart.find('path.line');
    expect(lines).have.length(4);
    _results = [];
    for (idx = _i = 0, _len = lines.length; _i < _len; idx = ++_i) {
      line = lines[idx];
      _results.push(expect($(line).attr('d')).not.contain("NaN"));
    }
    return _results;
  });
  it('basically point　data with point', function() {
    var chart, idx, line, lines, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      sort: function(a, b) {
        return a.x - b.x;
      },
      withPoint: true,
      tooltip: {
        format: function(d) {
          return "x = " + d.x;
        }
      }
    });
    sales.x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    });
    sales.drawLine(pointData);
    lines = chart.find('path.line');
    expect(lines).have.length(4);
    _results = [];
    for (idx = _i = 0, _len = lines.length; _i < _len; idx = ++_i) {
      line = lines[idx];
      _results.push(expect($(line).attr('d')).not.contain("NaN"));
    }
    return _results;
  });
  it('error uncorresponding accessor', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    });
    return expect(function() {
      return sales.drawLine(seriesData);
    })["throw"](Error);
  });
  it('custom color', function() {
    var chart, idx, line, lines, sales, _i, _len, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).color(function(d, idx, sid) {
      return monochrom[sid];
    });
    sales.drawLine(seriesData);
    lines = chart.find('path.line');
    expect(lines).have.length(4);
    _results = [];
    for (idx = _i = 0, _len = lines.length; _i < _len; idx = ++_i) {
      line = lines[idx];
      _results.push(expect($(line).attr('stroke')).to.be.eql(monochrom[idx]));
    }
    return _results;
  });
  return it('custom color of each serie', function() {
    var chart, idx, line, lines, sales, serie, _i, _j, _len, _len1, _results;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    });
    for (idx = _i = 0, _len = seriesData.length; _i < _len; idx = ++_i) {
      serie = seriesData[idx];
      serie.opt = {
        color: monochrom[idx]
      };
    }
    sales.drawLine(seriesData);
    lines = chart.find('path.line');
    expect(lines).have.length(4);
    _results = [];
    for (idx = _j = 0, _len1 = lines.length; _j < _len1; idx = ++_j) {
      line = lines[idx];
      _results.push(expect($(line).attr('stroke')).to.be.eql(monochrom[idx]));
    }
    return _results;
  });
});

describe('multiple chart', function() {
  var baseid, id, monochrom, pointData, seriesData;
  baseid = 'multi';
  id = 0;
  seriesData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          time: new Date(2013, 0, i),
          value: 0 | Math.random() * 1000
        };
      })
    };
  });
  pointData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          x: 0 | Math.random() * 1000,
          y: 0 | Math.random() * 1000
        };
      })
    };
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    this.__id__ = id++;
    return $('<div>', {
      id: "" + baseid + "_" + this.__id__
    }).appendTo($('body'));
  });
  return it('multiple series', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      height: 800,
      margin: [50, 300]
    });
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    });
    sales.drawBar(seriesData);
    return sales.drawScatterPlot(seriesData);
  });
});

describe('option', function() {
  var base, src1, src2;
  base = {
    a: 1,
    b: 2,
    c: 3
  };
  src1 = {
    a: 11,
    b: 12
  };
  src2 = {
    a: 21,
    d: 24
  };
  it('one option', function() {
    var opt;
    opt = new Veasy.Option(base);
    expect(opt).have.property('a', 1);
    expect(opt).have.property('b', 2);
    return expect(opt).have.property('c', 3);
  });
  it('two option', function() {
    var opt;
    opt = new Veasy.Option(base, src1);
    expect(opt).have.property('a', 11);
    expect(opt).have.property('b', 12);
    return expect(opt).have.property('c', 3);
  });
  return it('more option', function() {
    var opt;
    opt = new Veasy.Option(base, src1, src2);
    expect(opt).have.property('a', 21);
    expect(opt).have.property('b', 12);
    expect(opt).have.property('c', 3);
    return expect(opt).have.property('d', 24);
  });
});

describe('pie chart', function() {
  var baseid, id, monochrom, pointData;
  baseid = 'pie';
  id = 0;
  pointData = [0, 1, 2, 3].map(function(id) {
    var _i, _ref, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (var _i = 0, _ref = 6 + id; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          label: "category" + i,
          value: 0 | 300 + Math.random() * 700
        };
      })
    };
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    this.__id__ = id++;
    return $('<div>', {
      id: "" + baseid + "_" + this.__id__
    }).appendTo($('body'));
  });
  it('basically point', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      tooltip: {
        format: function(d, id) {
          return "" + d.label;
        }
      }
    });
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    return sales.drawPie(pointData);
  });
  it('basically point with margin', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      innerMargin: 20,
      tooltip: {
        gravity: "w",
        format: function(d, id) {
          return "label = " + d.label;
        }
      }
    });
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    }).color(function(d, idx) {
      return monochrom[idx];
    });
    return sales.drawPie(pointData.slice(0, 3));
  });
  it('basically point with margin', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      innerMargin: 120
    });
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    return sales.drawPie(pointData.slice(0, 3));
  });
  return it('error uncorresponding accessor', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    sales.x(function(d) {
      return d.zz;
    }).y(function(d) {
      return d.y;
    });
    return expect(function() {
      return sales.drawPie(pointData);
    })["throw"](Error);
  });
});

describe('scatter plot', function() {
  var baseid, id, monochrom, pointData, seriesData;
  baseid = 'scatter';
  id = 0;
  seriesData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          time: new Date(2013, 0, i),
          value: 0 | Math.random() * 500 + 500,
          sales: 0 | Math.random() * 1000,
          cost: 0 | Math.random() * 100,
          country: 0 | Math.random() * 7
        };
      })
    };
  });
  pointData = [0, 1, 2, 3].map(function(id) {
    var _i, _results;
    return {
      name: "series " + id,
      data: (function() {
        _results = [];
        for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(i) {
        return {
          x: 0 | Math.random() * 1000,
          y: 0 | Math.random() * 1000
        };
      })
    };
  });
  monochrom = ["#000", "#333", "#666", "#999", "#CCC"];
  beforeEach(function() {
    this.__id__ = id++;
    return $('<div>', {
      id: "" + baseid + "_" + this.__id__
    }).appendTo($('body'));
  });
  it('basically series', function() {
    var chart, color, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    });
    return sales.drawScatterPlot(seriesData);
  });
  it('basically series color accessor', function() {
    var chart, color, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).color(function(d, idx) {
      return color(d.sales);
    });
    return sales.drawScatterPlot(seriesData);
  });
  it('basically series color accessor, size accessor', function() {
    var chart, color, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).color(function(d, idx) {
      return color(d.sales);
    }).size(function(d) {
      return d.cost;
    });
    return sales.drawScatterPlot(seriesData);
  });
  it('basically series size accessor', function() {
    var chart, color, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).size(function(d) {
      return 0 | d.cost;
    });
    return sales.drawScatterPlot(seriesData);
  });
  it('basically series symbol accessor', function() {
    var chart, color, sales, symbol;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    symbol = d3.svg.symbolTypes;
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).size(function(d) {
      return 0 | d.cost;
    }).symbol(function(d, idx, sid) {
      return symbol[sid % 7];
    });
    return sales.drawScatterPlot(seriesData);
  });
  it('basically series symbol accessor', function() {
    var chart, color, sales, symbol;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart);
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    symbol = d3.svg.symbolTypes;
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).size(function(d) {
      return 0 | d.cost;
    }).color(function(d, idx, sid) {
      return color(d.sales);
    }).symbol(function(d, idx, sid) {
      return symbol[sid % 7];
    });
    return sales.drawScatterPlot(seriesData);
  });
  return it('basically series symbol accessor', function() {
    var chart, color, sales, symbol;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      tooltip: {
        format: function(d, idx) {
          return "sales: " + d.sales;
        }
      }
    });
    color = d3.scale.linear().domain([0, 1000]).range(["red", "blue"]);
    symbol = d3.svg.symbolTypes;
    sales.x(function(d) {
      return d.time;
    }).y(function(d) {
      return d.value;
    }).size(function(d) {
      return d.sales / 5;
    }).color(function(d, idx, sid) {
      return color(d.sales);
    });
    return sales.drawScatterPlot(seriesData);
  });
});

mocha.run();
