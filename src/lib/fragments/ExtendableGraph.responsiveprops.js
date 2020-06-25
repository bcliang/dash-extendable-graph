/**
 * `autosize: true` causes Plotly.js to conform to the parent element size.
 * This is necessary for `dcc.Graph` call to `Plotly.Plots.resize(target)` to do something.
 *
 * Users can override this value for specific use-cases by explicitly passing `autoresize: true`
 * if `responsive` is not set to True.
 */
export const RESPONSIVE_LAYOUT = {
    autosize: true,
    height: undefined,
    width: undefined,
};

export const AUTO_LAYOUT = {};

export const UNRESPONSIVE_LAYOUT = {
    autosize: false,
};

/**
 * `responsive: true` causes Plotly.js to resize the graph on `window.resize`.
 * This is necessary for `dcc.Graph` call to `Plotly.Plots.resize(target)` to do something.
 *
 * Users can override this value for specific use-cases by explicitly passing `responsive: false`
 * if `responsive` is not set to True.
 */
export const RESPONSIVE_CONFIG = {
    responsive: true,
};
export const AUTO_CONFIG = {};

export const UNRESPONSIVE_CONFIG = {
    responsive: false,
};
