import React,{Component} from 'react';
import logo from '../assets/logo.jpg';
import { Link } from "react-router-dom";

class App extends Component{

    state = {
        walletInfo:{}
    };

    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
        .then((response) => {
            return response.json();
        })
        .then((json)=>{
          return this.setState({walletInfo:json});
        })
        .catch((err) => {
            console.log(err);
        });
    }

render(){

    const {address,balance} = this.state.walletInfo;
    
    return (
        <div className="App"> 
            <img className="logo" src={logo}/>
            <br/>
            <div> Welcome To The BlockChain...</div>
            <br/>
            <div><Link to="/blocks" >Blocks</Link></div>
            <div><Link to="/conduct-transaction" >Conduct a Transaction</Link></div>
            <div><Link to="/transaction-pool" >Transaction Pool</Link></div>
            <div className="WalletInfo">
                  <div>Address : {address}</div>
                  <div>Balance : {balance}</div>
            </div>
          
        </div>
    );
}
}

export default App;