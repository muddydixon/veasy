var AccessorError, Option, Veasy,
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
    this.margin = this.opt.margin || [50, 50];
    this.width = (this.opt.width || this.$target.width() || 400) - this.margin[0] * 2;
    this.height = (this.opt.height || 300) - this.margin[1] * 2;
    this._x = null;
    this._y = null;
    this._symbol = null;
    this._size = null;
    this._value = null;
    this._color = null;
    this._dir = null;
    this._texture = null;
    this.xDefault = this.opt.xDefault;
    this.yDefault = this.opt.yDefault;
    this.svg = d3.select(this.$target.get(0)).select('svg');
    if (this.svg[0][0] == null) {
      this.svg = d3.select(this.$target.get(0)).append('svg').attr('id', this.id).attr('width', this.width + this.margin[0] * 2).attr('height', this.height + this.margin[1] * 2).append('g').attr('width', this.width).attr('height', this.height).attr('transform', "translate(" + this.margin[0] + ", " + this.margin[1] + ")");
    }
  }

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
      return this.errorHandler(new Veasy.AccessorError(this._x, this._y, data));
    }
    if (typeof this._y(data) === 'undefined') {
      return this.errorHandler(new Veasy.AccessorError(this._x, this._y, data));
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
    var allXrange, allYrange, category10, err, line, mergedSeries, tooltipFormat, x, xAxis, xScale, xType, xaxis, y, yAxis, yScale, yType, yaxis, _ref, _ref1, _ref2, _ref3, _ref4,
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
      var color, dot, l, sort, _ref;
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
      }).attr('r', ((_this.opt.withPoint != null) && 5) || 1).attr('fill', color).attr('stroke', 'none').attr('stroke-width', 3).style('cursor', 'pointer');
      if (_this.opt.withPoint) {
        return dot.on('mouseover', function(d) {
          var dom;
          dom = d3.select(d3.event.target);
          return dom.attr('r', 7).attr('stroke', dom.attr('fill')).attr('fill', 'white');
        }).on('mouseout', function(d) {
          var dom;
          dom = d3.select(d3.event.target);
          return dom.attr('r', 5).attr('fill', dom.attr('stroke')).attr('stroke', 'none');
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
    xaxis = d3.svg.axis().scale(x);
    yaxis = d3.svg.axis().scale(y).orient("left");
    if (((_ref1 = this.opt.axis) != null ? (_ref2 = _ref1.x) != null ? _ref2.format : void 0 : void 0) != null) {
      xaxis.tickFormat(this.opt.axis.x.format);
    }
    if (((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.y) != null ? _ref4.format : void 0 : void 0) != null) {
      yaxis.tickFormat(this.opt.axis.y.format);
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
      return yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
    }
  };

  Veasy.prototype.drawArea = function(series, opt) {
    var allXrange, allYrange, area, category10, err, mergedSeries, tooltipFormat, x, xAxis, xScale, xType, xaxis, y, yAxis, yScale, yType, yaxis, _ref, _ref1, _ref2, _ref3, _ref4,
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
      var color, dot, l, sort, _ref;
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
      l = _this.svg.append("path").attr('class', "area serie-" + sid).datum((sort = opt.sort) ? serie.data.sort(sort) : serie.data).attr("d", area).attr("fill", color).attr("stroke", "none").style("cursor", 'pointer').on('mouseover', _this.inhibitOther('path.area', 0.2)).on('touchstart', _this.inhibitOther('path.area', 0.2)).on('mouseout', _this.clearInhibit('path.area')).on('touchend', _this.clearInhibit('path.area'));
      dot = _this.svg.selectAll("circle.serie-" + sid).data(serie.data).enter().append('circle').attr('class', "serie-" + sid).attr('cx', function(d) {
        return x(_this._x(d));
      }).attr('cy', function(d) {
        return y(_this._y(d));
      }).attr('r', ((_this.opt.withPoint != null) && 5) || 1).attr('fill', color).attr('stroke', 'none').attr('stroke-width', 3).style('cursor', 'pointer');
      if (_this.opt.withPoint) {
        return dot.on('mouseover', function(d) {
          var dom;
          dom = d3.select(d3.event.target);
          return dom.attr('r', 7).attr('stroke', dom.attr('fill')).attr('fill', 'white');
        }).on('mouseout', function(d) {
          var dom;
          dom = d3.select(d3.event.target);
          return dom.attr('r', 5).attr('fill', dom.attr('stroke')).attr('stroke', 'none');
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
    xaxis = d3.svg.axis().scale(x);
    yaxis = d3.svg.axis().scale(y).orient("left");
    if (((_ref1 = this.opt.axis) != null ? (_ref2 = _ref1.x) != null ? _ref2.format : void 0 : void 0) != null) {
      xaxis.tickFormat(this.opt.axis.x.format);
    }
    if (((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.y) != null ? _ref4.format : void 0 : void 0) != null) {
      yaxis.tickFormat(this.opt.axis.y.format);
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
      return yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
    }
  };

  Veasy.prototype.drawStack = function(series, opt) {
    var allXrange, allYrange, area, category10, color, err, l, mergedSeries, stack, x, xAxis, xScale, xType, xaxis, y, yAxis, yScale, yType, yaxis, _ref, _ref1, _ref2, _ref3,
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
    stack = d3.layout.stack().values(function(d) {
      return d.data;
    }).y(this._y).x(this._x);
    console.log(stack(series));
    area = d3.svg.area().x(function(d) {
      return x(_this._x(d));
    }).y0(function(d) {
      return y(d.y0);
    }).y1(function(d) {
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
    xaxis = d3.svg.axis().scale(x);
    yaxis = d3.svg.axis().scale(y).orient("left");
    if (((_ref = this.opt.axis) != null ? (_ref1 = _ref.x) != null ? _ref1.format : void 0 : void 0) != null) {
      xaxis.tickFormat(this.opt.axis.x.format);
    }
    if (((_ref2 = this.opt.axis) != null ? (_ref3 = _ref2.y) != null ? _ref3.format : void 0 : void 0) != null) {
      yaxis.tickFormat(this.opt.axis.y.format);
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
      return yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
    }
  };

  Veasy.prototype.drawBar = function(series, opt) {
    var allLabels, allYrange, bandWidth, category10, err, mergedSeries, tooltipFormat, x, xAxis, xType, xaxis, y, yAxis, yType, yaxis, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
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
      })()).sort();
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
        xaxis = d3.svg.axis().scale(x).orient("left");
        yaxis = d3.svg.axis().scale(y);
        if (((_ref1 = this.opt.axis) != null ? (_ref2 = _ref1.x) != null ? _ref2.format : void 0 : void 0) != null) {
          xaxis.tickFormat(this.opt.axis.x.format);
        }
        if (((_ref3 = this.opt.axis) != null ? (_ref4 = _ref3.y) != null ? _ref4.format : void 0 : void 0) != null) {
          yaxis.tickFormat(this.opt.axis.y.format);
        }
        xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
        return yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
      } else {
        xaxis = d3.svg.axis().scale(x);
        yaxis = d3.svg.axis().scale(y).orient("left");
        if (((_ref5 = this.opt.axis) != null ? (_ref6 = _ref5.x) != null ? _ref6.format : void 0 : void 0) != null) {
          xaxis.tickFormat(this.opt.axis.x.format);
        }
        if (((_ref7 = this.opt.axis) != null ? (_ref8 = _ref7.y) != null ? _ref8.format : void 0 : void 0) != null) {
          yaxis.tickFormat(this.opt.axis.y.format);
        }
        xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis);
        xAxis.attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
        return yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
      }
    }
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
    radius = Math.min(this.width / series.length, this.height) / 2;
    outerMargin = opt.outerMargin || 10;
    innerMargin = Math.min(opt.innerMargin || 0, radius - outerMargin - 10);
    this.xScale = x = d3.scale.ordinal().rangeBands([0, this.width], 0.1).domain((function() {
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
      return $("svg#" + this.id + " path").tipsy({
        gravity: this.opt.tooltip.gravity || "s",
        html: true,
        title: function() {
          var d;
          d = this.__data__.data;
          return tooltipFormat(d);
        }
      });
    }
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
    var allXrange, allYrange, category10, error, mergedSeries, x, xAxis, xScale, xType, xaxis, y, yAxis, yScale, yType, yaxis, _ref, _ref1, _ref2, _ref3,
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
    xaxis = d3.svg.axis().scale(x);
    yaxis = d3.svg.axis().scale(y).orient("left");
    if (((_ref = this.opt.axis) != null ? (_ref1 = _ref.x) != null ? _ref1.format : void 0 : void 0) != null) {
      xaxis.tickFormat(this.opt.axis.x.format);
    }
    if (((_ref2 = this.opt.axis) != null ? (_ref3 = _ref2.y) != null ? _ref3.format : void 0 : void 0) != null) {
      yaxis.tickFormat(this.opt.axis.y.format);
    }
    if (!this.svg.select('g.xaxis')[0][0]) {
      xAxis = this.svg.append("g").attr('class', 'xaxis').call(xaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
      return yAxis = this.svg.append("g").attr('class', 'yaxis').call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
    }
  };

  Veasy.prototype.drawScatterMatrix = function(data, opt) {
    if (opt == null) {
      opt = {};
    }
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
