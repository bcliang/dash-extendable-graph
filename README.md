# dash-extendable-graph

[![PyPI](https://img.shields.io/pypi/v/dash-extendable-graph.svg)](https://pypi.org/project/dash-extendable-graph/)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/dash-extendable-graph.svg)
[![PyPI - License](https://img.shields.io/pypi/l/dash-extendable-graph.svg)](./LICENSE)

dash-extendable-graph is a Dash component library. This library contains a single component: `ExtendableGraph`. The component is a fork of the Graph() component of [dash-core-components](https://github.com/plotly/dash-core-components) (v 0.46.0), with an extra property (`extendData`) that allows Graph traces to be drawn through `Plotly.extendTraces()` instead of `Plotly.react()`.

Note: plotly.js is required. However, the library is NOT explicitly listed in `MANIFEST.in` or in `dash_extendable_graph\__init__.py` as a way to reduce bundle size. Plotly.js is already distributed with the dash-core-components package, and most projects will import dcc as well as dash-extendable-graph.

## Installation

Get started with:
1. Install Dash and dependencies: https://dash.plot.ly/installation
```bash
$ pip install -r requirements.txt
```
2. Install dash-extendable-graph
```bash
$ pip install dash-extendable-graph
```
3. Run `python usage.py`
4. Visit http://localhost:8050 in your web browser

## Usage

General examples may be found in `usage.py`

### extendData keys

1. `updateData` [list]: a list of dictionaries, each containing representing trace data (e.g `dict(x=[1], y=[1])`)
2. `traceIndices` [list, optional]: identify the traces that should be extended. If the specified trace index does not exist, the corresponding trace shall be appended to the figure.
3. `maxPoints` [number, optional]: define the maximum number of points to plot in the figure (per trace).

Based on the [`Plotly.extendTraces()` api](https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_api.js#L979).

### Code

Extend a trace once per second, limited to 100 maximum points.

```python
import dash_extendable_graph as deg
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import random

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

app.layout = html.Div([
    deg.ExtendableGraph(
        id='extendablegraph_example',
        figure=dict(
            data=[{'x': [0],
                   'y': [0],
                   'mode':'lines+markers'
                   }],
        )
    ),
    dcc.Interval(
        id='interval_extendablegraph_update',
        interval=1000,
        n_intervals=0,
        max_intervals=-1),
    html.Div(id='output')
])


@app.callback(Output('extendablegraph_example', 'extendData'),
              [Input('interval_extendablegraph_update', 'n_intervals')],
              [State('extendablegraph_example', 'figure')])
def update_extendData(n_intervals, existing):
    x_new = existing['data'][0]['x'][-1] + 1
    y_new = random.random()
    return [dict(x=[x_new], y=[y_new])], [0], 100


if __name__ == '__main__':
    app.run_server(debug=True)

```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Local Installation

1. Dependencies
```bash
$ npm install
$ virtualenv venv
$ . venv/bin/activate
$ pip install -r requirements.txt
$ pip install -r tests/requirements.txt
```
2. Build
```bash
$ npm run build:all
```
3. Check out the component via component-playground
```bash
$ npm run start
```
    The demo app is in `src/demo`
4. Check out the sample Dash application using the component    
```bash
$ python setup.py install
$ python usage.py
```

## Tests

- Run the tests with `$pytest tests`

### Create a production build and publish:

```bash
$ npm run build
$ rm -rf dist
$ python setup.py sdist bdist_wheel
$ twine upload dist/*
$ npm publish
```

Test your tarball by copying it into a new environment and installing it locally:
```bash
$ pip install dash_extendable_graph-X.X.X.tar.gz
```
