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
        config={'showAxisDragHandles': True,
                'showAxisRangeEntryBoxes': True,
                'modeBarButtonsToRemove': [
                    'sendDataToCloud',
                    'lasso2d',
                    'autoScale2d',
                    'hoverClosestCartesian',
                    'hoverCompareCartesian',
                    'toggleSpikelines'],
                'displaylogo': False,
                },
        figure=dict(
            data=[{'x': [0, 1, 2, 3, 4],
                   'y': [0, .5, 1, .5, 0],
                   'mode':'lines+markers'
                   }],
        )
    ),
    deg.ExtendableGraph(
        id='extendablegraph_example2',
        config={'showAxisDragHandles': True,
                'showAxisRangeEntryBoxes': True,
                'modeBarButtonsToRemove': [
                    'sendDataToCloud',
                    'lasso2d',
                    'autoScale2d',
                    'hoverClosestCartesian',
                    'hoverCompareCartesian',
                    'toggleSpikelines'],
                'displaylogo': False,
                },
        figure=dict(
            data=[{'x': [0, 1],
                   'y': [0, .5],
                   'mode':'lines+markers'
                   },
                  {'x': [0, 1, 2, 3, 4, 5],
                   'y': [1, .9, .8, .7, .6, .5],
                   'mode':'lines+markers'
                   }],
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


if __name__ == '__main__':
    app.run_server(debug=True)
