# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class ExtendableGraph(Component):
    """A ExtendableGraph component.


Keyword arguments:
- id (string; optional): The ID of this component, used to identify dash components
in callbacks. The ID needs to be unique across all of the
components in an app.
- clickData (dict; optional): Data from latest click event. Read-only.
- clickAnnotationData (dict; optional): Data from latest click annotation event. Read-only.
- hoverData (dict; optional): Data from latest hover event. Read-only.
- clear_on_unhover (boolean; optional): If True, `clear_on_unhover` will clear the `hoverData` property
when the user "unhovers" from a point.
If False, then the `hoverData` property will be equal to the
data from the last point that was hovered over.
- selectedData (dict; optional): Data from latest select event. Read-only.
- relayoutData (dict; optional): Data from latest relayout event which occurs
when the user zooms or pans on the plot or other
layout-level edits. Has the form `{<attr string>: <value>}`
describing the changes made. Read-only.
- extendData (list | dict; optional): Data that should be appended to existing traces. Has the form
`[updateData, traceIndices, maxPoints]`, where `updateData` is an object
containing the data to extend, `traceIndices` (optional) is an array of
trace indices that should be extended, and `maxPoints` (optional) is
either an integer defining the maximum number of points allowed or an
object with key:value pairs matching `updateData`
Reference the Plotly.extendTraces API for full usage:
https://plot.ly/javascript/plotlyjs-function-reference/#plotlyextendtraces
- restyleData (list; optional): Data from latest restyle event which occurs
when the user toggles a legend item, changes
parcoords selections, or other trace-level edits.
Has the form `[edits, indices]`, where `edits` is an object
`{<attr string>: <value>}` describing the changes made,
and `indices` is an array of trace indices that were edited.
Read-only.
- figure (optional): Plotly `figure` object. See schema:
https://plot.ly/javascript/reference
Only supports `data` array and `layout` object.
`config` is set separately by the `config` property,
and `frames` is not supported.
- style (dict; optional): Generic style overrides on the plot div
- className (string; optional): className of the parent div
- animate (boolean; optional): Beta: If true, animate between updates using
plotly.js's `animate` function
- animation_options (dict; optional): Beta: Object containing animation settings.
Only applies if `animate` is `true`
- config (optional): Plotly.js config options.
See https://plot.ly/javascript/configuration-options/
for more info.
- loading_state (optional): Object that holds the loading state object coming from dash-renderer. loading_state has the following type: dict containing keys 'is_loading', 'prop_name', 'component_name'.
Those keys have the following types:
  - is_loading (boolean; optional): Determines if the component is loading or not
  - prop_name (string; optional): Holds which property is loading
  - component_name (string; optional): Holds the name of the component that is loading"""
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, clickData=Component.UNDEFINED, clickAnnotationData=Component.UNDEFINED, hoverData=Component.UNDEFINED, clear_on_unhover=Component.UNDEFINED, selectedData=Component.UNDEFINED, relayoutData=Component.UNDEFINED, extendData=Component.UNDEFINED, restyleData=Component.UNDEFINED, figure=Component.UNDEFINED, style=Component.UNDEFINED, className=Component.UNDEFINED, animate=Component.UNDEFINED, animation_options=Component.UNDEFINED, config=Component.UNDEFINED, loading_state=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'clickData', 'clickAnnotationData', 'hoverData', 'clear_on_unhover', 'selectedData', 'relayoutData', 'extendData', 'restyleData', 'figure', 'style', 'className', 'animate', 'animation_options', 'config', 'loading_state']
        self._type = 'ExtendableGraph'
        self._namespace = 'dash_extendable_graph'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'clickData', 'clickAnnotationData', 'hoverData', 'clear_on_unhover', 'selectedData', 'relayoutData', 'extendData', 'restyleData', 'figure', 'style', 'className', 'animate', 'animation_options', 'config', 'loading_state']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(ExtendableGraph, self).__init__(**args)
