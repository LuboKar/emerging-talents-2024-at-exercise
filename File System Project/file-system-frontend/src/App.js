import React from "react";
import MainPage from "./components/pages/MainPage.js"
import Dashboard from "./components/pages/Dashboard.js"
import { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import style from "./App.css"

class App extends Component{
    render(){
        return(
                <Router>
                    <Switch>
                        <Route exact path="/" component={MainPage}/>
                        <Route exact path="/dashboard" component={Dashboard} />
                        { <Route component={() => <Redirect to="/" />} /> }
                    </Switch>
                </Router> 
        )
    }
}

export default App;