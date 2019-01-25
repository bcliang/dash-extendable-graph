# dash-extendable-graph

[![PyPI](https://img.shields.io/pypi/v/dash-extendable-graph.svg)](https://pypi.org/project/dash-extendable-graph/)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/dash-extendable-graph.svg)
[![PyPI - License](https://img.shields.io/pypi/l/dash-extendable-graph.svg)](./LICENSE)

dash-extendable-graph is a Dash component library. This library contains a single component: `ExtendableGraph`. The component is a fork of the Graph() component of [dash-core-components](https://github.com/plotly/dash-core-components), with an extra property (`extendData`) that allows Graph traces to be drawn through `Plotly.extendTraces()` instead of `Plotly.react()`.

## Installation

```bash
$ pip install dash-extendable-graph
```

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
              [State('extendablegraph_example', 'figure'),
               State('extendablegraph_example', 'extendData')])
def update_extendData(n_intervals, existing, info):
    x_new = existing['data'][0]['x'][-1] + 1
    y_new = random.random()
    return [dict(x=[x_new], y=[y_new])]


if __name__ == '__main__':
    app.run_server(debug=True)

```

## dash-component-boilerplate

Get started with:
1. Install Dash and its dependencies: https://dash.plot.ly/installation
2. Install dash-extendable-graph
3. Run `python usage.py`
4. Visit http://localhost:8050 in your web browser

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Install dependencies

If you have selected install_dependencies during the prompt, you can skip this part.

1. Install npm packages
    ```
    $ npm install
    ```
2. Create a virtual env and activate.
    ```
    $ virtualenv venv
    $ . venv/bin/activate
    ```
    _Note: venv\Scripts\activate for windows_

3. Install python packages required to build components.
    ```
    $ pip install -r requirements.txt
    ```
4. Install the python packages for testing (optional)
    ```
    $ pip install -r tests/requirements.txt
    ```

### Write your component code in `src/lib/components/ExtendableGraph.react.js`.

- The demo app is in `src/demo` and you will import your example component code into your demo app.
- Test your code in a Python environment:
    1. Build your code
        ```
        $ npm run build:all
        ```
    2. Run and modify the `usage.py` sample dash app:
        ```
        $ python usage.py
        ```
- Write tests for your component.
    - A sample test is available in `tests/test_usage.py`, it will load `usage.py` and you can then automate interactions with selenium.
    - Run the tests with `$ pytest tests`.
    - The Dash team uses these types of integration tests extensively. Browse the Dash component code on GitHub for more examples of testing (e.g. https://github.com/plotly/dash-core-components)
- Add custom styles to your component by putting your custom CSS files into your distribution folder (`dash_extendable_graph`).
    - Make sure that they are referenced in `MANIFEST.in` so that they get properly included when you're ready to publish your component.
    - Make sure the stylesheets are added to the `_css_dist` dict in `dash_extendable_graph/__init__.py` so dash will serve them automatically when the component suite is requested.
- [Review your code](./review_checklist.md)

### Create a production build and publish:

1. Build your code:
    ```
    $ npm run build:all
    ```
2. Create a Python tarball
    ```
    $ python setup.py sdist
    ```
    This distribution tarball will get generated in the `dist/` folder

3. Test your tarball by copying it into a new environment and installing it locally:
    ```
    $ pip install dash_extendable_graph-0.0.1.tar.gz
    ```

4. If it works, then you can publish the component to NPM and PyPI:
    1. Cleanup the dist folder (optional)
        ```
        $ rm -rf dist
        ```
    2. Publish on PyPI
        ```
        $ twine upload dist/*
        ```
    3. Publish on NPM (Optional if chosen False in `publish_on_npm`)
        ```
        $ npm publish
        ```
        _Publishing your component to NPM will make the JavaScript bundles available on the unpkg CDN. By default, Dash servers the component library's CSS and JS from the remote unpkg CDN, so if you haven't published the component package to NPM you'll need to set the `serve_locally` flags to `True` (unless you choose `False` on `publish_on_npm`). We will eventually make `serve_locally=True` the default, [follow our progress in this issue](https://github.com/plotly/dash/issues/284)._
5. Share your component with the community! https://community.plot.ly/c/dash
    1. Publish this repository to GitHub
    2. Tag your GitHub repository with the plotly-dash tag so that it appears here: https://github.com/topics/plotly-dash
    3. Create a post in the Dash community forum: https://community.plot.ly/c/dash
