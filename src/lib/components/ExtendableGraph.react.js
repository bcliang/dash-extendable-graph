import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {mergeDeepRight, isNil, type, omit, equals} from 'ramda';
import ResizeDetector from 'react-resize-detector';
import {
    privatePropTypes,
    privateDefaultProps,
} from '../fragments/ExtendableGraph.privateprops';
import {
    AUTO_LAYOUT,
    RESPONSIVE_LAYOUT,
    UNRESPONSIVE_LAYOUT,
    AUTO_CONFIG,
    RESPONSIVE_CONFIG,
    UNRESPONSIVE_CONFIG,
} from '../fragments/ExtendableGraph.responsiveprops';
import {filterEventData} from '../fragments/ExtendableGraph.events';
/* global Plotly:true */

/**
 * ExtendableGraph can be used to render any plotly.js-powered data vis.
 *
 * You can define callbacks based on user interaction with ExtendableGraphs such
 * as hovering, clicking or selecting
 */
class ExtendableGraph extends Component {
    constructor(props) {
        super(props);
        this.gd = React.createRef();
        this.bindEvents = this.bindEvents.bind(this);
        this._hasPlotted = false;
        this._prevGd = null;

        this.bindEvents = this.bindEvents.bind(this);
        this.getConfig = this.getConfig.bind(this);
        this.getConfigOverride = this.getConfigOverride.bind(this);
        this.getLayout = this.getLayout.bind(this);
        this.getLayoutOverride = this.getLayoutOverride.bind(this);
        this.graphResize = this.graphResize.bind(this);
        this.isResponsive = this.isResponsive.bind(this);
    }

    plot(props) {
        let {figure, config} = props;
        const {animate, animation_options, responsive} = props;
        const gd = this.gd.current;

        figure = props._dashprivate_transformFigure(figure, gd);
        config = props._dashprivate_transformConfig(config, gd);

        if (
            animate &&
            this._hasPlotted &&
            figure.data.length === gd.data.length
        ) {
            return Plotly.animate(gd, figure, animation_options);
        }

        const configClone = this.getConfig(config, responsive);
        const layoutClone = this.getLayout(figure.layout, responsive);

        gd.classList.add('dash-graph--pending');

        return Plotly.react(gd, {
            data: figure.data,
            layout: layoutClone,
            frames: figure.frames,
            config: configClone,
        }).then(() => {
            const gd = this.gd.current;

            // double-check gd hasn't been unmounted
            if (!gd) {
                return;
            }

            gd.classList.remove('dash-graph--pending');

            // in case we've made a new DOM element, transfer events
            if (this._hasPlotted && gd !== this._prevGd) {
                if (this._prevGd && this._prevGd.removeAllListeners) {
                    this._prevGd.removeAllListeners();
                    Plotly.purge(this._prevGd);
                }
                this._hasPlotted = false;
            }

            if (!this._hasPlotted) {
                this.bindEvents();
                this.graphResize(true);
                this._hasPlotted = true;
                this._prevGd = gd;
            }
        });
    }

    extend(props) {
        const {extendData} = props;
        const gd = this.gd.current;
        let updateData, traceIndices, maxPoints;

        if (extendData) {
            if (gd.data.length < 1) {
                // figure has no pre-existing data. redirect to plot()
                props.figure.data = extendData;
                return this.plot(props);
            }

            if (Array.isArray(extendData) && Array.isArray(extendData[0])) {
                [updateData, traceIndices, maxPoints] = extendData;
            } else {
                updateData = extendData;
            }

            if (!traceIndices) {
                traceIndices = Array.from(Array(updateData.length).keys());
            }

            function createDataObject(data) {
                const dataprops = Object.keys(data);
                const ret = {};
                for (let i = 0; i < dataprops.length; i++) {
                    ret[dataprops[i]] = [data[dataprops[i]]];
                }
                return ret;
            }

            gd.classList.add('dash-graph--pending');

            for (const [i, value] of updateData.entries()) {
                const updateObject = createDataObject(value);
                if (i < updateData.length - 1) {
                    if (traceIndices[i] < gd.data.length) {
                        Plotly.extendTraces(
                            gd,
                            updateObject,
                            [traceIndices[i]],
                            maxPoints
                        );
                    } else {
                        Plotly.addTraces(gd, value);
                    }
                } else {
                    if (traceIndices[i] < gd.data.length) {
                        return Plotly.extendTraces(
                            gd,
                            updateObject,
                            [traceIndices[i]],
                            maxPoints
                        ).then(() => {
                            const gd = this.gd.current;

                            // double-check gd hasn't been unmounted
                            if (!gd) {
                                return;
                            }
                            gd.classList.remove('dash-graph--pending');
                        });
                    }
                    return Plotly.addTraces(gd, value).then(() => {
                        const gd = this.gd.current;

                        // double-check gd hasn't been unmounted
                        if (!gd) {
                            return;
                        }
                        gd.classList.remove('dash-graph--pending');
                    });
                }
            }
        }

        return this.plot(props);
    }

    getConfig(config, responsive) {
        return mergeDeepRight(config, this.getConfigOverride(responsive));
    }

    getLayout(layout, responsive) {
        if (!layout) {
            return layout;
        }

        return mergeDeepRight(layout, this.getLayoutOverride(responsive));
    }

