if (!window.dash_clientside) {
    window.dash_clientside = {};
}

if (!window.GRAPH_DIV_ID) {
    window.GRAPH_DIV_ID = "deg-clientside-test";
}

window.dash_clientside.pytest = {
    relayout: function(button_click, fig) {
        console.log(fig)
        // update only values within nested objects
        const update = {
            "title.text": fig.layout.title.text + "-new"
        };

        //console.log("relayout: ", update);
        Plotly.relayout(window.GRAPH_DIV_ID, update);

        return true;
    },


};
