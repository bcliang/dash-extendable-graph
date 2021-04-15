import dash_extendable_graph as deg
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import random

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

app.layout = html.Div(
    [
        html.Div(
            [
                html.P("extend trace 0, add+extend trace 1"),
                deg.ExtendableGraph(
                    id="extendablegraph_example1",
                    figure=dict(
                        data=[{"x": [0, 1, 2, 3, 4], "y": [0, 0.5, 1, 0.5, 0]}],
                    ),
                ),
            ]
        ),
        html.Div(
            [
                html.P("extend only trace 0"),
                deg.ExtendableGraph(
                    id="extendablegraph_example2",
                    figure=dict(
                        data=[
                            {"x": [0, 1], "y": [0, 0.5], "mode": "lines+markers"},
                            {
                                "x": [0, 1, 2, 3, 4, 5],
                                "y": [1, 0.9, 0.8, 0.7, 0.6, 0.5],
                            },
                        ],
                    ),
                ),
            ]
        ),
        html.Div(
            [
                html.P("extend only trace 1 (specify via traceIndices)"),
                deg.ExtendableGraph(
                    id="extendablegraph_example3",
                    figure=dict(
                        data=[
                            {"x": [0, 1], "y": [0, 0.5]},
                            {
                                "x": [0, 1, 2, 3, 4, 5],
                                "y": [1, 0.9, 0.8, 0.7, 0.6, 0.5],
                                "mode": "lines+markers",
                            },
                        ],
                    ),
                ),
            ]
        ),
        html.Div(
            [
                html.P("add+extend trace 1, limit to 10 points per trace"),
                deg.ExtendableGraph(
                    id="extendablegraph_example4",
                    figure=dict(data=[{"x": [0, 1], "y": [0, 0.5]}],),
                ),
            ]
        ),
        html.Div(
            [
                html.P("extend 2 different trace types (x specified, x unspecified)"),
                deg.ExtendableGraph(
                    id="extendablegraph_example5",
                    figure=dict(data=[{"x": [0, 1], "y": [0, 0.5]}, {"y": [0.5]}],),
                ),
            ]
        ),
        dcc.Interval(
            id="interval_extendablegraph_update",
            interval=1000,
            n_intervals=0,
            max_intervals=20,
        ),
    ]
)


@app.callback(
    Output("extendablegraph_example1", "extendData"),
    [Input("interval_extendablegraph_update", "n_intervals")],
    [State("extendablegraph_example1", "figure")],
)
def update_extend_then_add(n_intervals, existing):
    x_new = existing["data"][0]["x"][-1] + 1

    return (
        [
            dict(x=[x_new], y=[random.random()]),
            dict(x=[x_new - 0.5, x_new], y=[random.random(), random.random()]),
        ],
        [1, 0],
    )


@app.callback(
    Output("extendablegraph_example2", "extendData"),
    [Input("interval_extendablegraph_update", "n_intervals")],
    [State("extendablegraph_example2", "figure")],
)
def update_extend_first_n_traces(n_intervals, existing):
    x_new = existing["data"][0]["x"][-1] + 1
    return [dict(x=[x_new], y=[random.random()])]


@app.callback(
    Output("extendablegraph_example3", "extendData"),
    [Input("interval_extendablegraph_update", "n_intervals")],
    [State("extendablegraph_example3", "figure")],
)
def update_extend_nth_trace(n_intervals, existing):
    x_new = existing["data"][1]["x"][-1] + 1
    return [dict(x=[x_new], y=[random.random()])], [1]


@app.callback(
    Output("extendablegraph_example4", "extendData"),
    [Input("interval_extendablegraph_update", "n_intervals")],
    [State("extendablegraph_example4", "figure")],
)
def update_add_then_extend_trace(n_intervals, existing):
    if len(existing["data"]) < 2:
        x_new = 0
    else:
        x_new = existing["data"][1]["x"][-1] + 1

    return [dict(x=[x_new], y=[random.random()])], [1], 10


@app.callback(
    Output("extendablegraph_example5", "extendData"),
    [Input("interval_extendablegraph_update", "n_intervals")],
    [State("extendablegraph_example5", "figure")],
)
def update_extend_multiple_trace_types(n_intervals, existing):
    x_new = existing["data"][0]["x"][-1] + 1
    return [dict(x=[x_new], y=[random.random()]), dict(y=[random.random()])], [0, 1]


if __name__ == "__main__":
    app.run_server(debug=True)
