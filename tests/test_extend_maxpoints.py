from dash.testing.application_runners import import_app
from multiprocessing import Value

import dash_extendable_graph as deg
import dash
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
import dash_html_components as html
import dash_core_components as dcc
import random
import json

# extending a trace works


def test_extg002_define_maxpoints(dash_duo):
    app = dash.Dash(__name__)
    app.layout = html.Div([
        deg.ExtendableGraph(
            id='trace_will_extend_with_window',
            figure=dict(
                data=[dict(y=[0]),
                      dict(x=[0, 1, 2, 3, 4], y=[0, 1, 2, 3, 4])],
            )
        ),
        html.Div(id='output'),
        dcc.Interval(
            id='interval_extendablegraph_update',
            interval=500,
            n_intervals=0,
            max_intervals=8)
    ])

    @app.callback(Output('trace_will_extend_with_window', 'extendData'),
                  [Input('interval_extendablegraph_update', 'n_intervals')],
                  [State('trace_will_extend_with_window', 'figure')])
    def trace_will_extend_then_add(n_intervals, figure):
        if n_intervals is None or n_intervals < 1:
            raise PreventUpdate

        x_new = figure['data'][1]['x'][-1] + 1
        y_new = figure['data'][1]['y'][-1] + 1
        print([dict(x=[x_new], y=[y_new])])
        return [dict(x=[x_new], y=[y_new])], [1], 8

    @app.callback(Output('output', 'children'),
                  [Input('trace_will_extend_with_window', 'extendData')],
                  [State('trace_will_extend_with_window', 'figure')])
    def display_data(trigger, figure):
        return json.dumps(figure['data'])

    dash_duo.start_server(app)
    graph = dash_duo.find_element("#trace_will_extend_with_window")

    comparison = json.dumps([
        dict(y=[0]),
        dict(
            x=[5, 6, 7, 8, 9, 10, 11, 12],
            y=[5, 6, 7, 8, 9, 10, 11, 12]
        ),
    ])

    dash_duo.wait_for_text_to_equal('#output', comparison)
