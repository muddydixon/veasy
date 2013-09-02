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
