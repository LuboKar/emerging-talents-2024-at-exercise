import React from "react";
import { Component } from "react";
import logo from '../../images/logo.png';
import style from "./Navbar.css"
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";

class Navbar extends Component{
   

    handleClick = () => {
        if (this.props.history.location.pathname === '/') {
            window.location.reload();
        } else {
            this.props.history.push('/');
        }
    };

    render(){
        const { buttons } = this.props;
        return(
            <nav className="navbar">
                <img 
                    src={logo} 
                    alt="logo" 
                    className="navbar-logo"
                    onClick={this.handleClick}
                />
                <div className="buttons">   
                    {buttons.map((button, index) => (
                        <span key={index} onClick={button.onClick}>
                            {button.label}
                        </span>
                    ))}
                </div>
            </nav>
        )
    }
}

export default withRouter(Navbar);