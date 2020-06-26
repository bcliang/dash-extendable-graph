import pytest
from dash.testing.application_runners import import_app

import dash
import dash_html_components as html
import dash_extendable_graph as deg
from dash.dependencies import Input, Output, State, ClientsideFunction
from dash.exceptions import PreventUpdate
import time

TIMEOUT = 20

# component responsive flag behaves as expected. This test is pulled from dash-core-components:
# https://github.com/plotly/dash-core-components/blob/dev/tests/integration/graph/test_graph_responsive.py


class WaitForTimeout(Exception):
    """This should only be raised inside the `wait_for` function."""
    pass


def wait_for(condition_function, get_message=lambda: '', *args, **kwargs):
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

    if 'timeout' in kwargs:
        timeout = kwargs['timeout']
        del kwargs['timeout']
    else:
        timeout = TIMEOUT

    start_time = time.time()
    while time.time() < start_time + timeout:
        if wrapped_condition_function():
            return True
        time.sleep(0.5)

    raise WaitForTimeout(get_message())


def test_extg007_clientside(dash_duo):
    app = dash.Dash(__name__)
    initial_graph_title = "initial title"
    header = html.Div(
        id='header',
        children=[html.Button(id='update-title', children=['Update Title'])],
    )
    graph = html.Div(
        children=[
            deg.ExtendableGraph(
                id='deg-clientside-test',
                figure=dict(
                    layout=dict(title=initial_graph_title),
                    data=[
                        dict(
                            x=[1, 2, 3, 4],
                            y=[5, 4, 3, 6],
                            line=dict(shape='spline'),
                        )
                    ],
                ),
            )
        ],
    )

    app.clientside_callback(
        ClientsideFunction('pytest', 'relayout'),
        Output('header', 'style'),
        [Input('update-title', 'n_clicks')],
        [State('deg-clientside-test', 'figure')],
    )

    app.layout = html.Div(
        [header, graph]
    )

    dash_duo.start_server(app)

    dash_duo.wait_for_text_to_equal('#deg-clientside-test svg.main-svg.infolayer.g-gtitle', initial_graph_title)
    dash_duo.wait_for_element('#update-title').click()
    dash_duo.wait_for_text_to_equal('#deg-clientside-test svg.main-svg.infolayer.g-gtitle', "{}-new".format(initial_graph_title))
    dash_duo.wait_for_element("#update-title").click()
    dash_duo.wait_for_text_to_equal('#deg-clientside-test svg.main-svg.infolayer.g-gtitle', "{}-new-new".format(initial_graph_title))
