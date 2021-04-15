import dash
import dash_html_components as html
import dash_extendable_graph as deg
from dash.dependencies import Input, Output, State, ClientsideFunction


def test_extg007_clientside(dash_duo):
    app = dash.Dash(__name__)
    initial_graph_title = "initial title"
    header = html.Div(
        id="header",
        children=[html.Button(id="update-title", children=["Update Title"])],
    )
    graph = html.Div(
        children=[
            deg.ExtendableGraph(
                id="deg-clientside-test",
                figure=dict(
                    layout=dict(title=initial_graph_title),
                    data=[
                        dict(x=[1, 2, 3, 4], y=[5, 4, 3, 6], line=dict(shape="spline"),)
                    ],
                ),
            )
        ],
    )

    app.clientside_callback(
        ClientsideFunction("pytest", "relayout"),
        Output("header", "style"),
        [Input("update-title", "n_clicks")],
        [State("deg-clientside-test", "figure")],
    )

    app.layout = html.Div([header, graph])

    dash_duo.start_server(app)

    dash_duo.wait_for_contains_text("#deg-clientside-test", initial_graph_title)
    dash_duo.wait_for_element("#update-title").click()
    dash_duo.wait_for_contains_text(
        "#deg-clientside-test", "{}-new".format(initial_graph_title)
    )
