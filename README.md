# dash-extendable-graph

`dash-extendable-graph` is a Dash component library containing a single component: `ExtendableGraph`. The component was forked from Plotly's core `Graph` component ([dash-core-components](https://github.com/plotly/dash-core-components)). `dash-extendable-graph` has modified `extendData` and `prependData` properties that accept trace data matching the format for `figure["data"]`. These properties support (1) adding new traces and (2) allow multiple trace types to be extended/prepended within a single callback (not supported by the core component)

Note: As of version 1.1.0, `dash-extendable-graph` includes a minimized plotly.js as an internal dependency. Previously, the component assumed it would be used in conjunction with `dash-core-components`.

[![PyPI](https://img.shields.io/pypi/v/dash-extendable-graph.svg)](https://pypi.org/project/dash-extendable-graph/)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/dash-extendable-graph.svg)
[![PyPI - License](https://img.shields.io/pypi/l/dash-extendable-graph.svg)](./LICENSE)

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

### extendData

1. `updateData` [list]: a list of dictionaries, each dictionary representing trace data in a format matching `figure['data']` (e.g `dict(x=[1], y=[1])`)
2. `traceIndices` [list, optional]: identify the traces that should be extended. If the specified trace index does not exist, a (new) corresponding trace shall be appended to the figure.
3. `maxPoints` [number, optional]: define the maximum number of points to plot in the figure (per trace).

Based on the [`Plotly.extendTraces()` api](https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_api.js#884). However, the `updateData` key has been modified to better match the contents of `Plotly.plot()` (e.g. `Graph.figure`). Aside from following dash-familiar styling, this component allows the user to extend traces of different types in a single call (`Plotly.extendTraces()` takes a map of key:val and assumes all traces will share the same data keys).

### prependData

1. `updateData` [list]: a list of dictionaries, each dictionary representing trace data in a format matching `figure['data']` (e.g `dict(x=[1], y=[1])`)
2. `traceIndices` [list, optional]: identify the traces that should be extended. If the specified trace index does not exist, a (new) corresponding trace shall be appended to the figure.
3. `maxPoints` [number, optional]: define the maximum number of points to plot in the figure (per trace).

Based on the [`Plotly.prependTraces()` api](https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_api.js#L942). However, the `updateData` key has been modified to better match the contents of `Plotly.plot()` (e.g. `Graph.figure`). Aside from following dash-familiar styling, this component allows the user to prepend traces of different types in a single call (`Plotly.prependTraces()` takes a map of key:val and assumes all traces will share the same data keys).

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

[![lgtm](https://img.shields.io/lgtm/grade/javascript/g/bcliang/dash-extendable-graph.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/bcliang/dash-extendable-graph/context:javascript)

### Run locally

Run linting + integration tests in one command: 

```bash 
$ npm run test
```

Or run tests individually:

### Code style

Uses `flake8`, `eslint`, and `prettier`. Check `package.json`, `.eslintrc`, `.eslintignore` for configuration settings.
```bash
$ npm run lint
```

Also you can apply formatting settings.
```bash
$ npm run format
```

### Integration Tests

Integration tests for the component can be found in `tests/`
```bash
$ pytest
```

Selenium test runner configuration options are located in `pytest.ini` (e.g. `--webdriver`, `--headless`). See `dash[testing]` documentation for more information on built-ins provided by the dash test fixture.

Run individual integration tests based on the filename.
```bash
$ pytest tests/test_extend_maxpoints.py
```

## Continuous Integration

[![CI](https://github.com/bcliang/dash-extendable-graph/actions/workflows/python-js-package.yml/badge.svg)](https://github.com/bcliang/dash-extendable-graph/actions/workflows/python-js-package.yml)

This repository uses a github action to automate integration testing. Linting and Tests are triggered for each pull request created in the `master` branch.

## Package Publishing

[![Publish](https://github.com/bcliang/dash-extendable-graph/actions/workflows/publish.yml/badge.svg)](https://github.com/bcliang/dash-extendable-graph/actions/workflows/publish.yml)

This repository uses a github action to automate package deployment (in this case, compiling a source archive and binary wheel using `setuptools`). Publishing is triggered on each published release.
