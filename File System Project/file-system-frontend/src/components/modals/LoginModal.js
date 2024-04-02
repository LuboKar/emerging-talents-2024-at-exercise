import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import style from "./LoginModal.css";

class LoginModal extends Component {
  constructor(probs) {
    super(probs);
    this.state = {
      formData: {
        email: "",
        password: "",
      },
      errors: {
        email: "",
        password: "",
        error: "",
      },
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  handleSubmit = async (event) => {
    const { formData } = this.state;
    const { history } = this.props;
    this.setState({ errors: {} });
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8080/authentication/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          const responseData = await response.json();
          this.setState((prevErrors) => ({
            errors: {
              ...prevErrors.errors,
              ...responseData,
            },
          }));
        } else {
          console.log("An error occurred:", response.statusText);
        }
        return;
      }

      const token = await response.json();
      localStorage.setItem("jwt", token.token);
      history.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  render() {
    const { closeLoginModal } = this.props;
    const { formData } = this.state;
    const { errors } = this.state;
    return (
      <div className="login-modal">
        <div className="modal-content">
          <span className="close-login" onClick={closeLoginModal}>
            &times;
          </span>
          <h2 className="modal-header-login">Login</h2>
          <form className="form-login" onSubmit={this.handleSubmit}>
            <label>{errors.error}</label>
            <br />
            <label>{errors.email}</label>
            <br />
            <input
              className="input-login"
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={this.handleChange}
            />
            <br />
            <label>{errors.password}</label>
            <br />
            <input
              className="input-login"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={this.handleChange}
            />
            <br />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(LoginModal);
