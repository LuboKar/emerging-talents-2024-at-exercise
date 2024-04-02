import React from "react";
import { Component } from "react";
import Navbar from "../navbar/Navbar";
import RegisterModal from "../modals/RegisterModal";
import LoginModal from "../modals/LoginModal.js";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import Auth from "../util/Authentication";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRegisterModalOpen: false,
      isLoginModalOpen: false,
    };
  }

  openRegisterModal = () => {
    this.setState({ isLoginModalOpen: false });
    this.setState({ isRegisterModalOpen: true });
  };

  openLoginModal = () => {
    this.setState({ isRegisterModalOpen: false });
    this.setState({ isLoginModalOpen: true });
  };

  closeRegisterModal = () => {
    this.setState({ isRegisterModalOpen: false });
  };

  closeLoginModal = () => {
    this.setState({ isLoginModalOpen: false });
  };

  render() {
    if (Auth.isAuthenticated()) {
      return <Redirect to="/dashboard" />;
    }
    const { isRegisterModalOpen, isLoginModalOpen } = this.state;
    const mainPageButtons = [
      { label: "Register", onClick: this.openRegisterModal },
      { label: "Login", onClick: this.openLoginModal },
    ];

    return (
      <div>
        <Navbar buttons={mainPageButtons} />
        <main>
          {isRegisterModalOpen && (
            <RegisterModal closeRegisterModal={this.closeRegisterModal} />
          )}
          {isLoginModalOpen && (
            <LoginModal closeLoginModal={this.closeLoginModal} />
          )}
        </main>
      </div>
    );
  }
}
export default MainPage;
