/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Playground from 'component-playground';
import {ExtendableGraph} from '../lib';

const GraphExample = `const properties = {
    animate: true,
    id: 'my graph',
}
class Controller extends Component {
    constructor() {
        super();
        this.timer = this.timer.bind(this);
        this.state = {'x': 0, 'y': 1,};
    }
    timer() {
    	  this.setState({'x': (this.state.x + 1),
                       'y': 5*Math.random()});
    }
    componentDidMount() {
        window.setInterval(this.timer, 5000);
    }
    render() {
        var newData = [{'x': [this.state.x], 'y': [this.state.y]}];

        return (<div>
            <ExtendableGraph
                setProps={
                  (props) => {
                    this.setState({props})
                }}
                extendData={newData}
                {...properties}
            />
            <pre>{JSON.stringify(this.state, null, 2)}</pre>
            <pre>{JSON.stringify(newData)}</pre>
        </div>);
    }
}
ReactDOM.render(<Controller/>, mountNode);`;

const examples = [{name: 'ExtendableGraph', code: GraphExample}];

class App extends Component {
    render() {
        return (
            <div style={{fontFamily: 'Sans-Serif'}}>
                <h1>ExtendableGraph Demo</h1>

                {examples.map((example, index) => (
                    <div key={index}>
                        <div style={{marginBottom: 150}}>
                            <h3>{example.name}</h3>
                            <Playground
                                codeText={example.code}
                                scope={{
                                    Component,
                                    React,
                                    ReactDOM,
                                    ExtendableGraph,
                                }}
                                noRender={false}
                                theme={'xq-light'}
                            />
                        </div>
                        <hr style={{color: 'lightgrey'}} />
                    </div>
                ))}
            </div>
        );
    }
}
export default App;
