# dash-extendable-graph

[![PyPI](https://img.shields.io/pypi/v/dash-extendable-graph.svg)](https://pypi.org/project/dash-extendable-graph/)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/dash-extendable-graph.svg)
[![PyPI - License](https://img.shields.io/pypi/l/dash-extendable-graph.svg)](./LICENSE)

dash-extendable-graph is a Dash component library. This library contains a single component: `ExtendableGraph`. The component is a fork of the Graph() component of [dash-core-components](https://github.com/plotly/dash-core-components) (v 0.43.0), with an extra property (`extendData`) that allows Graph traces to be drawn through `Plotly.extendTraces()` instead of `Plotly.react()`.

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
        config={'showAxisDragHandles': True,
                'showAxisRangeEntryBoxes': True,
                'modeBarButtonsToRemove': [
                    'sendDataToCloud',
                    'lasso2d',
                    'autoScale2d',
                    'hoverClosestCartesian',
                    'hoverCompareCartesian',
                    'toggleSpikelines'],
                'displaylogo': False,
                },
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
    return [dict(x=[x_new], y=[y_new])]


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
    $ python usage.py
    ```

## Tests
- Write tests for your component.
    - A sample test is available in `tests/test_usage.py`, it will load `usage.py` and you can then automate interactions with selenium.
    - Run the tests with `$ pytest tests`.
    - The Dash team uses these types of integration tests extensively. Browse the Dash component code on GitHub for more examples of testing (e.g. https://github.com/plotly/dash-core-components)
- Add custom styles to your component by putting your custom CSS files into your distribution folder (`dash_extendable_graph`).
    - Make sure that they are referenced in `MANIFEST.in` so that they get properly included when you're ready to publish your component.
    - Make sure the stylesheets are added to the `_css_dist` dict in `dash_extendable_graph/__init__.py` so dash will serve them automatically when the component suite is requested.
- [Review your code](./review_checklist.md)

### Create a production build and publish:

    ```bash
    $ npm run build:all
    $ rm -rf dist
    $ python setup.py sdist
    $ twine upload dist/*
    $ npm publish
    ```

Test your tarball by copying it into a new environment and installing it locally:
    ```
    $ pip install dash_extendable_graph-X.X.X.tar.gz
    ```

_Publishing your component to NPM will make the JavaScript bundles available on the unpkg CDN. By default, Dash servers the component library's CSS and JS from the remote unpkg CDN, so if you haven't published the component package to NPM you'll need to set the `serve_locally` flags to `True` (unless you choose `False` on `publish_on_npm`). We will eventually make `serve_locally=True` the default, [follow our progress in this issue](https://github.com/plotly/dash/issues/284)._
