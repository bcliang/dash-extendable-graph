from pytest_dash import (wait_for)
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
    def test_multiple_trace_types(self):
        app = dash.Dash(__name__)

        app.scripts.config.serve_locally = True
        app.css.config.serve_locally = True
        app.layout = html.Div([
            deg.ExtendableGraph(id='multi_trace_types', figure=dict(data=[])),
            html.Div(id='output'),
            dcc.Interval(
                id='interval_extendablegraph_update',
                interval=100,
                n_intervals=0,
                max_intervals=1)
        ])

        @app.callback(Output('multi_trace_types', 'extendData'),
                      [Input('interval_extendablegraph_update', 'n_intervals')])
        def trace_will_extend(n_intervals):
            if n_intervals is None or n_intervals < 1:
                raise PreventUpdate

            return [dict(x=[5, 6, 7, 8, 9], y=[.1, .2, .3, .4, .5]),
                    dict(y=[1, 2, 3, 4, 5])]

        @app.callback(Output('output', 'children'),
                      [Input('multi_trace_types', 'extendData')],
                      [State('multi_trace_types', 'figure')])
        def display_data(trigger, figure):
            if figure is None:
                raise PreventUpdate

            return json.dumps(figure['data'])

        self.startServer(app)

        graph = wait_for.wait_for_element_by_css_selector(
            self.driver, '#multi_trace_types')

        comparison = json.dumps(
            [dict(x=[5, 6, 7, 8, 9],
                  y=[.1, .2, .3, .4, .5]),
             dict(y=[1, 2, 3, 4, 5])]
        )

        output = wait_for.wait_for_text_to_equal(self.driver, '#output', comparison)