    getConfigOverride(responsive) {
        switch (responsive) {
            case false:
                return UNRESPONSIVE_CONFIG;
            case true:
                return RESPONSIVE_CONFIG;
            default:
                return AUTO_CONFIG;
        }
    }

    getLayoutOverride(responsive) {
        switch (responsive) {
            case false:
                return UNRESPONSIVE_LAYOUT;
            case true:
                return RESPONSIVE_LAYOUT;
            default:
                return AUTO_LAYOUT;
        }
    }

    isResponsive(props) {
        const {config, figure, responsive} = props;

        if (type(responsive) === 'Boolean') {
            return responsive;
        }

        return Boolean(
            config.responsive &&
                (!figure.layout ||
                    ((figure.layout.autosize ||
                        isNil(figure.layout.autosize)) &&
                        (isNil(figure.layout.height) ||
                            isNil(figure.layout.width))))
        );
    }

    graphResize(force = false) {
        if (!force && !this.isResponsive(this.props)) {
            return;
        }

        const gd = this.gd.current;
        if (!gd) {
            return;
        }

        gd.classList.add('dash-graph--pending');
        Plotly.Plots.resize(gd)
            .catch(() => {})
            .finally(() => gd.classList.remove('dash-graph--pending'));
    }

    bindEvents() {
        const {
            setProps,
            clear_on_unhover,
            relayoutData,
            restyleData,
            hoverData,
            selectedData,
        } = this.props;

        const gd = this.gd.current;

        gd.on('plotly_click', (eventData) => {
            const clickData = filterEventData(gd, eventData, 'click');
            if (!isNil(clickData)) {
                setProps({clickData});
            }
        });
        gd.on('plotly_clickannotation', (eventData) => {
            const clickAnnotationData = omit(
                ['event', 'fullAnnotation'],
                eventData
            );
            setProps({clickAnnotationData});
        });
        gd.on('plotly_hover', (eventData) => {
            const hover = filterEventData(gd, eventData, 'hover');
            if (!isNil(hover) && !equals(hover, hoverData)) {
                setProps({hoverData: hover});
            }
        });
        gd.on('plotly_selected', (eventData) => {
            const selected = filterEventData(gd, eventData, 'selected');
            if (!isNil(selected) && !equals(selected, selectedData)) {
                setProps({selectedData: selected});
            }
        });
        gd.on('plotly_deselect', () => {
            setProps({selectedData: null});
        });
        gd.on('plotly_relayout', (eventData) => {
            const relayout = filterEventData(gd, eventData, 'relayout');
            if (!isNil(relayout) && !equals(relayout, relayoutData)) {
                setProps({relayoutData: relayout});
            }
        });
        gd.on('plotly_restyle', (eventData) => {
            const restyle = filterEventData(gd, eventData, 'restyle');
            if (!isNil(restyle) && !equals(restyle, restyleData)) {
                setProps({restyleData: restyle});
            }
        });
        gd.on('plotly_unhover', () => {
            if (clear_on_unhover) {
                setProps({hoverData: null});
            }
        });
    }

    componentDidMount() {
        this.plot(this.props);
    }

    componentWillUnmount() {
        const gd = this.gd.current;
        if (gd && gd.removeAllListeners) {
            gd.removeAllListeners();
            if (this._hasPlotted) {
                Plotly.purge(gd);
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return (
            this.props.id !== nextProps.id ||
            JSON.stringify(this.props.style) !== JSON.stringify(nextProps.style)
        );
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const idChanged = this.props.id !== nextProps.id;
        if (idChanged) {
            /*
             * then the dom needs to get re-rendered with a new ID.
             * the graph will get updated in componentDidUpdate
             */
            return;
        }

        if (
            this.props.figure !== nextProps.figure ||
            this.props._dashprivate_transformConfig !==
                nextProps._dashprivate_transformConfig ||
            this.props._dashprivate_transformFigure !==
                nextProps._dashprivate_transformFigure
        ) {
            this.plot(nextProps);
        }

        if (this.props.extendData !== nextProps.extendData) {
            this.extend(nextProps);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.id !== this.props.id) {
            this.plot(this.props);
        }
    }

    render() {
        const {className, id, style, loading_state} = this.props;

        return (
            <div
                data-dash-is-loading={
                    (loading_state && loading_state.is_loading) || undefined
                }
                style={style}
                className={className}
            >
                <ResizeDetector
                    handleHeight={true}
                    handleWidth={true}
                    refreshMode="debounce"
                    refreshOptions={{trailing: true}}
                    refreshRate={50}
                    onResize={this.graphResize}
                />
                <div id={id}
                    key={id}
                    ref={this.gd} 
                    style={{height: '100%', width: '100%'}} 
                />
            </div>
        );
    }
}

const graphPropTypes = {
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

const graphDefaultProps = {
    ...privateDefaultProps,
    clickData: null,
    clickAnnotationData: null,
    hoverData: null,
    selectedData: null,
    relayoutData: null,
    extendData: null,
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
            ease: 'cubic-in-out',
        },
    },
    clear_on_unhover: false,
    config: {},
};

ExtendableGraph.propTypes = graphPropTypes;
ExtendableGraph.defaultProps = graphDefaultProps;

export default ExtendableGraph;
