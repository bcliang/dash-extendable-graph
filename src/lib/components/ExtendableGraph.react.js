import React, {Component, Suspense, memo} from 'react';
import PropTypes from 'prop-types';

import {
    privatePropTypes,
    privateDefaultProps,
} from '../fragments/ExtendableGraph.props';
import graph from '../fragments/ExtendableGraph.react';

const EMPTY_DATA = [];

/**
 * ExtendableGraph can be used to render any plotly.js-powered data vis.
 *
 * You can define callbacks based on user interaction with ExtendableGraphs such
 * as hovering, clicking or selecting
 */
class ExtendableGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            prependData: EMPTY_DATA,
            extendData: EMPTY_DATA,
        };

        this.clearState = this.clearState.bind(this);
    }

    componentDidMount() {
        if (this.props.prependData) {
            this.setState({
                prependData: this.props.prependData,
            });
        }
        if (this.props.extendData) {
            this.setState({
                extendData: this.props.extendData,
            });
        }
    }

    componentWillUnmount() {
        this.setState({
            prependData: EMPTY_DATA,
            extendData: EMPTY_DATA,
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let prependData = this.state.prependData;
        let extendData = this.state.extendData;

        if (this.props.figure !== nextProps.figure) {
            prependData = EMPTY_DATA;
        }

        if (
            nextProps.prependData &&
            this.props.prependData !== nextProps.prependData
        ) {
            prependData = nextProps.prependData;
        } else {
            prependData = EMPTY_DATA;
        }

        if (prependData !== EMPTY_DATA) {
            this.setState({
                prependData,
            });
        }

        if (this.props.figure !== nextProps.figure) {
            extendData = EMPTY_DATA;
        }

        if (
            nextProps.extendData &&
            this.props.extendData !== nextProps.extendData
        ) {
            extendData = nextProps.extendData;
        } else {
            extendData = EMPTY_DATA;
        }

        if (extendData !== EMPTY_DATA) {
            this.setState({
                extendData,
            });
        }
    }

    clearState(dataKey) {
        this.setState((props) => {
            var data = props[dataKey];
            const res =
                data && data.length
                    ? {
                          [dataKey]: EMPTY_DATA,
                      }
                    : undefined;
            return res;
        });
    }

    render() {
        return (
            <GraphContainer
                {...this.props}
                prependData={this.state.prependData}
                extendData={this.state.extendData}
                clearState={this.clearState}
            />
        );
    }
}

const Graph = graph;

const GraphContainer = memo((props) => {
    const {className, id} = props;

    const extendedClassName = className
        ? 'dash-graph ' + className
        : 'dash-graph';

    return (
        <Suspense
            fallback={
                <div
                    id={id}
                    key={id}
                    className={`${extendedClassName} dash-graph--pending`}
                />
            }
        >
            <Graph {...props} className={extendedClassName} />
        </Suspense>
    );
});

ExtendableGraph.propTypes = {
    ...privatePropTypes,

    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string,

    /**
     * If True, the Plotly.js plot will be fully responsive to window resize
     * and parent element resize event. This is achieved by overriding
     * `config.responsive` to True, `figure.layout.autosize` to True and unsetting
     * `figure.layout.height` and `figure.layout.width`.
     * If False, the Plotly.js plot not be responsive to window resize and
     * parent element resize event. This is achieved by overriding `config.responsive`
     * to False and `figure.layout.autosize` to False.
     * If 'auto' (default), the Graph will determine if the Plotly.js plot can be made fully
     * responsive (True) or not (False) based on the values in `config.responsive`,
     * `figure.layout.autosize`, `figure.layout.height`, `figure.layout.width`.
     * This is the legacy behavior of the ExtendableGraph component.
     *
     * Needs to be combined with appropriate dimension / styling through the `style` prop
     * to fully take effect.
     */
    responsive: PropTypes.oneOf([true, false, 'auto']),

    /**
     * Data from latest click event. Read-only.
     */
    clickData: PropTypes.object,

    /**
     * Data from latest click annotation event. Read-only.
     */
    clickAnnotationData: PropTypes.object,

    /**
     * Data from latest hover event. Read-only.
     */
    hoverData: PropTypes.object,

    /**
     * If True, `clear_on_unhover` will clear the `hoverData` property
     * when the user "unhovers" from a point.
     * If False, then the `hoverData` property will be equal to the
     * data from the last point that was hovered over.
     */
    clear_on_unhover: PropTypes.bool,

    /**
     * Data from latest select event. Read-only.
     */
    selectedData: PropTypes.object,

    /**
     * Data from latest relayout event which occurs
     * when the user zooms or pans on the plot or other
     * layout-level edits. Has the form `{<attr string>: <value>}`
     * describing the changes made. Read-only.
     */
    relayoutData: PropTypes.object,

    /**
     * Data that should be appended to existing traces. Has the form
     * `[updateData, traceIndices, maxPoints]`, where `updateData` is an array
     * containing data objects to extend, `traceIndices` (optional) is an array
     * of trace indices that should be extended, and `maxPoints` (optional) is
     * either an integer defining the maximum number of points allowed or an
     * object with key:value pairs matching `updateData`
     * Reference the Plotly.extendTraces API for full usage:
     * https://plot.ly/javascript/plotlyjs-function-reference/#plotlyextendtraces
     */
    extendData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    /**
     * Data that should be prepended to existing traces. Has the form
     * `[updateData, traceIndices, maxPoints]`, where `updateData` is an array
     * containing data objects to prepend, `traceIndices` (optional) is an array
     * of trace indices that should be extended, and `maxPoints` (optional) is
     * either an integer defining the maximum number of points allowed or an
     * object with key:value pairs matching `updateData`
     * Reference the Plotly.prependTraces API for full usage:
     * https://plot.ly/javascript/plotlyjs-function-reference/#plotlyprependtraces
     */
    prependData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    /**
     * Data from latest restyle event which occurs
     * when the user toggles a legend item, changes
     * parcoords selections, or other trace-level edits.
     * Has the form `[edits, indices]`, where `edits` is an object
     * `{<attr string>: <value>}` describing the changes made,
     * and `indices` is an array of trace indices that were edited.
     * Read-only.
     */
    restyleData: PropTypes.array,

    /**
     * Plotly `figure` object. See schema:
     * https://plot.ly/javascript/reference
     *
     * `config` is set separately by the `config` property
     */
    figure: PropTypes.exact({
        data: PropTypes.arrayOf(PropTypes.object),
        layout: PropTypes.object,
        frames: PropTypes.arrayOf(PropTypes.object),
    }),

    /**
     * Generic style overrides on the plot div
     */
    style: PropTypes.object,

    /**
     * className of the parent div
     */
    className: PropTypes.string,

    /**
     * Beta: If true, animate between updates using
     * plotly.js's `animate` function
     */
    animate: PropTypes.bool,

    /**
     * Beta: Object containing animation settings.
     * Only applies if `animate` is `true`
     */
    animation_options: PropTypes.object,

    /**
     * Plotly.js config options.
     * See https://plot.ly/javascript/configuration-options/
     * for more info.
     */
    config: PropTypes.exact({
        /**
         * No interactivity, for export or image generation
         */
        staticPlot: PropTypes.bool,

        /**
         * Base URL for a Plotly cloud instance, if `showSendToCloud` is enabled
         */
        plotlyServerURL: PropTypes.string,

        /**
         * We can edit titles, move annotations, etc - sets all pieces of `edits`
         * unless a separate `edits` config item overrides individual parts
         */
        editable: PropTypes.bool,

        /**
         * A set of editable properties
         */
        edits: PropTypes.exact({
            /**
             * The main anchor of the annotation, which is the
             * text (if no arrow) or the arrow (which drags the whole thing leaving
             * the arrow length & direction unchanged)
             */
            annotationPosition: PropTypes.bool,

            /**
             * Just for annotations with arrows, change the length and direction of the arrow
             */
            annotationTail: PropTypes.bool,

            annotationText: PropTypes.bool,

            axisTitleText: PropTypes.bool,

            colorbarPosition: PropTypes.bool,

            colorbarTitleText: PropTypes.bool,

            legendPosition: PropTypes.bool,

            /**
             * Edit the trace name fields from the legend
             */
            legendText: PropTypes.bool,

            shapePosition: PropTypes.bool,

            /**
             * The global `layout.title`
             */
            titleText: PropTypes.bool,
        }),

        /**
         * DO autosize once regardless of layout.autosize
         * (use default width or height values otherwise)
         */
        autosizable: PropTypes.bool,

        /**
         * Whether to change layout size when the window size changes
         */
        responsive: PropTypes.bool,

        /**
         * Set the length of the undo/redo queue
         */
        queueLength: PropTypes.number,

        /**
         * If we DO autosize, do we fill the container or the screen?
         */
        fillFrame: PropTypes.bool,

        /**
         * If we DO autosize, set the frame margins in percents of plot size
         */
        frameMargins: PropTypes.number,

        /**
         * Mousewheel or two-finger scroll zooms the plot
         */
        scrollZoom: PropTypes.bool,

        /**
         * Double click interaction (false, 'reset', 'autosize' or 'reset+autosize')
         */
        doubleClick: PropTypes.oneOf([
            false,
            'reset',
            'autosize',
            'reset+autosize',
        ]),

        /**
         * New users see some hints about interactivity
         */
        showTips: PropTypes.bool,

        /**
         * Enable axis pan/zoom drag handles
         */
        showAxisDragHandles: PropTypes.bool,

        /**
         * Enable direct range entry at the pan/zoom drag points
         * (drag handles must be enabled above)
         */
        showAxisRangeEntryBoxes: PropTypes.bool,

        /**
         * Link to open this plot in plotly
         */
        showLink: PropTypes.bool,

        /**
         * If we show a link, does it contain data or just link to a plotly file?
         */
        sendData: PropTypes.bool,

        /**
         * Text appearing in the sendData link
         */
        linkText: PropTypes.string,

        /**
         * Display the mode bar (true, false, or 'hover')
         */
        displayModeBar: PropTypes.oneOf([true, false, 'hover']),

        /**
         * Should we include a modebar button to send this data to a
         * Plotly Cloud instance, linked by `plotlyServerURL`.
         * By default this is false.
         */
        showSendToCloud: PropTypes.bool,

        /**
         * Remove mode bar button by name.
         * All modebar button names at https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js
         * Common names include:
         * sendDataToCloud;
         * (2D) zoom2d, pan2d, select2d, lasso2d, zoomIn2d, zoomOut2d, autoScale2d, resetScale2d;
         * (Cartesian) hoverClosestCartesian, hoverCompareCartesian;
         * (3D) zoom3d, pan3d, orbitRotation, tableRotation, handleDrag3d, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d;
         * (Geo) zoomInGeo, zoomOutGeo, resetGeo, hoverClosestGeo;
         * hoverClosestGl2d, hoverClosestPie, toggleHover, resetViews.
         */
        modeBarButtonsToRemove: PropTypes.array,

        /**
         * Add mode bar button using config objects
         */
        modeBarButtonsToAdd: PropTypes.array,

        /**
         * Fully custom mode bar buttons as nested array,
         * where the outer arrays represents button groups, and
         * the inner arrays have buttons config objects or names of default buttons
         */
        modeBarButtons: PropTypes.any,

        /**
         * Modifications to how the toImage modebar button works
         */
        toImageButtonOptions: PropTypes.exact({
            /**
             * The file format to create
             */
            format: PropTypes.oneOf(['jpeg', 'png', 'webp', 'svg']),
            /**
             * The name given to the downloaded file
             */
            filename: PropTypes.string,
            /**
             * Width of the downloaded file, in px
             */
            width: PropTypes.number,
            /**
             * Height of the downloaded file, in px
             */
            height: PropTypes.number,
            /**
             * Extra resolution to give the file after
             * rendering it with the given width and height
             */
            scale: PropTypes.number,
        }),

        /**
         * Add the plotly logo on the end of the mode bar
         */
        displaylogo: PropTypes.bool,

        /**
         * Add the plotly logo even with no modebar
         */
        watermark: PropTypes.bool,

        /**
         * Increase the pixel ratio for Gl plot images
         */
        plotGlPixelRatio: PropTypes.number,

        /**
         * URL to topojson files used in geo charts
         */
        topojsonURL: PropTypes.string,

        /**
         * Mapbox access token (required to plot mapbox trace types)
         * If using an Mapbox Atlas server, set this option to '',
         * so that plotly.js won't attempt to authenticate to the public Mapbox server.
         */
        mapboxAccessToken: PropTypes.any,

        /**
         * The locale to use. Locales may be provided with the plot
         * (`locales` below) or by loading them on the page, see:
         * https://github.com/plotly/plotly.js/blob/master/dist/README.md#to-include-localization
         */
        locale: PropTypes.string,

        /**
         * Localization definitions, if you choose to provide them with the
         * plot rather than registering them globally.
         */
        locales: PropTypes.object,
    }),

    /**
     * Function that updates the state tree.
     */
    setProps: PropTypes.func,

    /**
     * Object that holds the loading state object coming from dash-renderer
     */
    loading_state: PropTypes.shape({
        /**
         * Determines if the component is loading or not
         */
        is_loading: PropTypes.bool,
        /**
         * Holds which property is loading
         */
        prop_name: PropTypes.string,
        /**
         * Holds the name of the component that is loading
         */
        component_name: PropTypes.string,
    }),
};
GraphContainer.propTypes = ExtendableGraph.propTypes;

ExtendableGraph.defaultProps = {
    ...privateDefaultProps,
    clickData: null,
    clickAnnotationData: null,
    hoverData: null,
    selectedData: null,
    relayoutData: null,
    extendData: null,
    prependData: null,
    restyleData: null,
    figure: {data: [], layout: {}, frames: []},
    responsive: 'auto',
    animate: false,
    animation_options: {
        frame: {
            redraw: false,
        },
        transition: {
            duration: 750,
            easing: 'cubic-in-out',
        },
    },
    clear_on_unhover: false,
    config: {},
};

export const graphPropTypes = ExtendableGraph.propTypes;
export const graphDefaultProps = ExtendableGraph.defaultProps;

export default ExtendableGraph;
