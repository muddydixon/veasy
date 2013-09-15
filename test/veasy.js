var expect;

mocha.setup("bdd");

expect = chai.expect;

describe('box plot', function() {
  var baseid, id, monochrom, pointData;
  baseid = 'box';
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
    }).append($('<h1>').text("" + this.test.parent.title + "/" + this.__id__)).appendTo($('body'));
  });
  return it('basically point', function() {
    var chart, sales;
    chart = $("#" + baseid + "_" + this.__id__);
    sales = new Veasy(chart, {
      width: 600,
      tooltip: {
        format: function(d) {
          return "domain: [" + d.min + ", " + d.max + "]<br>IQR: " + d.first + ", " + d.median + ", " + d.third;
        }
      }
    });
    sales.x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    });
    return sales.drawBox(pointData);
  });
});

mocha.run();
