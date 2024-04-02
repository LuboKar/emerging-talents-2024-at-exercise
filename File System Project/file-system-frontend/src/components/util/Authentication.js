class Auth {
  static isAuthenticated() {
    return localStorage.getItem("jwt") !== null;
  }
}

export default Auth;
