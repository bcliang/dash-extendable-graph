# dash-extendable-graph

[![PyPI](https://img.shields.io/pypi/v/dash-extendable-graph.svg)](https://pypi.org/project/dash-extendable-graph/)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/dash-extendable-graph.svg)
[![PyPI - License](https://img.shields.io/pypi/l/dash-extendable-graph.svg)](./LICENSE)

dash-extendable-graph is a Dash component library. This library contains a single component: `ExtendableGraph`. The component is a fork of the Graph() component from [dash-core-components](https://github.com/plotly/dash-core-components) (version 1.3.1). Best efforts will be made to keep in sync with the upstream repository. 

The primary differentiation between ExtendableGraph and Graph components is the `extendData` callback. This component has been modified to follow an api that matches the format of `figure['data']` (as opposed to the api defined `Graph.extendData` and `Plotly.extendTraces()`).

Note: As of version 1.1.0, `dash-extendable-graph` includes PlotlyJS as an internal dependency. Previously, the component assumed it would be used in conjunction with `dash-core-components`. As of `dash-core-components` version ^1.4.0, `PlotlyJS` is only available asynchronously when a Graph component exists on the page.

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

### extendData properties

1. `updateData` [list]: a list of dictionaries, each containing representing trace data (e.g `dict(x=[1], y=[1])`)
2. `traceIndices` [list, optional]: identify the traces that should be extended. If the specified trace index does not exist, the corresponding trace shall be appended to the figure.
3. `maxPoints` [number, optional]: define the maximum number of points to plot in the figure (per trace).

Based on the [`Plotly.extendTraces()` api](https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_api.js#L979). However, the `updateData` key has been modified to better match the contents of `Plotly.plot()` (e.g. `Graph.figure`). Aside from following dash-familiar styling, this component allows the user to extend traces of different types in a single call (`Plotly.extendTraces()` takes a map of key:val and assumes all traces will share the same data keys).

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
```

For developers:
```
$ pip install -r tests/requirements.txt
```

2. Build
```bash
$ npm run build
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

### Run locally

Run linting + integration tests in one command: 

```bash 
$npm run test
```

Or run tests individually:

### Code style

Uses `flake8` and `eslint`. Check `package.json`, `.eslintrc`, `.eslintignore` for configuration settings.
```bash
$npm run lint
$npm run lint:py
```

Uses `prettier` for javascript formatting:
```bash
$npm run format
```

### Integration

Integration tests for the component can be found in `tests/`
```bash
$pytest tests
```

Selenium test runner configuration options are located in `pytest.ini` (e.g. `--webdriver`, `--headless`). See `dash[testing]` documentation for more information on built-ins provided by the dash test fixture.

## Continuous Integration via Github Actions

This repository uses github actions to automate testing. CI is triggered on each (1) push and (2) pull request into `master`

## Publishing

### Create a production build and publish:

```bash
$ rm -rf dist
$ npm run build
$ python setup.py sdist bdist_wheel
$ twine upload dist/*
$ npm publish
```

Test your tarball by copying it into a new environment and installing it locally:
```bash
$ pip install dash_extendable_graph-X.X.X.tar.gz
```
