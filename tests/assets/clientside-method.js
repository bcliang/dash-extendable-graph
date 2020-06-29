/* global Plotly:true */

if (!window.dash_clientside) {
    window.dash_clientside = {};
}

if (!window.GRAPH_DIV_ID) {
    // the component id as specified in the integratio ntest
    window.GRAPH_DIV_ID = "deg-clientside-test";
}

window.dash_clientside.pytest = {
    
    /** 
     * pytest.relayout() this clientside function attempts to append 
     * "-new" onto the specified figure's title. 
     * 
     * Testing for changed text is easy to implement w/ dash[testing]
     * similar checks could be done for other props of figure.layout
     * 
     **/
    relayout: function(button_click, fig) {
        const update = {
            "title.text": fig.layout.title + "-new"
        };

        Plotly.relayout(window.GRAPH_DIV_ID, update);

        return true;
    },


};
