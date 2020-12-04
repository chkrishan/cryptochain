import React ,{ Component } from 'react';
import { Link } from "react-router-dom";
import Transaction from './Transaction';
import {Button} from 'react-bootstrap';
import history from '../history';

const POOL_INTERVAL_MS = 10000;

class TransactionPool extends Component{

    state = {transactionPoolMap :{}};

    fetchTransactionPoolMap = ()=>{
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
           this.setState({transactionPoolMap:json});
        })
        .catch((err) => {
            console.error(err);
        });
    }

    fetchMineTransactions = ()=>{
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then((response) => {
            if(response.status ===200){
                alert('success');
                history.push('/blocks');
            }else{
                alert('the mine-transaction request did not complete')
            }
        })
        .catch((err) => {
            console.error(err);
        });
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();

       this.fetchPoolMapInterval = setInterval(()=>{
         this.fetchTransactionPoolMap();
        },POOL_INTERVAL_MS);
    }

    componentWillUnmount(){
      clearInterval(this.fetchPoolMapInterval);
    }

    render(){

        return(
            <div className="TransactionPool">
                <div><Link to="/">Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap)
                    .map((transaction)=>{
                        return (
                            <div key={transaction.id}>
                              <hr/>
                              <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                <hr/>
                <Button
                 variant="danger"
                 onClick={this.fetchMineTransactions}
                 >Mine Transactions</Button>
            </div>
        );
    }
}


export default TransactionPool;