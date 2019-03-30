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
    def test_extend_trace_selectively(self):
        app = dash.Dash(__name__)

        app.scripts.config.serve_locally = True
        app.css.config.serve_locally = True
        app.layout = html.Div([
            deg.ExtendableGraph(id='extend_trace_selectively',
                                figure=dict(data=[
                                    dict(y=[0]),
                                    dict(y=[1]),
                                ])),
            html.Div(id='output'),
            dcc.Interval(
                id='interval_extendablegraph_update',
                interval=100,
                n_intervals=0,
                max_intervals=1)
        ])

        @app.callback(Output('extend_trace_selectively', 'extendData'),
                      [Input('interval_extendablegraph_update', 'n_intervals')],
                      [State('extend_trace_selectively', 'figure')])
        def trace_will_extend_selectively(n_intervals, figure):
            if n_intervals is None or n_intervals < 1:
                raise PreventUpdate

            return [dict(y=[2])], [1]

        @app.callback(Output('output', 'children'),
                      [Input('extend_trace_selectively', 'extendData')],
                      [State('extend_trace_selectively', 'figure')])
        def display_data(trigger, figure):
            if figure is None:
                raise PreventUpdate

            return json.dumps(figure['data'])

        self.startServer(app)

        graph = wait_for.wait_for_element_by_css_selector(
            self.driver, '#extend_trace_selectively')

        comparison = json.dumps(
            [dict(y=[0]),
             dict(y=[1, 2])]
        )

        output = wait_for.wait_for_text_to_equal(self.driver, '#output', comparison)
