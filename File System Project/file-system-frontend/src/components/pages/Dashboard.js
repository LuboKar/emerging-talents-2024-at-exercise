import React from "react";
import { Component } from "react";
import Navbar from "../navbar/Navbar";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import Auth from "../util/Authentication";
import { withRouter } from "react-router-dom";
import style from "./Dashboard.css";
import drive from "../../images/Drive.png";
import folder from "../../images/folder.png";
import fileIcon from "../../images/file.png";
import downloadIcon from "../../images/download.png";
import deleteIcon from "../../images/delete.png";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.state = {
      files: [],
      error: "",
      clickedIndex: null,
      fileToMove: "",
      currentDirectory: "",
      parentPath: null,
      renameIndex: null,
      newFileName: "",
      personalFilesToggle: null,
    };
  }

  scanFileSystem = async () => {
    this.setState({
      parentPath: null,
      currentDirectory: null,
      renameIndex: null,
      error: null,
    });
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch("http://localhost:8080/filesystem/drives", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", response.statusText);
          this.setState({ error: data.error });
        }
        return;
      }
      this.setState({ personalFilesToggle: null, files: data.drives });
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  changeDirection = async (path) => {
    this.setState({ currentDirectory: path, renameIndex: null, error: null });
    const token = localStorage.getItem("jwt");
    const encodedPath = encodeURIComponent(path);
    try {
      const response = await fetch(
        "http://localhost:8080/filesystem/files?path=" + encodedPath,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", response.statusText);
          this.setState({ error: data.error });
        }
        return;
      }

      this.setState({ files: data.drives, clickedIndex: null });
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  personalFiles = async () => {
    this.setState({ renameIndex: null, error: null });
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(
        "http://localhost:8080/filesystem/files/personal",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", response.statusText);
          this.setState({ error: data.error });
        }
        return;
      }
      this.setState({
        files: data.drives,
        currentDirectory: data.drives[0].fileInformation.parentPath,
        personalFilesToggle: true,
      });
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  goToParentFolder = () => {
    this.setState({ renameIndex: null, error: null });
    if (this.state.files.length !== 0) {
      const path = this.state.files[0].fileInformation.parentPath;
      if (path === null) {
        this.scanFileSystem();
        return;
      }
      this.changeDirection(path);
    }
  };

  toggleInformation = (index) => {
    if (this.state.clickedIndex === index) {
      this.setState({ clickedIndex: null });
      return;
    }
    this.setState({ clickedIndex: index });
  };

  setFileToMove = (path) => {
    this.setState({ fileToMove: path });
  };

  moveFile = async () => {
    const token = localStorage.getItem("jwt");
    const path = encodeURIComponent(this.state.fileToMove);
    const destinationPath = encodeURIComponent(this.state.currentDirectory);
    try {
      const response = await fetch(
        "http://localhost:8080/filesystem/files/move?path=" +
          path +
          "&destinationPath=" +
          destinationPath,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", response.statusText);
          this.setState({ error: data.error });
        }
        return;
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
    this.setState({ fileToMove: null });
    this.changeDirection(this.state.currentDirectory);
  };

  handleFileSelection = (event) => {
    const fileInput = event.target;
    const selectedFile = fileInput.files[0];
    this.uploadFile(selectedFile);
  };

  uploadFile = async (file) => {
    const token = localStorage.getItem("jwt");
    const destinationPath = this.state.currentDirectory;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("destinationPath", destinationPath);

    try {
      const response = await fetch(
        "http://localhost:8080/filesystem/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", data.upload);
          this.setState({ error: data.error });
        }
        return;
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
    document.getElementById("fileInput").value = "";
    this.changeDirection(this.state.currentDirectory);
  };

  download = async (path) => {
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(
        `http://localhost:8080/filesystem/files/download?filePath=${encodeURIComponent(
          path
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/octet-stream",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = path.substring(path.lastIndexOf("/") + 1);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  deleteFile = async (path) => {
    const token = localStorage.getItem("jwt");
    const destinationPath = encodeURIComponent(path);
    try {
      const response = await fetch(
        `http://localhost:8080/filesystem/files/delete?path=${destinationPath}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", data.upload);
          this.setState({ error: data.error });
        }
        return;
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
    this.changeDirection(this.state.currentDirectory);
  };

  rename = (event, index, name) => {
    event.preventDefault();
    this.setState({ renameIndex: index });
    this.setState({ newFileName: name });
  };

  handeRightClick = async (event, path) => {
    if (event.key === "Enter") {
      this.setState({ renameIndex: null });
      const token = localStorage.getItem("jwt");
      const destinationPath = encodeURIComponent(path);

      try {
        const response = await fetch(
          `http://localhost:8080/filesystem/files/rename?path=${destinationPath}&newName=${this.state.newFileName}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400) {
            console.log("An error occurred:", data.upload);
            this.setState({ error: data.error });
          }
          return;
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
      this.changeDirection(this.state.currentDirectory);
    }
  };

  handleChange = (event) => {
    this.setState({ newFileName: event.target.value });
  };

  createNewDirectory = async () => {
    const token = localStorage.getItem("jwt");
    const destinationPath = encodeURIComponent(this.state.currentDirectory);
    try {
      const response = await fetch(
        "http://localhost:8080/filesystem/files/create?path=" + destinationPath,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.log("An error occurred:", response.statusText);
          this.setState({ error: data.error });
        }
        return;
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
    this.changeDirection(this.state.currentDirectory);
  };

  logout() {
    const { history } = this.props;
    localStorage.removeItem("jwt");
    history.push("/");
  }

  render() {
    if (!Auth.isAuthenticated()) {
      return <Redirect to="/login" />;
    }

    const dashboardButtons = [
      { label: "Scan File System", onClick: this.scanFileSystem },
      { label: "My files", onClick: this.personalFiles },
      { label: "Logout", onClick: this.logout },
    ];

    const { renameIndex } = this.state;
    const { personalFilesToggle } = this.state;
    const { clickedIndex } = this.state;
    const { currentDirectory } = this.state;
    const { error } = this.state;

    return (
      <div>
        <Navbar buttons={dashboardButtons} />
        <div className="frame">
          {<label className="error-message">{error}</label>}
          <div className="content">
            <div className="information">
              <label className="return" onClick={this.goToParentFolder}>
                &lt;&lt;
              </label>
              <br />
              <span>Type:</span>
              <span>Name:</span>
              <div className="file-container">
                {this.state.files.map((file, index) => (
                  <div key={index} className="elements">
                    <div className="arrow-div">
                      {file.fileName && (
                        <label
                          className="arrow"
                          onClick={() => this.toggleInformation(index)}
                        >
                          {this.state.clickedIndex === index
                            ? "\u25B2"
                            : "\u25BC"}
                        </label>
                      )}
                    </div>
                    <div className="logo-div">
                      {file.fileInformation.type === "LOCAL_DRIVE" && (
                        <img src={drive} alt="logo" className="icon" />
                      )}
                      {file.fileInformation.type === "DIRECTORY" && (
                        <img src={folder} alt="logo" className="icon" />
                      )}
                      {file.fileInformation.type === "FILE" && (
                        <img src={fileIcon} alt="logo" className="icon" />
                      )}
                    </div>
                    {renameIndex !== index && (
                      <div
                        className="fileName-div"
                        onClick={() => {
                          if (
                            file.fileInformation.type === "LOCAL_DRIVE" ||
                            file.fileInformation.type === "DIRECTORY"
                          ) {
                            this.changeDirection(file.fileInformation.path);
                          }
                        }}
                        onContextMenu={(event) => {
                          if (file.fileInformation.type !== "LOCAL_DRIVE") {
                            this.rename(event, index, file.fileName);
                          }
                        }}
                      >
                        {file.fileName && (
                          <label className="element-name">
                            {file.fileName}
                          </label>
                        )}
                      </div>
                    )}
                    {this.state.renameIndex === index && (
                      <div className="rename">
                        <input
                          onKeyDown={(event) =>
                            this.handeRightClick(
                              event,
                              file.fileInformation.path
                            )
                          }
                          value={this.state.newFileName}
                          onChange={this.handleChange}
                        ></input>
                      </div>
                    )}
                    {personalFilesToggle &&
                      file.fileInformation.type !== null && (
                        <div className="delete-div">
                          <img
                            src={deleteIcon}
                            alt="delete"
                            className="delete-icon"
                            onClick={() =>
                              this.deleteFile(file.fileInformation.path)
                            }
                          />
                        </div>
                      )}
                    {personalFilesToggle && (
                      <div className="move-div">
                        {this.state.files[index].fileInformation.type ===
                          "FILE" && (
                          <label
                            className="move"
                            onClick={() =>
                              this.setFileToMove(file.fileInformation.path)
                            }
                          >
                            Move
                          </label>
                        )}
                      </div>
                    )}

                    {personalFilesToggle &&
                      this.state.files[index].fileInformation.type ===
                        "FILE" && (
                        <div className="donwload-div">
                          <img
                            src={downloadIcon}
                            alt="download"
                            className="download-icon"
                            onClick={() =>
                              this.download(file.fileInformation.path)
                            }
                          />
                        </div>
                      )}
                    {clickedIndex === index && (
                      <div className="more-info">
                        <label className="more-info-lable">
                          Type: {file.fileInformation.type}
                        </label>
                        <label className="more-info-lable">
                          Used space: {file.fileInformation.usedSpace}
                        </label>
                        <br />
                        <label className="more-info-lable">
                          Full path: {file.fileInformation.path}
                        </label>
                        {file.fileInformation.type === "LOCAL_DRIVE" && (
                          <label className="more-info-lable">
                            Capacity: {file.fileInformation.capacity}
                          </label>
                        )}
                        {file.fileInformation.type === "LOCAL_DRIVE" && (
                          <label className="more-info-lable">
                            Free space: {file.fileInformation.freeSpace}
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {currentDirectory && personalFilesToggle && (
                  <div className="upload-div">
                    <input
                      type="file"
                      id="fileInput"
                      name="Upload"
                      style={{ display: "none" }}
                      onChange={this.handleFileSelection}
                    />
                    <label htmlFor="fileInput" className="upload">
                      Upload File
                    </label>
                  </div>
                )}
                {personalFilesToggle && (
                  <div className="create-directory-div">
                    <label
                      className="create-directory"
                      onClick={() => this.createNewDirectory()}
                    >
                      Create new folder
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          {personalFilesToggle && (
            <div className="paste-div">
              {this.state.fileToMove && (
                <label className="paste" onClick={() => this.moveFile()}>
                  paste
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
export default Dashboard;
