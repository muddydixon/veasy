Veasy.js | easy visualization using d3.js
----------

## syntax

```
Veasy = require 'veasy
mychart = new Veasy()
mychart.x((d)-> d.time).y((d)-> d.sales)


# draw line chart
mychart.drawLine()

# draw bar chart
mychart.drawBar()

# draw pie chart
mychart.drawPie()

```

## Todo

* separate axis object
* more tick attribute
* point size
* axis label
* chart title

## Author

* muddydixon<muddydixon@gmail.com>
* twitter: @muddydixon

## License

Apache License Version 2.0
