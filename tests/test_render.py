from pytest_dash import (wait_for)
#from pytest_dash.application_runners import (import_app)
from .IntegrationTests import IntegrationTests
from multiprocessing import Value

import dash_extendable_graph as deg
import dash
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
import dash_html_components as html
import dash_core_components as dcc
import random
import json


class Tests(IntegrationTests):
    def setUp(self):
        pass

    # Basic test for the component rendering.
    def test_render_component(self):
        app = dash.Dash(__name__)

        app.scripts.config.serve_locally = True
        app.css.config.serve_locally = True
        app.layout = html.Div([
            deg.ExtendableGraph(
                id='extendablegraph_id',
                config={'displaylogo': False},
                figure=dict(
                    data=[{'x': [0, 1, 2, 3, 4],
                           'y': [0, .5, 1, .5, 0],
                           'mode':'lines+markers'
                           }],
                )
            ),
            html.Div(id='output'),
        ])

        @app.callback(Output('output', 'children'), [Input('extendablegraph_id', 'figure')])
        def display_data(figure):
            return json.dumps(figure['data'][0]['x'])

        self.startServer(app)

        graph = wait_for.wait_for_element_by_css_selector(
            self.driver, '#extendablegraph_id')
        output = wait_for.wait_for_text_to_equal(
            self.driver, '#output', '[0, 1, 2, 3, 4]')
