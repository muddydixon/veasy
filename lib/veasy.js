var Veasy,
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
    if (!($target instanceof jQuery)) {
      this.$target = $(this.$target);
    }
    this.margin = this.opt.margin || [50, 50];
    this.width = (this.opt.width || this.$target.width() || 400) - this.margin[0] * 2;
    this.height = (this.opt.height || 300) - this.margin[1] * 2;
    this._x = null;
    this._y = null;
    this.xDefault = this.opt.xDefault;
    this.yDefault = this.opt.yDefault;
    this.svg = d3.select(this.$target.get(0)).append('svg').attr('width', this.width + this.margin[0] * 2).attr('height', this.height + this.margin[1] * 2).append('g').attr('width', this.width).attr('height', this.height).attr('transform', "translate(" + this.margin[0] + ", " + this.margin[1] + ")");
    if ((this.opt.color != null) && this.opt.color instanceof Array) {
      this.color = function(d) {
        return this.opt.color[d];
      };
    } else {
      this.color = d3.scale.category10();
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
    this._y = y;
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

  Veasy.prototype.checkAccessorValidation = function(data) {
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

  Veasy.prototype.tooltipDefaultStyle = {
    width: 200,
    height: 100,
    fill: "white",
    stroke: "grey"
  };

  Veasy.prototype.initToolTip = function() {
    var attr, tooltip, val, _ref, _results;
    tooltip = this.svg.append('g').attr('class', 'tooltip');
    _ref = this.tooltipDefaultStyle;
    _results = [];
    for (attr in _ref) {
      val = _ref[attr];
      _results.push(tooltip.style(attr, this.opt.tooltipStyle[attr] || val));
    }
    return _results;
  };

  Veasy.prototype.showToolTip = function(d) {
    var tooltip;
    tooltip = this.svg.select('g.tooltip');
    if (!tooltip.length) {
      tooltip = this.initToolTip();
    }
    return tooltip.attr('x', d3.event.x).attr('y', d3.event.y);
  };

  Veasy.prototype.hideToolTip = function() {};

  Veasy.prototype.moveToolTip = function() {};

  Veasy.prototype.errorHandler = function(err) {
    this.svg.append('text').attr('x', this.width / 2).attr('y', this.height / 2).text(this.opt.failMessage || "oops! draw chart fail...");
    throw err;
  };

  Veasy.prototype.drawLine = function(series, opt) {
    var allXrange, allYrange, idx, l, line, mergedSeries, serie, sort, x, xAxis, xScale, xType, xaxis, y, yAxis, yScale, yType, yaxis, _i, _j, _len, _len1, _ref,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    if (!this._x) {
      return this.errorHandler(new Error("accessor x required"));
    }
    if (!this._y) {
      return this.errorHandler(new Error("accessor y required"));
    }
    opt = new Veasy.Option(this.opt, opt);
    for (_i = 0, _len = series.length; _i < _len; _i++) {
      serie = series[_i];
      if (serie.data == null) {
        series = [
          {
            name: "no name",
            data: series
          }
        ];
        break;
      }
    }
    mergedSeries = this.getMergedSeries(series);
    this.checkAccessorValidation(mergedSeries[0]);
    allXrange = d3.extent(mergedSeries, this._x);
    allYrange = d3.extent(mergedSeries, this._y);
    xType = this._x(mergedSeries[0]).constructor;
    yType = Number;
    xScale = opt.xscale || "linear";
    yScale = opt.yscale || "linear";
    x = xType.name === 'Date' ? d3.time.scale() : d3.scale[xScale]();
    x.domain(opt.xlim || d3.extent(allXrange)).range([0, this.width]);
    y = d3.scale[yScale]();
    y.domain(opt.ylim || d3.extent(allYrange)).range([this.height, 0]);
    line = d3.svg.line().x(function(d) {
      return x(_this._x(d));
    }).y(function(d) {
      return y(_this._y(d));
    });
    for (idx = _j = 0, _len1 = series.length; _j < _len1; idx = ++_j) {
      serie = series[idx];
      serie.color = ((_ref = serie.opt) != null ? _ref.color : void 0) || this.color(idx);
      l = this.svg.append("path").attr('class', 'line').datum((sort = opt.sort) ? serie.data.sort(sort) : serie.data).attr("d", line).attr("fill", "none").attr("stroke", serie.color).attr("stroke-width", 2).style("cursor", 'pointer').on('mouseover', this.inhibitOther('path.line', 0.2)).on('touchstart', this.inhibitOther('path.line', 0.2)).on('mouseout', this.clearInhibit('path.line')).on('touchend', this.clearInhibit('path.line'));
    }
    xaxis = d3.svg.axis().scale(x);
    yaxis = d3.svg.axis().scale(y).orient("left");
    xAxis = this.svg.append("g").call(xaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
    return yAxis = this.svg.append("g").call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
  };

  Veasy.prototype.drawBar = function(series, opt) {
    var allLabels, allYrange, bandWidth, mergedSeries, self, serie, x, xAxis, xType, xaxis, y, yAxis, yType, yaxis, _i, _len,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    if (!this._x) {
      return this.errorHandler(new Error("accessor x required"));
    }
    if (!this._y) {
      return this.errorHandler(new Error("accessor y required"));
    }
    opt = new Veasy.Option(this.opt, opt);
    for (_i = 0, _len = series.length; _i < _len; _i++) {
      serie = series[_i];
      if (serie.data == null) {
        series = [
          {
            name: "no name",
            data: series
          }
        ];
        break;
      }
    }
    self = this;
    mergedSeries = this.getMergedSeries(series);
    this.checkAccessorValidation(mergedSeries[0]);
    allLabels = null;
    (function(mergedSeries) {
      var dat, label, labels, _j, _len1;
      labels = {};
      for (_j = 0, _len1 = mergedSeries.length; _j < _len1; _j++) {
        dat = mergedSeries[_j];
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
    x = d3.scale.ordinal();
    y = d3.scale[opt.yscale || "linear"]();
    if (opt.transpose) {
      x.rangeBands([0, this.height], 0.1).domain(allLabels);
      y.domain(opt.ylim || [0, d3.extent(allYrange)[1]]).range([0, this.width]);
    } else {
      x.rangeBands([0, this.width], 0.1).domain(allLabels);
      y.domain(opt.ylim || [0, d3.extent(allYrange)[1]]).range([this.height, 0]);
    }
    bandWidth = x.rangeBand() / series.length;
    series.forEach(function(serie, idx) {
      var rect, _ref;
      serie.color = ((_ref = serie.opt) != null ? _ref.color : void 0) || _this.color(idx);
      rect = _this.svg.selectAll("rect.bar.serie-" + idx).data(serie.data).enter().append("rect").attr("class", "bar serie-" + idx);
      if (opt.transpose) {
        rect.attr("x", 0).attr("width", function(d) {
          return y(_this._y(d));
        }).attr("y", function(d) {
          return x(_this._x(d)) + idx * bandWidth;
        }).attr("height", bandWidth);
      } else {
        rect.attr("x", function(d) {
          return x(_this._x(d)) + idx * bandWidth;
        }).attr("width", bandWidth).attr("y", function(d) {
          return y(_this._y(d));
        }).attr("height", function(d) {
          return _this.height - y(_this._y(d));
        });
      }
      return rect.style("cursor", 'pointer').attr("fill", serie.color).on('mouseover', _this.inhibitOther('rect.bar')).on('touchstart', _this.inhibitOther('rect.bar')).on('mouseout', _this.clearInhibit('rect.bar')).on('touchend', _this.clearInhibit('rect.bar'));
    });
    if (opt.transpose) {
      xaxis = d3.svg.axis().scale(x).orient("left");
      yaxis = d3.svg.axis().scale(y);
      xAxis = this.svg.append("g").call(xaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
      return yAxis = this.svg.append("g").call(yaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
    } else {
      xaxis = d3.svg.axis().scale(x);
      yaxis = d3.svg.axis().scale(y).orient("left");
      xAxis = this.svg.append("g").call(xaxis).attr("transform", "translate(0," + this.height + ")").selectAll("path").attr("fill", "none").attr("stroke", "black");
      return yAxis = this.svg.append("g").call(yaxis).selectAll("path").attr("fill", "none").attr("stroke", "black");
    }
  };

  Veasy.prototype.drawPie = function(series, opt) {
    var innerMargin, outerMargin, radius, serie, x, _i, _len,
      _this = this;
    if (opt == null) {
      opt = {};
    }
    if (!this._x) {
      return this.errorHandler(new Error("accessor x required"));
    }
    if (!this._y) {
      return this.errorHandler(new Error("accessor y required"));
    }
    opt = new Veasy.Option(this.opt, opt);
    for (_i = 0, _len = series.length; _i < _len; _i++) {
      serie = series[_i];
      if (serie.data == null) {
        series = [
          {
            name: "no name",
            data: series
          }
        ];
        break;
      }
    }
    radius = Math.min(this.width / series.length, this.height) / 2;
    outerMargin = opt.outerMargin || 10;
    innerMargin = Math.min(opt.innerMargin || 0, radius - outerMargin - 10);
    x = d3.scale.ordinal().rangeBands([0, this.width], 0.1).domain((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = series.length; _j < _len1; _j++) {
        serie = series[_j];
        _results.push(serie.name);
      }
      return _results;
    })());
    return series.forEach(function(serie, idx) {
      var arc, color, g, pie;
      color = d3.scale.category10();
      arc = d3.svg.arc().outerRadius(radius - outerMargin).innerRadius(innerMargin);
      pie = d3.layout.pie().sort(null).value(_this._y);
      g = _this.svg.selectAll("g.arc.serie-" + idx).data(pie(serie.data)).enter().append('g').attr('class', "arc serie-" + idx).attr('transform', "translate(" + (radius + x(serie.name)) + "," + radius + ")");
      g.append('path').attr('d', arc).attr('fill', function(d, i) {
        return color(i);
      }).style("cursor", 'pointer');
      return g.on('mouseover', _this.inhibitOther('g.arc')).on('touchstart', _this.inhibitOther('g.arc')).on('mouseout', _this.clearInhibit('g.arc')).on('touchend', _this.clearInhibit('g.arc'));
    });
  };

  Veasy.prototype.drawFlow = function(data, opt) {
    var color, idx, link, node, path, rect, sankey, _i, _len, _ref;
    if (opt == null) {
      opt = {};
    }
    opt = new Veasy.Option(this.opt, opt);
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
    return rect = node.append('rect').attr('height', function(d) {
      return d.dy;
    }).attr('width', function(d) {
      return sankey.nodeWidth();
    }).attr('fill', function(d) {
      return d.color || (d.color = color(d.name));
    }).style("cursor", 'pointer').on('mouseover', this.inhibitOther('g.node rect')).on('touchstart', this.inhibitOther('g.node rect')).on('mouseout', this.clearInhibit('g.node rect')).on('touchend', this.clearInhibit('g.node rect'));
  };

  return Veasy;

})();

Veasy.Option = (function() {
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

Veasy.AccessorError = (function(_super) {
  __extends(AccessorError, _super);

  function AccessorError(x, y, data) {
    this.message = ["accessor uncorrespoding to data", "= x =====", "" + (x.toString()), "= y =====", "" + (y.toString()), "= data ==", "" + (JSON.stringify(data)), "======="].join("\n");
  }

  return AccessorError;

})(Error);

this.Veasy = Veasy;
