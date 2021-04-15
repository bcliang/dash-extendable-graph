import dash_extendable_graph as deg
import dash
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
import dash_html_components as html
import dash_core_components as dcc
import json

# component will render


def test_extg008_prependData(dash_duo):
    app = dash.Dash(__name__)
    app.layout = html.Div(
        [
            deg.ExtendableGraph(
                id="trace_will_prepend",
                config={"displaylogo": False},
                figure=dict(data=[{"x": [0, 1, 2, 3, 4], "y": [0, 0.5, 1, 0.5, 0]}],),
            ),
            html.Div(id="output"),
            dcc.Interval(
                id="interval_extendablegraph_update",
                interval=10,
                n_intervals=0,
                max_intervals=1,
            ),
        ]
    )

    @app.callback(
        Output("trace_will_prepend", "prependData"),
        [Input("interval_extendablegraph_update", "n_intervals")],
    )
    def trace_will_prepend(n_intervals):
        if n_intervals is None or n_intervals < 1:
            raise PreventUpdate

        x_new = [5, 6, 7, 8, 9]
        y_new = [0.1, 0.2, 0.3, 0.4, 0.5]
        return [dict(x=x_new, y=y_new)]

    @app.callback(
        Output("output", "children"),
        [Input("trace_will_prepend", "prependData")],
        [State("trace_will_prepend", "figure")],
    )
    def display_data(trigger, figure):
        return json.dumps(figure["data"][0])

    dash_duo.start_server(app)
    dash_duo.find_element("#trace_will_prepend")

    comparison = json.dumps(
        dict(
            x=[5, 6, 7, 8, 9, 0, 1, 2, 3, 4],
            y=[0.1, 0.2, 0.3, 0.4, 0.5, 0, 0.5, 1, 0.5, 0],
        )
    )

    dash_duo.wait_for_text_to_equal("#output", comparison)


def test_extg009_prependData_repeatedly(dash_duo):
    app = dash.Dash(__name__)
    app.layout = html.Div(
        [
            deg.ExtendableGraph(
                id="trace_will_prepend",
                config={"displaylogo": False},
                figure=dict(data=[{"y": [0, 0.5, 1, 0.5, 0]}],),
            ),
            html.Div(id="output"),
            dcc.Interval(
                id="interval_extendablegraph_update",
                interval=500,
                n_intervals=0,
                max_intervals=2,
            ),
        ]
    )

    @app.callback(
        Output("trace_will_prepend", "prependData"),
        [Input("interval_extendablegraph_update", "n_intervals")],
    )
    def trace_will_prepend(n_intervals):
        if n_intervals is None or n_intervals < 1:
            raise PreventUpdate

        return [dict(y=[0.1, 0.2, 0.3, 0.4, 0.5])]

    @app.callback(
        Output("output", "children"),
        [Input("trace_will_prepend", "prependData")],
        [State("trace_will_prepend", "figure")],
    )
    def display_data(trigger, figure):
        print(json.dumps(figure["data"][0]))
        return json.dumps(figure["data"][0])

    dash_duo.start_server(app)
    dash_duo.find_element("#trace_will_prepend")

    comparison = json.dumps(
        dict(y=[0.1, 0.2, 0.3, 0.4, 0.5, 0.1, 0.2, 0.3, 0.4, 0.5, 0, 0.5, 1, 0.5, 0],)
    )

    dash_duo.wait_for_text_to_equal("#output", comparison)
