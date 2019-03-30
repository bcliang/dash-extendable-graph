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

    # extending a trace works
    def test_component(self):
        app = dash.Dash(__name__)

        app.scripts.config.serve_locally = True
        app.css.config.serve_locally = True
        app.layout = html.Div([
            deg.ExtendableGraph(
                id='trace_will_extend',
                config={'displaylogo': False},
                figure=dict(
                    data=[{'x': [0, 1, 2, 3, 4],
                           'y': [0, .5, 1, .5, 0]
                           }],
                )
            ),
            html.Div(id='output'),
            dcc.Interval(
                id='interval_extendablegraph_update',
                interval=10,
                n_intervals=0,
                max_intervals=1)
        ])

        @app.callback(Output('trace_will_extend', 'extendData'),
                      [Input('interval_extendablegraph_update', 'n_intervals')])
        def trace_will_extend(n_intervals):
            if n_intervals is None or n_intervals < 1:
                raise PreventUpdate

            x_new = [5, 6, 7, 8, 9]
            y_new = [.1, .2, .3, .4, .5]
            return [dict(x=x_new, y=y_new)]

        @app.callback(Output('output', 'children'),
                      [Input('trace_will_extend', 'extendData')],
                      [State('trace_will_extend', 'figure')])
        def display_data(trigger, figure):
            return json.dumps(figure['data'][0])

        self.startServer(app)

        graph = wait_for.wait_for_element_by_css_selector(
            self.driver, '#trace_will_extend')

        comparison = json.dumps(
            dict(
                x=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                y=[0, .5, 1, .5, 0, .1, .2, .3, .4, .5]
            )
        )

        output = wait_for.wait_for_text_to_equal(self.driver, '#output', comparison)
        #wait_for._wait_for(self.driver, comparison == output.text, timeout=10)
        #assert output.text == comparison
