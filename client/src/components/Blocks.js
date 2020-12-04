// import { json } from 'express';
import React,{Component} from 'react';
import Block from './Block.js';
import { Link } from "react-router-dom";

class Blocks extends Component{

    state = {blocks : []};

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
        .then((response) => {
            return response.json();
        })
        .then((json)=>{
            return this.setState({blocks:json})
        })
        .catch((err) => {
            console.error(err);
        });
    }

    render(){

        console.log('this.state',this.state);

        return (
            <div>
                <div><Link to="/">Home</Link></div>
                <h3>Blocks</h3>
                <div>
                     {
                     this.state.blocks.map((block)=>{
                        return (
                        <Block key={block.hash} block={block} />
                        ) 
                     })
                     
                     } </div>
            </div>
        );
    }
}

export default Blocks;