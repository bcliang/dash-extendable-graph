/* global Plotly:true */

if (!window.GRAPH_DIV_ID) {
    // the component id as specified in the integratio ntest
    window.GRAPH_DIV_ID = "deg-clientside-test";
}

window.dash_clientside = Object.assign({}, window.dash_clientside, {
    pytest: {
        /** 
         * pytest.relayout() this clientside function attempts to append 
         * "-new" onto the specified figure's title. 
         * 
         * Testing for changed text is easy to implement w/ dash[testing]
         * similar checks could be done for other props of figure.layout
         * 
         **/
        relayout: function(button_click, fig) {
            if (!button_click) {
                return window.dash_clientside.no_update;
            }
            const update = {
                "title.text": fig.layout.title.text + "-new"
            };

            Plotly.relayout(window.GRAPH_DIV_ID, update);

            return true;
        },
    }
});