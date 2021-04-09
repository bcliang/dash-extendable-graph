import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {mergeDeepRight, isNil, type, omit, equals} from 'ramda';
import ResizeDetector from 'react-resize-detector';
import {
    AUTO_LAYOUT,
    RESPONSIVE_LAYOUT,
    UNRESPONSIVE_LAYOUT,
    AUTO_CONFIG,
    RESPONSIVE_CONFIG,
    UNRESPONSIVE_CONFIG,
} from './ExtendableGraph.responsiveprops';
import {
    graphPropTypes,
    graphDefaultProps,
} from '../components/ExtendableGraph.react';
import {filterEventData} from './ExtendableGraph.events';

/* global Plotly:true */

/**
 * ExtendableGraph can be used to render any plotly.js-powered data vis.
 */
class Graph extends Component {
    constructor(props) {
        super(props);
        this.gd = React.createRef();
        this._hasPlotted = false;
        this._prevGd = null;

        this.bindEvents = this.bindEvents.bind(this);
        this.getConfig = this.getConfig.bind(this);
        this.getConfigOverride = this.getConfigOverride.bind(this);
        this.getLayout = this.getLayout.bind(this);
        this.getLayoutOverride = this.getLayoutOverride.bind(this);
        this.graphResize = this.graphResize.bind(this);
        this.isResponsive = this.isResponsive.bind(this);

        this.state = {override: {}, originals: {}};
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

    mergeTraces(props, dataKey, plotlyFnKey) {
        const data = props[dataKey];
        const gd = this.gd.current;

        let updateData, traceIndices, maxPoints;

        if (Array.isArray(data) && Array.isArray(data[0])) {
            [updateData, traceIndices, maxPoints] = data;
        } else {
            updateData = data;
        }

        if (updateData.length === 0) {
            return;
        }

        if (gd.data.length < 1) {
            // figure has no pre-existing data. redirect to plot()
            props.figure.data = updateData;
            props.clearState(dataKey);
            this.plot(props);
            return;
        }

        // if no traceIndices specified, generate them based on the length of the input data
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

        for (const [i, value] of updateData.entries()) {
            // extend/add each trace within updateData
            const updateObject = createDataObject(value);
            if (i < updateData.length - 1) {
                if (traceIndices[i] < gd.data.length) {
                    Plotly[plotlyFnKey](
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
                    Plotly[plotlyFnKey](
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
                } else {
                    Plotly.addTraces(gd, value).then(() => {
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
        props.clearState(dataKey);
        return;
    }

    getConfig(config, responsive) {
        return mergeDeepRight(config, this.getConfigOverride(responsive));
    }

    getLayout(layout, responsive) {
        if (!layout) {
            return layout;
        }
        const override = this.getLayoutOverride(responsive);
        const {override: prev_override, originals: prev_originals} = this.state;
        // Store the original data that we're about to override
        const originals = {};
        for (const key in override) {
            if (layout[key] !== prev_override[key]) {
                originals[key] = layout[key];
            } else if (
                Object.prototype.hasOwnProperty.call(prev_originals, key)
            ) {
                originals[key] = prev_originals[key];
            }
        }
        this.setState({override, originals});
        // Undo the previous override, but only for keys that the user did not change
        for (const key in prev_originals) {
            if (layout[key] === prev_override[key]) {
                layout[key] = prev_originals[key];
            }
        }
        // Apply the current override
        for (const key in override) {
            layout[key] = override[key];
        }
        return layout; // not really a clone
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
        if (this.props.prependData) {
            this.mergeTraces(this.props, 'prependData', 'prependTraces');
        }
        if (this.props.extendData) {
            this.mergeTraces(this.props, 'extendData', 'extendTraces');
        }
        if (this.props.prependData?.length || this.props.extendData?.length) {
            this.props._dashprivate_onFigureModified(this.props.figure);
        }
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
            JSON.stringify(this.props.style) !==
                JSON.stringify(nextProps.style) ||
            JSON.stringify(this.props.loading_state) !==
                JSON.stringify(nextProps.loading_state)
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

        if (this.props.prependData !== nextProps.prependData) {
            this.mergeTraces(nextProps, 'prependData', 'prependTraces');
        }

        if (this.props.extendData !== nextProps.extendData) {
            this.mergeTraces(nextProps, 'extendData', 'extendTraces');
        }

        if (this.props.prependData?.length || this.props.extendData?.length) {
            this.props._dashprivate_onFigureModified(this.props.figure);
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
                <div
                    id={id}
                    key={id}
                    ref={this.gd}
                    style={{height: '100%', width: '100%'}}
                />
            </div>
        );
    }
}
Graph.propTypes = {
    ...graphPropTypes,
    prependData: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.array, PropTypes.object])
    ),
    extendData: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.array, PropTypes.object])
    ),
    clearState: PropTypes.func.isRequired,
};
Graph.defaultProps = {
    ...graphDefaultProps,
    prependData: [],
    extendData: [],
};

export default Graph;
