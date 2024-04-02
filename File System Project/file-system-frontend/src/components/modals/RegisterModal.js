import React from "react";
import { Component } from "react";
import style from "./RegisterModal.css";

class RegisterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      },
      errors: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        error: "",
      },
      success: "",
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
    event.preventDefault();
    const { formData } = this.state;
    this.setState({ errors: {}, success: "" });

    try {
      const response = await fetch(
        "http://localhost:8080/authentication/register",
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

      const data = await response.json();
      this.setState((prevSuccess) => ({
        success: data,
      }));
    } catch (error) {
      console.error("Failed to register user:", error);
    }
  };

  render() {
    const { closeRegisterModal } = this.props;
    const { formData, errors, success } = this.state;

    return (
      <div className="register-modal">
        <div className="modal-content">
          <span className="close-register" onClick={closeRegisterModal}>
            &times;
          </span>
          <h2 className="modal-header-register">Register</h2>
          <form className="form-register" onSubmit={this.handleSubmit}>
            <label>{errors.firstName}</label>
            <br />
            <input
              className="input-register"
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.username}
              onChange={this.handleChange}
            />
            <br />
            <label>{errors.lastName}</label>
            <br />
            <input
              className="input-register"
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.username}
              onChange={this.handleChange}
            />
            <br />
            <label>{errors.email || errors.error}</label>
            <br />
            <input
              className="input-register"
              type="text"
              name="email"
              placeholder="Email"
              value={formData.username}
              onChange={this.handleChange}
            />
            <br />
            <label>{errors.password}</label>
            <br />
            <input
              className="input-register"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.username}
              onChange={this.handleChange}
            />
            <br />
            <button type="submit" className="register-button">
              Register
            </button>
            <br />
            <label className="success">{success}</label>
          </form>
        </div>
      </div>
    );
  }
}
export default RegisterModal;
