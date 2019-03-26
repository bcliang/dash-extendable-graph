import dash_extendable_graph as deg
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import random

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

app.layout = html.Div([
    deg.ExtendableGraph(
        id='extendablegraph_example1',
        figure=dict(
            data=[{'x': [0, 1, 2, 3, 4], 'y': [0, .5, 1, .5, 0]}],
        )
    ),
    deg.ExtendableGraph(
        id='extendablegraph_example2',
        figure=dict(
            data=[{'x': [0, 1], 'y': [0, .5],
                   'mode':'lines+markers'},
                  {'x': [0, 1, 2, 3, 4, 5], 'y': [1, .9, .8, .7, .6, .5]}],
        )
    ),
    deg.ExtendableGraph(
        id='extendablegraph_example3',
        figure=dict(
            data=[{'x': [0, 1], 'y': [0, .5]},
                  {'x': [0, 1, 2, 3, 4, 5], 'y': [1, .9, .8, .7, .6, .5],
                   'mode':'lines+markers'
                   }],
        )
    ),
    deg.ExtendableGraph(
        id='extendablegraph_example4',
        figure=dict(
            data=[{'x': [0, 1], 'y': [0, .5]}],
        )
    ),
    dcc.Interval(
        id='interval_extendablegraph_update',
        interval=1000,
        n_intervals=0,
        max_intervals=25),
])


@app.callback(Output('extendablegraph_example1', 'extendData'),
              [Input('interval_extendablegraph_update', 'n_intervals')],
              [State('extendablegraph_example1', 'figure')])
def update_extend_then_add(n_intervals, existing):
    x_new = existing['data'][0]['x'][-1] + 1
    y_new = random.random()
    return [dict(x=[x_new], y=[y_new]), dict(x=[x_new], y=[random.random()])]


@app.callback(Output('extendablegraph_example2', 'extendData'),
              [Input('interval_extendablegraph_update', 'n_intervals')],
              [State('extendablegraph_example2', 'figure')])
def update_extend_first_n_traces(n_intervals, existing):
    x_new = existing['data'][0]['x'][-1] + 1
    y_new = random.random()
    return [dict(x=[x_new], y=[y_new])]


@app.callback(Output('extendablegraph_example3', 'extendData'),
              [Input('interval_extendablegraph_update', 'n_intervals')],
              [State('extendablegraph_example3', 'figure')])
def update_extend_nth_trace(n_intervals, existing):
    x_new = existing['data'][1]['x'][-1] + 1
    y_new = random.random()
    return [dict(x=[x_new], y=[y_new])], [1]


@app.callback(Output('extendablegraph_example4', 'extendData'),
              [Input('interval_extendablegraph_update', 'n_intervals')],
              [State('extendablegraph_example4', 'figure')])
def update_add_then_extend_trace(n_intervals, existing):
    if len(existing['data']) < 2:
        x_new = 0
    else:
        x_new = existing['data'][1]['x'][-1] + 1

    y_new = random.random()
    return [dict(x=[x_new], y=[y_new])], [1], 10


if __name__ == '__main__':
    app.run_server(debug=True)
