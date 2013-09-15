var AccessorError, Option, Veasy, getAxis,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof d3 === "undefined" || d3 === null) {
  throw new Error('veasy require d3.\nwrite <script src="//d3js.org/d3.v3.min.js" charset="utf-8"></script>"');
}

if (!($ || jQuery)) {
  throw new Error('veasy require jquery.\nwrite <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" charset="utf-8"></script>"');
}

Veasy = (function() {
  function Veasy($target, opt) {
    this.$target = $target;
    this.opt = opt != null ? opt : {};
    this.id = "" + (Date.now()) + "-" + ($('svg').length);
    if (!($target instanceof jQuery)) {
      this.$target = $(this.$target);
    }
    this.$target.attr('height', this.opt.height);
    this.margin = this.parseMargin(this.opt.margin || 50);
    this.width = (this.opt.width || this.$target.width() || 400) - this.margin.width;
    this.height = (this.opt.height || 300) - this.margin.height;
    this._x = null;
    this._y = null;
    this._symbol = null;
    this._size = null;
    this._value = null;
    this._color = null;
    this._dir = null;
    this._texture = null;
    this._legend = null;
    this.xDefault = this.opt.xDefault;
    this.yDefault = this.opt.yDefault;
    this.svg = d3.select(this.$target.get(0)).select('svg');
    if (this.svg[0][0] == null) {
      this.svg = d3.select(this.$target.get(0)).append('svg').attr('id', this.id).attr('width', this.width + this.margin.width).attr('height', this.height + this.margin.height).append('g').attr('width', this.width).attr('height', this.height).attr('transform', "translate(" + this.margin.left + ", " + this.margin.top + ")");
    }
  }

  Veasy.prototype.parseMargin = function(margin) {
    var margins;
    margins = null;
    if (typeof margin === 'number') {
      margins = {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin
      };
    } else if (margin instanceof Array) {
      if (margin.length === 1) {
        margins = {
          top: margin[0],
          right: margin[0],
          bottom: margin[0],
          left: margin[0]
        };
      } else if (margin.length === 2) {
        margins = {
          top: margin[0],
          right: margin[1],
          bottom: margin[0],
          left: margin[1]
        };
      } else if (margin.length === 3) {
        margins = {
          top: margin[0],
          right: margin[1],
          bottom: margin[2],
          left: margin[1]
        };
      } else {
        margins = {
          top: margin[0],
          right: margin[1],
          bottom: margin[3],
          left: margin[3]
        };
      }
    } else if (typeof margin === 'object') {
      if (typeof margin.top === 'number' && typeof margin.right === 'number' && typeof margin.bottom === 'number' && typeof margin.left === 'number') {
        margins = margin;
      }
    }
    if (margins == null) {
      throw new Error("margin require number or [number]");
    }
    margins.width = margins.left + margins.right;
    margins.height = margins.top + margins.bottom;
    return margins;
  };

  Veasy.prototype.x = function(x) {
    if (x == null) {
      return this._x;
    }
    this._x = x;
    return this;
  };

  Veasy.prototype.y = function(y) {
    if (y == null) {
      return this._y;
    }
    if (y instanceof Array) {
      this._y = y[0];
      this._ys = y;
    } else {
      this._y = y;
    }
    return this;
  };

  Veasy.prototype.t = function(t) {
    if (t == null) {
      return this._t;
    }
    this._t = t;
    return this;
  };

  Veasy.prototype.color = function(color) {
    if (color == null) {
      return this._color;
    }
    if (typeof color === 'function') {
      this._color = color;
    } else {
      this._color = function() {
        return color;
      };
    }
    return this;
  };

  Veasy.prototype.size = function(size) {
    if (size == null) {
      return this._size;
    }
    if (typeof size === 'function') {
      this._size = size;
    } else {
      this._size = function() {
        return size;
      };
    }
    return this;
  };

  Veasy.prototype.symbol = function(symbol) {
    if (symbol == null) {
      return this._symbol;
    }
    if (typeof symbol === 'function') {
      this._symbol = symbol;
    } else {
      this._symbol = function() {
        return symbol;
      };
    }
    return this;
  };

  Veasy.prototype.legend = function(position) {
    this._legend = {
      position: position
    };
    return this;
  };

  Veasy.prototype.appendLegend = function(series, color) {
    var $list, category10, cols, height, left, legend, list, padding, rect, rows, theight, top, twidth, width, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
      _this = this;
    if (!((series != null) && series.length > 0)) {
      return;
    }
    if (this._legend == null) {
      return;
    }
    category10 = d3.scale.category10();
    if (color == null) {
      if (this._color) {
        color = function(serie, sid) {
          var err;
          try {
            return _this._color(null, null, sid);
          } catch (_error) {
            err = _error;
            return 'grey';
          }
        };
      } else {
        color = function(serie, sid) {
          var _ref;
          return ((_ref = serie.opt) != null ? _ref.color : void 0) || category10(sid);
        };
      }
    }
    legend = this.svg.append('g').attr('class', 'legend');
    rect = legend.append('rect').attr('fill', 'white').attr('stroke', 'grey').style('opacity', 0.9);
    list = legend.selectAll('text').data(series).enter().append('text').text(function(d, sid) {
      if (_this._symbol != null) {
        return "" + (_this._symbol(null, null, sid)) + " " + d.name;
      } else {
        return d.name;
      }
    }).attr('stroke', color);
    $list = this.$target.find('svg g g.legend text');
    twidth = d3.max($list, function(d) {
      return $(d).width();
    });
    theight = d3.max($list, function(d) {
      return $(d).height();
    });
    padding = theight * 0.2;
    if ((_ref = this._legend.position) != null ? _ref.match('v') : void 0) {
      list.attr('dy', function(d, idx) {
        return theight + idx * (theight + padding);
      }).attr('dx', padding * 2);
      width = twidth + padding * 4;
      height = (theight + padding) * $list.length + padding * 2;
    } else if (rows = (_ref1 = this._legend.position) != null ? _ref1.match(/(\d+)x/) : void 0) {
      rows = rows[1];
      list.attr('dy', function(d, idx) {
        return theight + (theight + padding) * (0 | idx / rows);
      }).attr('dx', function(d, idx) {
        return padding * 2 + (twidth + padding) * (idx % rows);
      });
      width = (twidth + padding) * rows + padding * 4;
      height = (theight + padding) * (0 | $list.length / rows + 0.9) + padding * 2;
    } else if (cols = (_ref2 = this._legend.position) != null ? _ref2.match(/x(\d+)/) : void 0) {
      cols = cols[1];
      list.attr('dy', function(d, idx) {
        return theight + (theight + padding) * (idx % cols);
      }).attr('dx', function(d, idx) {
        return padding * 2 + (twidth + padding) * (0 | idx / cols);
      });
      width = (twidth + padding) * (0 | $list.length / cols + 0.9) + padding * 4;
      height = (theight + padding) * cols + padding * 2;
    } else {
      list.attr('dy', theight).attr('dx', function(d, idx) {
        return idx * (twidth + padding) + padding * 2;
      });
      width = (twidth + padding) * $list.length + padding * 4;
      height = theight + padding * 2;
    }
    rect.attr('width', width).attr('height', height);
    left = (this.width - width) / 2;
    top = (this.height - height) / 2;
    if ((_ref3 = this._legend.position) != null ? _ref3.match('n') : void 0) {
      top = 20;
    }
    if ((_ref4 = this._legend.position) != null ? _ref4.match('w') : void 0) {
      left = 20;
    }
    if ((_ref5 = this._legend.position) != null ? _ref5.match('s') : void 0) {
      top = this.height - height - 20;
    }
    if ((_ref6 = this._legend.position) != null ? _ref6.match('e') : void 0) {
      left = this.width - width - 20;
    }
    legend.attr('transform', "translate(" + left + ", " + top + ")");
    legend.on('mouseover', function(d) {
      return d3.select(this).style('opacity', 0.3);
    });
    return legend.on('mouseout', function(d) {
      return d3.select(this).style('opacity', 0.9);
    });
  };

  Veasy.prototype.getMergedSeries = function(series) {
    var merged, serie, _i, _len;
    merged = [];
    for (_i = 0, _len = series.length; _i < _len; _i++) {
      serie = series[_i];
      merged = merged.concat(serie.data);
    }
    return merged;
  };

  Veasy.prototype.isValidPositionAccessor = function(data) {
    if (!this._x) {
      return this.errorHandler(new Error("accessor x required"));
    }
    if (!this._y) {
      return this.errorHandler(new Error("accessor y required"));
    }
    if (typeof this._x(data) === 'undefined') {
      return this.errorHandler(new AccessorError(this._x, this._y, data));
    }
    if (typeof this._y(data) === 'undefined') {
      return this.errorHandler(new AccessorError(this._x, this._y, data));
    }
  };

  Veasy.prototype.inhibitOther = function(selector, opacity) {
    var svg;
    if (opacity == null) {
      opacity = 0.6;
    }
    svg = this.svg;
    return function(d) {
      svg.selectAll(selector).style('opacity', opacity);
      return d3.select(this).style('opacity', 1.0);
    };
  };

  Veasy.prototype.clearInhibit = function(selector) {
    var svg;
    svg = this.svg;
    return function(d) {
      return svg.selectAll(selector).style('opacity', 1.0);
    };
  };

  Veasy.prototype.errorHandler = function(err) {
    this.svg.append('text').attr('x', this.width / 2).attr('y', this.height / 2).text(this.opt.failMessage || "oops! draw chart fail...");
    throw err;
  };

  Veasy.prototype.drawLine = function(series, opt) {
    var allXrange, allYrange, category10, err, height, line, mergedSeries, tickLabel, tickWidth, tooltipFormat, width, x, xAxis, xScale, xTitle, xType, xaxis, y, yAxis, yScale, yTitle, yType, yaxis, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    if (err = this.isValidPositionAccessor(mergedSeries[0])) {
      return err;
    }
    opt = new Option(this.opt, opt);
    allXrange = d3.extent(mergedSeries, this._x);
    allYrange = d3.extent(mergedSeries, this._y);
    xType = this._x(mergedSeries[0]).constructor;
    yType = Number;
    xScale = opt.xscale || "linear";
    yScale = opt.yscale || "linear";
    this.xScale = x = xType.name === 'Date' ? d3.time.scale() : d3.scale[xScale]();
    x.domain(opt.xlim || d3.extent(allXrange)).range([0, this.width]);
    this.yScale = y = d3.scale[yScale]();
    y.domain(opt.ylim || d3.extent(allYrange)).range([this.height, 0]);
    line = d3.svg.line().x(function(d) {
      return x(_this._x(d));
    }).y(function(d) {
      return y(_this._y(d));
    });
    category10 = d3.scale.category10();
    series.forEach(function(serie, sid) {
      var color, dot, l, sort, _ref, _ref1;
      if (_this._color) {
        color = function(d, idx) {
          return _this._color(null, idx, sid);
        };
      } else if (((_ref = serie.opt) != null ? _ref.color : void 0) != null) {
        color = function(d, idx) {
          return serie.opt.color;
        };
      } else {
        color = function(d, idx) {
          return category10(sid);
        };
      }
      l = _this.svg.append("path").attr('class', "line serie-" + sid).datum((sort = opt.sort) ? serie.data.sort(sort) : serie.data).attr("d", line).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).style("cursor", 'pointer').on('mouseover', _this.inhibitOther('path.line', 0.2)).on('touchstart', _this.inhibitOther('path.line', 0.2)).on('mouseout', _this.clearInhibit('path.line')).on('touchend', _this.clearInhibit('path.line'));
      dot = _this.svg.selectAll("circle.serie-" + sid).data(serie.data).enter().append('circle').attr('class', "serie-" + sid).attr('cx', function(d) {
        return x(_this._x(d));
      }).attr('cy', function(d) {
        return y(_this._y(d));
      }).attr('r', ((_ref1 = _this.opt.withPoint) != null ? _ref1.size : void 0) || 2).attr('fill', color).attr('stroke', 'none').attr('stroke-width', 3).style('cursor', 'pointer');
      if (_this.opt.withPoint) {
        return dot.on('mouseover', function(d) {
          var dom, _ref2;
          dom = d3.select(d3.event.target);
          return dom.attr('r', ((_ref2 = _this.opt.withPoint) != null ? _ref2.size : void 0) + 3 || 4).attr('stroke', dom.attr('fill')).attr('fill', 'white');
        }).on('mouseout', function(d) {
          var dom, _ref2;
          dom = d3.select(d3.event.target);
          return dom.attr('r', ((_ref2 = _this.opt.withPoint) != null ? _ref2.size : void 0) || 2).attr('fill', dom.attr('stroke')).attr('stroke', 'none');
        });
      }
    });
    if (tooltipFormat = (_ref = this.opt.tooltip) != null ? _ref.format : void 0) {
      $("svg#" + this.id + " circle").tipsy({
        gravity: this.opt.tooltip.gravity || "s",
        html: true,
        title: function() {
          var d;
          d = this.__data__;
          return tooltipFormat(d);
        }
      });
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      xaxis = getAxis(x, new Option({}, (_ref1 = this.opt.axis) != null ? _ref1.x : void 0));
      yaxis = getAxis(y, new Option({
        orient: 'left'
      }, (_ref2 = this.opt.axis) != null ? _ref2.y : void 0));
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")");
      xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis);
      yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      if ((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.x) != null ? _ref4.title : void 0 : void 0) {
        xTitle = xAxis.append('text').attr('class', 'title').text((_ref5 = this.opt.axis) != null ? (_ref6 = _ref5.x) != null ? _ref6.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.xaxis text.title').width();
        height = this.$target.find('svg g.xaxis text.title').height();
        xTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
      }
      if ((_ref7 = this.opt.axis) != null ? (_ref8 = _ref7.y) != null ? _ref8.title : void 0 : void 0) {
        yTitle = yAxis.append('text').attr('class', 'title').text((_ref9 = this.opt.axis) != null ? (_ref10 = _ref9.y) != null ? _ref10.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.yaxis text.title').width();
        height = this.$target.find('svg g.yaxis text.title').height();
        tickLabel = this.$target.find('svg g.yaxis g.tick text');
        tickWidth = d3.max(tickLabel, function(d) {
          return $(d).width();
        });
        yTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
        yTitle.attr('transform', "rotate(-90)");
      }
    }
    return this.appendLegend(series);
  };

  Veasy.prototype.drawArea = function(series, opt) {
    var allXrange, allYrange, area, category10, err, height, mergedSeries, tickLabel, tickWidth, tooltipFormat, width, x, xAxis, xScale, xTitle, xType, xaxis, y, yAxis, yScale, yTitle, yType, yaxis, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    if (err = this.isValidPositionAccessor(mergedSeries[0])) {
      return err;
    }
    opt = new Option(this.opt, opt);
    allXrange = d3.extent(mergedSeries, this._x);
    allYrange = d3.extent(mergedSeries, this._y);
    xType = this._x(mergedSeries[0]).constructor;
    yType = Number;
    xScale = opt.xscale || "linear";
    yScale = opt.yscale || "linear";
    this.xScale = x = xType.name === 'Date' ? d3.time.scale() : d3.scale[xScale]();
    x.domain(opt.xlim || d3.extent(allXrange)).range([0, this.width]);
    this.yScale = y = d3.scale[yScale]();
    y.domain(opt.ylim || d3.extent(allYrange)).range([this.height, 0]);
    area = d3.svg.area().x(function(d) {
      return x(_this._x(d));
    }).y0(this.height).y1(function(d) {
      return y(_this._y(d));
    });
    category10 = d3.scale.category10();
    series.forEach(function(serie, sid) {
      var color, l, sort, _ref;
      if (_this._color) {
        color = function(d, idx) {
          return _this._color(null, idx, sid);
        };
      } else if (((_ref = serie.opt) != null ? _ref.color : void 0) != null) {
        color = function(d, idx) {
          return serie.opt.color;
        };
      } else {
        color = function(d, idx) {
          return category10(sid);
        };
      }
      return l = _this.svg.append("path").attr('class', "area serie-" + sid).datum((sort = opt.sort) ? serie.data.sort(sort) : serie.data).attr("d", area).attr("fill", color).attr("stroke", "none").style("cursor", 'pointer').on('mouseover', _this.inhibitOther('path.area', 0.2)).on('touchstart', _this.inhibitOther('path.area', 0.2)).on('mouseout', _this.clearInhibit('path.area')).on('touchend', _this.clearInhibit('path.area'));
    });
    if (tooltipFormat = (_ref = this.opt.tooltip) != null ? _ref.format : void 0) {
      $("svg#" + this.id + " circle").tipsy({
        gravity: this.opt.tooltip.gravity || "s",
        html: true,
        title: function() {
          var d;
          d = this.__data__;
          return tooltipFormat(d);
        }
      });
    }
    xaxis = getAxis(x, new Option({}, (_ref1 = this.opt.axis) != null ? _ref1.x : void 0));
    yaxis = getAxis(y, new Option({
      orient: 'left'
    }, (_ref2 = this.opt.axis) != null ? _ref2.y : void 0));
    if (!this.svg.select('g.xaxis')[0][0]) {
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")");
      xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis);
      yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      if ((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.x) != null ? _ref4.title : void 0 : void 0) {
        xTitle = xAxis.append('text').attr('class', 'title').text((_ref5 = this.opt.axis) != null ? (_ref6 = _ref5.x) != null ? _ref6.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.xaxis text.title').width();
        height = this.$target.find('svg g.xaxis text.title').height();
        xTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
      }
      if ((_ref7 = this.opt.axis) != null ? (_ref8 = _ref7.y) != null ? _ref8.title : void 0 : void 0) {
        yTitle = yAxis.append('text').attr('class', 'title').text((_ref9 = this.opt.axis) != null ? (_ref10 = _ref9.y) != null ? _ref10.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.yaxis text.title').width();
        height = this.$target.find('svg g.yaxis text.title').height();
        tickLabel = this.$target.find('svg g.yaxis g.tick text');
        tickWidth = d3.max(tickLabel, function(d) {
          return $(d).width();
        });
        yTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
        yTitle.attr('transform', "rotate(-90)");
      }
    }
    return this.appendLegend(series);
  };

  Veasy.prototype.drawStack = function(series, opt) {
    var allXrange, allYrange, area, category10, color, err, height, l, mergedSeries, rangeInEachX, stack, tickLabel, tickWidth, width, x, xAxis, xScale, xTitle, xType, xaxis, y, yAxis, yScale, yTitle, yType, yaxis, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    if (err = this.isValidPositionAccessor(mergedSeries[0])) {
      return err;
    }
    opt = new Option(this.opt, opt);
    allXrange = d3.extent(mergedSeries, this._x);
    allYrange = d3.extent(mergedSeries, this._y);
    rangeInEachX = d3.nest().key(this._x).rollup(function(vals) {
      return vals.reduce((function(p, c) {
        return p + _this._y(c);
      }), 0);
    }).entries(mergedSeries);
    xType = this._x(mergedSeries[0]).constructor;
    yType = Number;
    xScale = opt.xscale || "linear";
    yScale = opt.yscale || "linear";
    this.xScale = x = xType.name === 'Date' ? d3.time.scale() : d3.scale[xScale]();
    x.domain(opt.xlim || d3.extent(allXrange)).range([0, this.width]);
    this.yScale = y = d3.scale[yScale]();
    y.range([this.height, 0]);
    stack = d3.layout.stack().offset('expand').values(function(d) {
      return d.data;
    }).y(this._y).x(this._x);
    area = d3.svg.area().x(function(d) {
      return x(_this._x(d));
    }).y0(function(d) {
      return y(d.y0);
    }).y1(function(d, idx) {
      return y(d.y0 + d.y);
    });
    category10 = d3.scale.category10();
    if (this._color) {
      color = function(d, idx, sid) {
        return _this._color(null, idx, sid);
      };
    } else {
      color = function(d, idx, sid) {
        return category10(sid);
      };
    }
    l = this.svg.selectAll("path.stack").data(stack(series)).enter().append("path").attr('class', function(d, sid) {
      return "stack serie-" + sid;
    }).attr("d", function(d) {
      return area(d.data);
    }).attr("fill", function(d, sid) {
      return color(d, null, sid);
    }).attr("stroke", "none").style("cursor", 'pointer').on('mouseover', this.inhibitOther('path.stack', 0.2)).on('touchstart', this.inhibitOther('path.stack', 0.2)).on('mouseout', this.clearInhibit('path.stack')).on('touchend', this.clearInhibit('path.stack'));
    xaxis = getAxis(x, new Option({}, (_ref = this.opt.axis) != null ? _ref.x : void 0));
    yaxis = getAxis(y, new Option({
      orient: 'left'
    }, (_ref1 = this.opt.axis) != null ? _ref1.y : void 0));
    if (!this.svg.select('g.xaxis')[0][0]) {
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")");
      xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis);
      yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      if ((_ref2 = this.opt.axis) != null ? (_ref3 = _ref2.x) != null ? _ref3.title : void 0 : void 0) {
        xTitle = xAxis.append('text').attr('class', 'title').text((_ref4 = this.opt.axis) != null ? (_ref5 = _ref4.x) != null ? _ref5.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.xaxis text.title').width();
        height = this.$target.find('svg g.xaxis text.title').height();
        xTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
      }
      if ((_ref6 = this.opt.axis) != null ? (_ref7 = _ref6.y) != null ? _ref7.title : void 0 : void 0) {
        yTitle = yAxis.append('text').attr('class', 'title').text((_ref8 = this.opt.axis) != null ? (_ref9 = _ref8.y) != null ? _ref9.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.yaxis text.title').width();
        height = this.$target.find('svg g.yaxis text.title').height();
        tickLabel = this.$target.find('svg g.yaxis g.tick text');
        tickWidth = d3.max(tickLabel, function(d) {
          return $(d).width();
        });
        yTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
        yTitle.attr('transform', "rotate(-90)");
      }
    }
    return this.appendLegend(series);
  };

  Veasy.prototype.drawBar = function(series, opt) {
    var allLabels, allYrange, bandWidth, category10, err, height, mergedSeries, tickLabel, tickWidth, tooltipFormat, width, x, xAxis, xTitle, xType, xaxis, y, yAxis, yTitle, yType, yaxis, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    if (err = this.isValidPositionAccessor(mergedSeries[0])) {
      return err;
    }
    opt = new Option(this.opt, opt);
    allLabels = null;
    (function(mergedSeries) {
      var dat, label, labels, _i, _len;
      labels = {};
      for (_i = 0, _len = mergedSeries.length; _i < _len; _i++) {
        dat = mergedSeries[_i];
        labels[_this._x(dat)] = 1;
      }
      return allLabels = ((function() {
        var _results;
        _results = [];
        for (label in labels) {
          _results.push(label);
        }
        return _results;
      })()).sort(_this.opt.sort);
    })(mergedSeries);
    allYrange = d3.extent(mergedSeries, this._y);
    xType = String;
    yType = Number;
    this.xScale = x = d3.scale.ordinal();
    this.yScale = y = d3.scale[opt.yscale || "linear"]();
    if (opt.transpose) {
      x.rangeBands([0, this.height], 0.1).domain(allLabels);
      y.domain(opt.ylim || [0, d3.extent(allYrange)[1]]).range([0, this.width]);
    } else {
      x.rangeBands([0, this.width], 0.1).domain(allLabels);
      y.domain(opt.ylim || [0, d3.extent(allYrange)[1]]).range([this.height, 0]);
    }
    bandWidth = x.rangeBand() / series.length;
    category10 = d3.scale.category10();
    series.forEach(function(serie, sid) {
      var color, rect, _ref;
      if (_this._color) {
        color = function(d, idx) {
          return _this._color(d, idx, sid);
        };
      } else if (((_ref = serie.opt) != null ? _ref.color : void 0) != null) {
        color = function(d, idx) {
          return serie.opt.color;
        };
      } else {
        color = function(d, idx) {
          return category10(sid);
        };
      }
      rect = _this.svg.selectAll("rect.bar.serie-" + sid).data(serie.data).enter().append("rect").attr("class", "bar serie-" + sid);
      if (opt.transpose) {
        rect.attr("x", 0).attr("width", function(d) {
          return y(_this._y(d));
        }).attr("y", function(d) {
          return x(_this._x(d)) + sid * bandWidth;
        }).attr("height", bandWidth);
      } else {
        rect.attr("x", function(d) {
          return x(_this._x(d)) + sid * bandWidth;
        }).attr("width", bandWidth).attr("y", function(d) {
          return y(_this._y(d));
        }).attr("height", function(d) {
          return _this.height - y(_this._y(d));
        });
      }
      return rect.style("cursor", 'pointer').attr("fill", color).on('mouseover', _this.inhibitOther('rect.bar')).on('touchstart', _this.inhibitOther('rect.bar')).on('mouseout', _this.clearInhibit('rect.bar')).on('touchend', _this.clearInhibit('rect.bar'));
    });
    if (tooltipFormat = (_ref = this.opt.tooltip) != null ? _ref.format : void 0) {
      $("svg#" + this.id + " rect").tipsy({
        gravity: this.opt.tooltip.gravity || (opt.transpose ? 'w' : 's'),
        html: true,
        title: function() {
          var d;
          d = this.__data__;
          return tooltipFormat(d);
        }
      });
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      if (opt.transpose) {
        xaxis = getAxis(x, new Option({
          orient: 'left'
        }, (_ref1 = this.opt.axis) != null ? _ref1.x : void 0));
        yaxis = getAxis(y, new Option({}, (_ref2 = this.opt.axis) != null ? _ref2.y : void 0));
        xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis);
        xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
        yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).attr("transform", "translate(0," + this.height + ")");
        yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
        if ((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.x) != null ? _ref4.title : void 0 : void 0) {
          xTitle = xAxis.append('text').attr('class', 'title').text((_ref5 = this.opt.axis) != null ? (_ref6 = _ref5.x) != null ? _ref6.title : void 0 : void 0).style('text-anchor', 'middle');
          width = this.$target.find('svg g.xaxis text.title').width();
          height = this.$target.find('svg g.xaxis text.title').height();
          tickLabel = this.$target.find('svg g.xaxis g.tick text');
          tickWidth = d3.max(tickLabel, function(d) {
            return $(d).width();
          });
          xTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
          xTitle.attr('transform', "rotate(-90)");
        }
        if ((_ref7 = this.opt.axis) != null ? (_ref8 = _ref7.y) != null ? _ref8.title : void 0 : void 0) {
          yTitle = yAxis.append('text').attr('class', 'title').text((_ref9 = this.opt.axis) != null ? (_ref10 = _ref9.y) != null ? _ref10.title : void 0 : void 0).style('text-anchor', 'middle');
          width = this.$target.find('svg g.yaxis text.title').width();
          height = this.$target.find('svg g.yaxis text.title').height();
          yTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
        }
      } else {
        xaxis = getAxis(x, new Option({}, (_ref11 = this.opt.axis) != null ? _ref11.x : void 0));
        yaxis = getAxis(y, new Option({
          orient: 'left'
        }, (_ref12 = this.opt.axis) != null ? _ref12.y : void 0));
        xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")");
        xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
        yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis);
        yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
        if ((_ref13 = this.opt.axis) != null ? (_ref14 = _ref13.x) != null ? _ref14.title : void 0 : void 0) {
          xTitle = xAxis.append('text').attr('class', 'title').text(this.opt.axis.x.title).style('text-anchor', 'middle');
          width = this.$target.find('svg g.xaxis text.title').width();
          height = this.$target.find('svg g.xaxis text.title').height();
          xTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
        }
        if ((_ref15 = this.opt.axis) != null ? (_ref16 = _ref15.y) != null ? _ref16.title : void 0 : void 0) {
          yTitle = yAxis.append('text').attr('class', 'title').text(this.opt.axis.y.title).style('text-anchor', 'middle');
          width = this.$target.find('svg g.yaxis text.title').width();
          height = this.$target.find('svg g.yaxis text.title').height();
          tickLabel = this.$target.find('svg g.yaxis g.tick text');
          tickWidth = d3.max(tickLabel, function(d) {
            return $(d).width();
          });
          yTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
          yTitle.attr('transform', "rotate(-90)");
        }
      }
    }
    return this.appendLegend(series);
  };

  Veasy.prototype.drawBox = function(series, opt) {
    var allLabels, allYrange, bandWidth, category10, height, mergedSeries, tickLabel, tickWidth, tooltipFormat, width, x, xAxis, xTitle, xType, xaxis, y, yAxis, yTitle, yType, yaxis, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    if (!(typeof this._y === 'function' && (this._y(series[0].data[0]) != null))) {
      return new AccessorError("", this._y, data);
    }
    mergedSeries = this.getMergedSeries(series);
    opt = new Option(this.opt, opt);
    allLabels = series.map(function(d) {
      return d.name;
    });
    allYrange = d3.extent(mergedSeries, this._y);
    xType = String;
    yType = Number;
    this.xScale = x = d3.scale.ordinal();
    this.yScale = y = d3.scale[opt.yscale || "linear"]();
    x.rangeBands([0, this.width], 0.1).domain(allLabels);
    y.domain(opt.ylim || [0, d3.extent(allYrange)[1]]).range([this.height, 0]);
    bandWidth = x.rangeBand();
    category10 = d3.scale.category10();
    series.forEach(function(serie, sid) {
      var box, color, data, first, hinge, max, median, min, outlier, third, width, _ref;
      if (_this._color) {
        color = function(d, idx) {
          return _this._color(d, idx, sid);
        };
      } else if (((_ref = serie.opt) != null ? _ref.color : void 0) != null) {
        color = function(d, idx) {
          return serie.opt.color;
        };
      } else {
        color = function(d, idx) {
          return category10(sid);
        };
      }
      data = serie.data.map(function(d) {
        return _this._y(d);
      }).sort(function(a, b) {
        return a - b;
      });
      median = d3.median(data);
      first = d3.quantile(data, 0.25);
      third = d3.quantile(data, 0.75);
      hinge = third - first;
      min = Math.max(Math.min.apply(Math, data), first - 1.5 * hinge);
      max = Math.min(Math.max.apply(Math, data), third + 1.5 * hinge);
      outlier = data.filter(function(d) {
        return d > max || d < min;
      });
      width = bandWidth * 0.8;
      box = _this.svg.append('g').attr('class', 'box serie-#{sid}"').attr('transform', "translate(" + (x(serie.name)) + ", 0)");
      box[0][0].__data__ = {
        median: median,
        first: first,
        third: third,
        hinge: hinge,
        min: min,
        max: max,
        outlier: outlier
      };
      box.append('rect').attr('x', 0).attr('y', y(third)).attr('width', width).attr('height', y(first) - y(third)).attr('fill', 'white').attr('stroke', color).attr('stroke-width', 2);
      box.append('line').attr('stroke', color).attr('x1', 0).attr('y1', y(median)).attr('x2', width).attr('y2', y(median)).attr('stroke-width', 3);
      box.append('line').attr('stroke', color).attr('x1', width / 2).attr('y1', y(first)).attr('x2', width / 2).attr('y2', y(min));
      box.append('line').attr('stroke', color).attr('x1', width * 0.25).attr('y1', y(min)).attr('x2', width * 0.75).attr('y2', y(min));
      box.append('line').attr('stroke', color).attr('x1', width / 2).attr('y1', y(max)).attr('x2', width / 2).attr('y2', y(third));
      box.append('line').attr('stroke', color).attr('x1', width * 0.25).attr('y1', y(max)).attr('x2', width * 0.75).attr('y2', y(max));
      return box.selectAll('circle.outlier').data(outlier).enter().append('circle').attr('class', 'outlier').attr('cx', width / 2).attr('cy', function(d) {
        return y(d);
      }).attr('r', 3).attr('stroke', color).attr('fill', 'none');
    });
    if (tooltipFormat = (_ref = this.opt.tooltip) != null ? _ref.format : void 0) {
      $("svg#" + this.id + " g.box rect").tipsy({
        gravity: this.opt.tooltip.gravity || (opt.transpose ? 'w' : 's'),
        html: true,
        title: function() {
          var d;
          d = this.__data__;
          return tooltipFormat(d);
        }
      });
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      xaxis = getAxis(x, new Option({}, (_ref1 = this.opt.axis) != null ? _ref1.x : void 0));
      yaxis = getAxis(y, new Option({
        orient: 'left'
      }, (_ref2 = this.opt.axis) != null ? _ref2.y : void 0));
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")");
      xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis);
      yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      if ((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.x) != null ? _ref4.title : void 0 : void 0) {
        xTitle = xAxis.append('text').attr('class', 'title').text(this.opt.axis.x.title).style('text-anchor', 'middle');
        width = this.$target.find('svg g.xaxis text.title').width();
        height = this.$target.find('svg g.xaxis text.title').height();
        xTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
      }
      if ((_ref5 = this.opt.axis) != null ? (_ref6 = _ref5.y) != null ? _ref6.title : void 0 : void 0) {
        yTitle = yAxis.append('text').attr('class', 'title').text(this.opt.axis.y.title).style('text-anchor', 'middle');
        width = this.$target.find('svg g.yaxis text.title').width();
        height = this.$target.find('svg g.yaxis text.title').height();
        tickLabel = this.$target.find('svg g.yaxis g.tick text');
        tickWidth = d3.max(tickLabel, function(d) {
          return $(d).width();
        });
        yTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
        yTitle.attr('transform', "rotate(-90)");
      }
    }
    return this.appendLegend(series);
  };

  Veasy.prototype.drawPie = function(series, opt) {
    var category10, err, innerMargin, mergedSeries, outerMargin, radius, serie, tooltipFormat, x, _ref,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    if (err = this.isValidPositionAccessor(mergedSeries[0])) {
      return err;
    }
    opt = new Option(this.opt, opt);
    this.svg.attr('transform', '').attr('width', this.width + this.margin.width).attr('height', this.height + this.margin.height);
    radius = Math.min((this.width + this.margin.width) / series.length, this.height + this.margin.height) / 2;
    outerMargin = opt.outerMargin || 10;
    innerMargin = Math.min(opt.innerMargin || 0, radius - outerMargin - 10);
    this.xScale = x = d3.scale.ordinal().rangeBands([0, this.width + this.margin.width], 0.1).domain((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = series.length; _i < _len; _i++) {
        serie = series[_i];
        _results.push(serie.name);
      }
      return _results;
    })());
    category10 = d3.scale.category10();
    series.forEach(function(serie, sid) {
      var arc, color, g, pie, _ref;
      if (_this._color) {
        color = _this._color;
      } else if (((_ref = serie.opt) != null ? _ref.color : void 0) != null) {
        color = function(d, idx) {
          return serie.opt.color;
        };
      } else {
        color = function(d, idx) {
          return category10(idx);
        };
      }
      arc = d3.svg.arc().outerRadius(radius - outerMargin).innerRadius(innerMargin);
      pie = d3.layout.pie().sort(null).value(_this._y);
      g = _this.svg.selectAll("g.arc.serie-" + sid).data(pie(serie.data)).enter().append('g').attr('class', "arc serie-" + sid).attr('transform', "translate(" + (radius + x(serie.name)) + "," + radius + ")");
      g.append('path').attr('d', arc).attr('fill', color).style("cursor", 'pointer');
      return g.on('mouseover', _this.inhibitOther('g.arc')).on('touchstart', _this.inhibitOther('g.arc')).on('mouseout', _this.clearInhibit('g.arc')).on('touchend', _this.clearInhibit('g.arc'));
    });
    if (tooltipFormat = (_ref = this.opt.tooltip) != null ? _ref.format : void 0) {
      $("svg#" + this.id + " path").tipsy({
        gravity: this.opt.tooltip.gravity || "s",
        html: true,
        title: function() {
          var d;
          d = this.__data__.data;
          return tooltipFormat(d);
        }
      });
    }
    return this.appendLegend(series, function() {
      return 'grey';
    });
  };

  Veasy.prototype.drawFlow = function(data, opt) {
    var color, idx, link, node, path, rect, sankey, tooltipFormat, _i, _len, _ref, _ref1;
    if (opt == null) {
      opt = {};
    }
    opt = new Option(this.opt, opt);
    if (d3.sankey == null) {
      throw new Error('veasy require d3.sankey.\nuse d3.sankey (https://github.com/d3/d3-plugins/tree/master/sankey)');
    }
    if (!(data.nodes && data.links)) {
      return this.errorHandler(new Error("flow chart require {nodes: [], links: []}"));
    }
    _ref = data.nodes;
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      node = _ref[idx];
      node.id = node.id || idx;
    }
    color = d3.scale.category10();
    sankey = d3.sankey().nodeWidth(opt.nodeWidth || 20).nodePadding(opt.nodePadding || 0).size([this.width, this.height]);
    path = sankey.link();
    sankey.nodes(data.nodes).links(data.links).layout(32);
    link = this.svg.selectAll('path.link').data(data.links).enter().append('path').attr('class', function(d) {
      return "link src-" + d.source.id + " tgt-" + d.target.id;
    }).attr('d', path).attr('stroke', 'grey').attr('stroke-width', function(d) {
      return Math.max(1, d.dy);
    }).attr('fill', 'none').style('opacity', 0.6).style("cursor", 'pointer').on('mouseover', function(d) {
      return d3.select(this).style('opacity', 0.9);
    }).on('mouseout', function(d) {
      return d3.select(this).style('opacity', 0.6);
    });
    node = this.svg.selectAll('g.node').data(data.nodes).enter().append('g').attr('class', 'node').attr('transform', function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    rect = node.append('rect').attr('height', function(d) {
      return d.dy;
    }).attr('width', function(d) {
      return sankey.nodeWidth();
    }).attr('fill', function(d) {
      return d.color || (d.color = color(d.name));
    }).style("cursor", 'pointer').on('mouseover', this.inhibitOther('g.node rect')).on('touchstart', this.inhibitOther('g.node rect')).on('mouseout', this.clearInhibit('g.node rect')).on('touchend', this.clearInhibit('g.node rect'));
    if (tooltipFormat = (_ref1 = this.opt.tooltip) != null ? _ref1.format : void 0) {
      $("svg#" + this.id + " g.node rect").tipsy({
        gravity: this.opt.tooltip.gravity || "s",
        html: true,
        title: function() {
          var d;
          d = this.__data__;
          return tooltipFormat(d);
        }
      });
      return $("svg#" + this.id + " path.link").tipsy({
        gravity: this.opt.tooltip.gravity || "s",
        html: true,
        title: function() {
          var d;
          d = this.__data__;
          return tooltipFormat(d);
        }
      });
    }
  };

  Veasy.prototype.drawScatterPlot = function(series, opt) {
    var allXrange, allYrange, category10, error, height, mergedSeries, tickLabel, tickWidth, width, x, xAxis, xScale, xTitle, xType, xaxis, y, yAxis, yScale, yTitle, yType, yaxis, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    if (error = this.isValidPositionAccessor(mergedSeries[0])) {
      return this.errorHandler(error);
    }
    opt = new Option(this.opt, opt);
    allXrange = d3.extent(mergedSeries, this._x);
    allYrange = d3.extent(mergedSeries, this._y);
    xType = this._x(mergedSeries[0]).constructor;
    yType = Number;
    xScale = opt.xscale || "linear";
    yScale = opt.yscale || "linear";
    this.xScale = x = xType.name === 'Date' ? d3.time.scale() : d3.scale[xScale]();
    x.domain(opt.xlim || d3.extent(allXrange)).range([0, this.width]);
    this.yScale = y = d3.scale[yScale]();
    y.domain(opt.ylim || d3.extent(allYrange)).range([this.height, 0]);
    category10 = d3.scale.category10();
    series.forEach(function(serie, sid) {
      var color, point, sym, symbol, tooltipFormat, _ref;
      sym = d3.svg.symbol().type('circle');
      if (_this._color != null) {
        color = function(d, idx) {
          return _this._color(d, idx, sid);
        };
      } else {
        color = function(d, idx) {
          return category10(sid);
        };
      }
      if (_this._symbol != null) {
        symbol = function(d, idx) {
          return _this._symbol(d, idx, sid);
        };
      }
      point = _this.svg.selectAll("path.plot.serie-" + sid).data(serie.data).enter().append('path').attr('class', "plot serie-" + sid).attr('d', function(d, idx) {
        return sym.size((typeof _this._size === "function" ? _this._size(d) : void 0) || 48).type((typeof symbol === "function" ? symbol(d, idx) : void 0) || 'circle')(d);
      }).attr('transform', function(d) {
        return "translate(" + (x(_this._x(d))) + "," + (y(_this._y(d))) + ")";
      }).attr('fill', color);
      if (tooltipFormat = (_ref = _this.opt.tooltip) != null ? _ref.format : void 0) {
        return $("svg#" + _this.id + " path.plot.serie-" + sid).tipsy({
          gravity: _this.opt.tooltip.gravity || "s",
          html: true,
          title: function() {
            var d;
            d = this.__data__;
            return tooltipFormat(d);
          }
        });
      }
    });
    if (!this.svg.select('g.xaxis')[0][0]) {
      xaxis = getAxis(x, new Option({}, (_ref = this.opt.axis) != null ? _ref.x : void 0));
      yaxis = getAxis(y, new Option({
        orient: 'left'
      }, (_ref1 = this.opt.axis) != null ? _ref1.y : void 0));
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")");
      xAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis);
      yAxis.selectAll("path").attr("fill", "none").attr("stroke", "black");
      if ((_ref2 = this.opt.axis) != null ? (_ref3 = _ref2.x) != null ? _ref3.title : void 0 : void 0) {
        xTitle = xAxis.append('text').attr('class', 'title').text((_ref4 = this.opt.axis) != null ? (_ref5 = _ref4.x) != null ? _ref5.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.xaxis text.title').width();
        height = this.$target.find('svg g.xaxis text.title').height();
        xTitle.attr('dx', (this.width - width) / 2).attr('dy', height * 2);
      }
      if ((_ref6 = this.opt.axis) != null ? (_ref7 = _ref6.y) != null ? _ref7.title : void 0 : void 0) {
        yTitle = yAxis.append('text').attr('class', 'title').text((_ref8 = this.opt.axis) != null ? (_ref9 = _ref8.y) != null ? _ref9.title : void 0 : void 0).style('text-anchor', 'middle');
        width = this.$target.find('svg g.yaxis text.title').width();
        height = this.$target.find('svg g.yaxis text.title').height();
        tickLabel = this.$target.find('svg g.yaxis g.tick text');
        tickWidth = d3.max(tickLabel, function(d) {
          return $(d).width();
        });
        yTitle.attr('dx', -(this.height - height) / 2).attr('dy', -height - tickWidth);
        yTitle.attr('transform', "rotate(-90)");
      }
    }
    return this.appendLegend(series);
  };

  Veasy.prototype.drawScatterMatrix = function(series, opt) {
    var attr, attr1, attr2, attrs, colors, extent, extents, height, idx1, idx2, k, margin, matrix, mergedData, mergedSeries, padding, r, scale1, scale2, scaleRange, scales, text, type, types, w, width, xAxis, xaxis, yAxis, yaxis, _i, _j, _len, _len1, _results;
    if (opt == null) {
      opt = {};
    }
    mergedSeries = this.getMergedSeries(series);
    opt = new Option(this.opt, opt);
    attrs = (function() {
      var _results;
      _results = [];
      for (k in series[0].data[0]) {
        _results.push(k);
      }
      return _results;
    })();
    padding = 5;
    margin = 10;
    r = 2;
    width = 0 | ((this.width - (padding * (attrs.length - 1))) / attrs.length) - margin * 2;
    height = 0 | ((this.height - (padding * (attrs.length - 1))) / attrs.length) - margin * 2;
    extents = {};
    scales = {};
    types = {};
    for (idx1 = _i = 0, _len = attrs.length; _i < _len; idx1 = ++_i) {
      attr = attrs[idx1];
      extent = extents[attr] = d3.extent(mergedSeries, function(d) {
        return d[attr];
      });
      type = types[attr] = mergedSeries[0][attr].constructor.name;
      scales[attr] = (type === 'Date' ? d3.time.scale() : d3.scale.linear()).domain(extent);
    }
    _results = [];
    for (idx1 = _j = 0, _len1 = attrs.length; _j < _len1; idx1 = ++_j) {
      attr1 = attrs[idx1];
      _results.push((function() {
        var _k, _len2, _results1;
        _results1 = [];
        for (idx2 = _k = 0, _len2 = attrs.length; _k < _len2; idx2 = ++_k) {
          attr2 = attrs[idx2];
          matrix = this.svg.append('g').attr('class', 'scattermatrix').attr('width', width).attr('height', height).attr('transform', function(d) {
            return "translate(" + ((width + padding + margin * 2) * idx2) + ", " + ((height + padding + margin * 2) * idx1) + ")";
          });
          scale1 = scales[attr1].range([width, 0]);
          scale2 = scales[attr2].range([0, height]);
          if (idx2 === 0) {
            text = matrix.append('text').text(attrs[idx1]);
            text.attr('transform', "rotate(-90) translate(-" + height + ", -40)");
            yaxis = d3.svg.axis().scale(scales[attr1]).orient('left').ticks(5);
            if (types[attr1] === 'Date') {
              yaxis.tickFormat(d3.time.format("%y/%m/%d"));
            }
            yAxis = matrix.append('g').attr('class', 'yaxis').call(yaxis);
            yAxis.selectAll('path').attr('fill', 'none');
          }
          if (idx1 === 0) {
            matrix.append('text').text(attrs[idx2]).attr('transform', "translate(0, -40)");
            xaxis = d3.svg.axis().scale(scales[attr2]).orient('top').ticks(5);
            if (types[attr2] === 'Date') {
              xaxis.tickFormat(d3.time.format("%y/%m/%d"));
            }
            xAxis = matrix.append('g').attr('class', 'xaxis').call(xaxis);
            xAxis.selectAll('path').attr('fill', 'none');
            xAxis.selectAll('text').attr('transform', 'rotate(-90) translate(20, 10)');
          }
          matrix.append('rect').attr('width', width + r * 2).attr('height', height + r * 2).attr('transform', "translate(" + (-r) + ", " + (-r) + ")").attr('stroke', 'black').attr('fill', 'none');
          colors = d3.scale.category10();
          if (idx1 === idx2) {
            scaleRange = scales[attr1].range([0, 9]);
            mergedData = d3.nest().key(function(d) {
              return 0 | scaleRange(d[attr1]);
            }).sortKeys().rollup(function(vals) {
              return vals.length;
            }).entries(mergedSeries);
            w = (width + r * 2) / mergedData.length;
            series.forEach(function(serie, sid) {
              var data, scale;
              data = d3.nest().key(function(d) {
                return 0 | scaleRange(d[attr1]);
              }).sortKeys(function(a, b) {
                return a - b;
              }).rollup(function(vals) {
                return vals.length;
              }).entries(serie.data);
              scale = d3.scale.linear().domain([
                0, d3.extent(data, function(d) {
                  return d.values;
                })[1]
              ]).range([height / series.length, 0]);
              return matrix.append('g').selectAll('rect').data(data).enter().append('rect').attr('width', w).attr('height', function(d) {
                return height / series.length - scale(d.values);
              }).attr('x', function(d, idx) {
                return w * idx - r;
              }).attr('y', function(d) {
                return height / series.length * sid + scale(d.values) + r;
              }).attr('fill', colors(sid));
            });
            continue;
          }
          _results1.push(series.forEach(function(serie, idx) {
            return matrix.append('g').selectAll("circle.scatter.serie-" + idx).data(serie.data).enter().append('circle').attr('class', "scatter serie-" + idx).attr('cy', function(d) {
              return scales[attr1](d[attr1]);
            }).attr('cx', function(d) {
              return scales[attr2](d[attr2]);
            }).attr('r', r).attr('fill', colors(idx)).attr('stroke', 'none');
          }));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Veasy.prototype.drawBubble = function(data, opt) {
    if (opt == null) {
      opt = {};
    }
  };

  Veasy.prototype.drawColoredTable = function(data, opt) {
    var table, tr,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    table = d3.select(this.$target.get(0)).append('table');
    tr = table.selectAll('tr').data(data).enter().append('tr');
    return tr.selectAll('td').data(function(d) {
      return d.data;
    }).enter().append('td').text(function(d) {
      return _this._y(d);
    });
  };

  return Veasy;

})();

getAxis = function(scale, opt) {
  var attr, axis, value;
  if (opt == null) {
    opt = {};
  }
  axis = d3.svg.axis().scale(scale);
  for (attr in opt) {
    value = opt[attr];
    if (typeof axis[attr] === 'function') {
      axis[attr](value);
    }
  }
  return axis;
};

Veasy.Option = Option = (function() {
  function Option() {
    var k, opt, opts, v, _i, _len;
    opts = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = opts.length; _i < _len; _i++) {
      opt = opts[_i];
      for (k in opt) {
        v = opt[k];
        this[k] = v;
      }
    }
  }

  return Option;

})();

Veasy.AccessorError = AccessorError = (function(_super) {
  __extends(AccessorError, _super);

  function AccessorError(x, y, data) {
    this.message = ["accessor uncorrespoding to data", "= x =====", "" + (x.toString()), "= y =====", "" + (y.toString()), "= data ==", "" + (JSON.stringify(data)), "======="].join("\n");
  }

  return AccessorError;

})(Error);

this.Veasy = Veasy;
