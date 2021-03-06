import pytest
import dash
import dash_html_components as html
import dash_extendable_graph as deg
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
import time

TIMEOUT = 20

# component responsive flag behaves as expected. This test is pulled from dash-core-components:
# https://github.com/plotly/dash-core-components/blob/dev/tests/integration/graph/test_graph_responsive.py


class WaitForTimeout(Exception):
    """This should only be raised inside the `wait_for` function."""

    pass


def wait_for(condition_function, get_message=lambda: "", *args, **kwargs):
    """
    Waits for condition_function to return True or raises WaitForTimeout.
    :param (function) condition_function: Should return True on success.
    :param args: Optional args to pass to condition_function.
    :param kwargs: Optional kwargs to pass to condition_function.
        if `timeout` is in kwargs, it will be used to override TIMEOUT
    :raises: WaitForTimeout If condition_function doesn't return True in time.
    Usage:
        def get_element(selector):
            # some code to get some element or return a `False`-y value.
        selector = '.js-plotly-plot'
        try:
            wait_for(get_element, selector)
        except WaitForTimeout:
            self.fail('element never appeared...')
        plot = get_element(selector)  # we know it exists.
    """

    def wrapped_condition_function():
        """We wrap this to alter the call base on the closure."""
        if args and kwargs:
            return condition_function(*args, **kwargs)
        if args:
            return condition_function(*args)
        if kwargs:
            return condition_function(**kwargs)
        return condition_function()

    if "timeout" in kwargs:
        timeout = kwargs["timeout"]
        del kwargs["timeout"]
    else:
        timeout = TIMEOUT

    start_time = time.time()
    while time.time() < start_time + timeout:
        if wrapped_condition_function():
            return True
        time.sleep(0.5)

    raise WaitForTimeout(get_message())


@pytest.mark.parametrize("responsive", [True, False])  # reduce iterations: None = False
@pytest.mark.parametrize("autosize", [True, False])  # reduce iterations -- None = True
@pytest.mark.parametrize("height", [600, None])
@pytest.mark.parametrize("is_responsive", [True, False, "auto"])
def test_extg006_responsive(dash_duo, responsive, autosize, height, is_responsive):
    width = 600  # reduce test iterations, just check vs height (ignore width)
    app = dash.Dash(__name__)

    header_style = dict(padding="10px", backgroundColor="yellow", flex="0 0 100px")

    graph_style = dict(padding="10px", backgroundColor="red", flex="1 0 0")

    card_style = dict(
        display="flex",
        flexFlow="column",
        backgroundColor="green",
        padding="10px",
        height="500px",
        width="1000px",
    )

    header = html.Div(
        id="header",
        style=header_style,
        children=[html.Button(id="resize", children=["Resize"])],
    )

    graph = html.Div(
        style=graph_style,
        children=[
            deg.ExtendableGraph(
                id="graph",
                responsive=is_responsive,
                style=dict(height="100%", width="100%"),
                config=dict(responsive=responsive),
                figure=dict(
                    layout=dict(autosize=autosize, height=height, width=width),
                    data=[
                        dict(x=[1, 2, 3, 4], y=[5, 4, 3, 6], line=dict(shape="spline"),)
                    ],
                ),
            )
        ],
    )

    app.layout = html.Div(
        [
            html.Div(
                [
                    "responsive: {}, ".format(responsive),
                    "autosize: {}, ".format(autosize),
                    "height: {}, ".format(height),
                    "width: {}, ".format(width),
                    "is_responsive: {}".format(is_responsive),
                ]
            ),
            html.Div(id="card", style=card_style, children=[header, graph]),
        ]
    )

    @app.callback(
        Output("header", "style"),
        [Input("resize", "n_clicks")],
        [State("header", "style")],
    )
    def resize(n_clicks, style):
        if n_clicks is None:
            raise PreventUpdate

        return dict(style, **dict(flex="0 0 200px"))

    dash_duo.start_server(app)

    # autosize=true|udefined will make the graph fit its parent on first render, responsive has no impact on that behavior
    #
    # responsive=true will make the graph resize only if autosize=true|undefined, interestingly enough, responsive=undefined
    # behaves the same as responsive=false (https://github.com/plotly/plotly.js/blob/master/src/plot_api/plot_config.js#L122)

    initial_responsive = is_responsive is True or (
        is_responsive == "auto"
        and autosize is not False
        and (height is None or width is None)
    )

    resize_responsive = is_responsive is True or (
        is_responsive == "auto"
        and responsive is True
        and autosize is not False
        and (height is None or width is None)
    )

    initial_height = (
        360
        if (initial_responsive and (height is None or is_responsive is True))
        else 450
        if height is None
        else height
    )

    resize_height = (
        260
        if (resize_responsive and (height is None or is_responsive is True))
        else initial_height
        if height is None
        else height
    )

    wait_for(
        # 500px card minus (100px header + 20px padding) minus (20px padding on container) -> 360px left
        lambda: dash_duo.wait_for_element("#graph svg.main-svg").size.get("height", -1)
        == initial_height,
        lambda: "initial graph height {}, expected {}".format(
            dash_duo.wait_for_element("#graph svg.main-svg").size.get("height", -1),
            initial_height,
        ),
    )
    dash_duo.wait_for_element("#resize").click()

    wait_for(
        # 500px card minus (200px header + 20px padding) minus (20px padding on container) -> 260px left
        lambda: dash_duo.wait_for_element("#graph svg.main-svg").size.get("height", -1)
        == resize_height,
        lambda: "resized graph height {}, expected {}".format(
            dash_duo.wait_for_element("#graph svg.main-svg").size.get("height", -1),
            resize_height,
        ),
    )
