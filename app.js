// Constants
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCGRzE7appRUtxfOq8tM_wP4vfJrZGkgOQ",
  authDomain: "repostar-6a542.firebaseapp.com",
  databaseURL: "https://repostar-6a542.firebaseio.com",
  storageBucket: "repostar-6a542.appspot.com",
  messagingSenderId: "478402567163"
};
const URL_PREFIX = "https://github.com/";

// Styles
const alertStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 200
};
const titleStyle = {
  marginTop: 20,
  zIndex: 100
};
const titleStarStyle = {
  marginRight: 10
};
const titleButtonStyle = {
  float: 'right'
};
const listStarStyle = {
  marginRight: 4
};
const thumbnailStyle = {
  marginBottom: 0
};
const textStyle = {
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
};

// Components
class TitleBoxComponent extends React.Component {
  constructor(props) {
    super(props);
    this._buttonAction = this._buttonAction.bind(this);
  }

  render() {
    return (
      <div>
        <div id="alert" className="alert alert-danger" style={alertStyle} hidden>
          <strong>Error!</strong> {this.props.message}
        </div>
        <div className="jumbotron" style={titleStyle}>
          <h2>
            <a href="https://github.com/gjk0090/repo-star-checker">
              <span className="glyphicon glyphicon-star" style={titleStarStyle} />
            </a>
            GitHub Stargazer
            <a id="sign-in" href="https://github.com/login/oauth/authorize?client_id=ebee36504152fd9410a2&state=test&scope=public_repo">
              <span className="btn btn-info" style={titleButtonStyle}>Sign In</span>
            </a>
            <button id="star-all-button" className="btn btn-info hidden" style={titleButtonStyle}
                    onClick={this._buttonAction}>Star All
            </button>
          </h2>
          <p>Have you starred these repos?</p>
        </div>
      </div>
    );
  }

  _buttonAction() {
    const _this = this;
    const total = this.props.data.length;
    var count = 0;
    for (var i = 0; i < this.props.data.length; i++) {
      const repo = this.props.data[i];
      const url = "https://api.github.com/user/starred/" + repo.fullUrl;
      var error = "";
      $('#content').fadeOut('fast', function () {
        $('#progress-bar').fadeIn();
      });
      $.ajax({
        url: url,
        method: 'PUT',
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", _this.props.accessToken);
        },
        success: function () {
          count++;
          if (count == total) {
            console.log('finished!');
            _this.props.onStarAllFinishedAction(error);
            $('#progress-bar').fadeOut('fast', function () {
              $('#content').fadeIn();
            });
          }
        },
        error: function (xhr, status, err) {
          console.log(url, status, err.toString());
          error = err.toString();
        }
      });
    }
  }
}

class AddBoxComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultStyle: true,
      repoUrl: ''
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleAction = this._handleAction.bind(this);
  }

  render() {
    const buttonClassName = this.state.defaultStyle ? 'btn btn-default disabled' : 'btn btn-primary';
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="input-group">
            <input type="text" className="form-control"
                   value={this.state.repoUrl}
                   placeholder="Enter your GitHub repo in userName/repoName format to add in the list"
                   onKeyPress={this._handleKeyPress}
                   onChange={this._handleChange} />
            <span className="input-group-btn">
              <button className={buttonClassName} type="button" onClick={this._handleAction}>Add!</button>
            </span>
          </div>
        </div>
      </div>
    );
  }

  _handleChange(e) {
    this.setState({
      defaultStyle: e.target.value === '',
      repoUrl: e.target.value
    });
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this._handleAction();
    }
  }

  _handleAction() {
    if (this.state.repoUrl === '') {
      return;
    }
    const _this = this;
    const repoUrl = this.state.repoUrl;
    const checkUrl = 'https://api.github.com/repos/' + repoUrl;
    _this.setState({
      defaultStyle: true,
      repoUrl: ''
    });
    $.ajax({
      url: checkUrl,
      method: 'GET',
      dataType: 'json',
      cache: true,
      success: function (data) {
        $('#content').fadeOut('fast', function () {
          $('#progress-bar').fadeIn();
        });
        const splits = repoUrl.split('/');
        const baseRef = firebase.database().ref('repo');
        const userRepoList = [];
        userRepoList.push(splits[1]);
        baseRef.child(splits[0]).set(userRepoList)
          .then(function () {
            _this.props.addAction();
          })
          .catch(function (err) {
            console.log('Save to firebase failed: ' + err.toString());
            const message = "Save data failed: " + err.toString();
            _this.props.errorAction(message);
          });
      }.bind(_this),
      error: function (xhr, status, err) {
        console.error(checkUrl, status, err.toString());
        const message = "The repo " + repoUrl + " does not exist";
        _this.props.errorAction(message);
      }.bind(_this)
    });
  }
}

class InputBoxComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultStyle: true,
      userName: ''
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleAction = this._handleAction.bind(this);
  }

  render() {
    const buttonClassName = this.state.defaultStyle ? 'btn btn-default disabled' : 'btn btn-primary';
    return (
      <div className="row">
        <br />
        <div className="col-lg-12">
          <div className="input-group">
            <input type="text" className="form-control"
                   value={this.state.userName}
                   placeholder="Enter your GitHub username to check if you have starred these repos"
                   onKeyPress={this._handleKeyPress}
                   onChange={this._handleChange} />
            <span className="input-group-btn">
              <button className={buttonClassName} type="button" onClick={this._handleAction}>Go!</button>
            </span>
          </div>
        </div>
        <br />
      </div>
    );
  }

  _handleChange(e) {
    this.setState({
      defaultStyle: e.target.value === '',
      userName: e.target.value
    });
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this._handleAction();
    }
  }

  _handleAction() {
    const userName = this.state.userName;
    this.setState({
      defaultStyle: true,
      userName: ''
    });
    if (userName && userName.length > 0) {
      this.props.goAction(userName);
    }
  }
}

class ProgressBarComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="progress-bar">
        <div className="progress progress-striped active">
          <div className="progress-bar" role="progressbar"
               aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"
               style={{ width: '100%' }}>
          </div>
        </div>
      </div>
    );
  }
}

class RepoListComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const _this = this;
    const repoNodes = this.props.data.map(function (repo, index) {
      const starClassName = _this.props.starredMap[repo.fullUrl.toLowerCase()] ? 'glyphicon glyphicon-star' : 'glyphicon glyphicon-star-empty';
      return (
        <li key={index} className="list-group-item">
          <div className="row">
            <div className="col-md-2 col-sm-2 col-xs-2">
              <a className="thumbnail" style={thumbnailStyle}>
                <img src={_this.props.imageMap[repo.userName]} />
              </a>
            </div>

            <div className="col-md-10 col-sm-10 col-xs-10">
              <h4 style={textStyle}>
                {repo.fullUrl}
              </h4>
              <p style={textStyle}>{URL_PREFIX + repo.fullUrl}</p>
              <div>
                <span className="pull-right">
                  <a>
                    <span className={starClassName} style={listStarStyle} />
                  </a>
                  <a href={URL_PREFIX + repo.fullUrl}>
                    <span className="glyphicon glyphicon-share" aria-hidden="true" />
                  </a>
                </span>
              </div>
            </div>
          </div>
        </li>
      );
    });
    return (
      <div id="content" hidden>
        <AddBoxComponent addAction={this.props.addAction} errorAction={this.props.errorAction} />
        <InputBoxComponent goAction={this.props.goAction} />
        <br />
        <ul id="repo-list" className="list-group">
          {repoNodes}
        </ul>
      </div>
    );
  }
}

class ContainerBoxComponent extends React.Component {
  constructor(props) {
    console.log(document.URL);
    super(props);
    firebase.initializeApp(FIREBASE_CONFIG);
    this.state = {
      dataMap: {},
      dataList: [],
      imageMap: {},
      starredMap: {},
      error: false,
      message: '',
      timeout: -1,
      signedIn: false,
      accessToken: ''
    };
    const _this = this;
    const selfUrl = document.URL;
    if (selfUrl.indexOf("code=") != -1) {
      const endIndex = selfUrl.indexOf('&') == -1 ? selfUrl.length : selfUrl.indexOf('&');
      const authCode = selfUrl.substring(selfUrl.indexOf('code=') + 5, endIndex);
      console.log('auth code: ' + authCode);
      const url = 'https://repo-star-server.herokuapp.com/auth?code=' + authCode;
      $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          const accessToken = data.access_token;
          console.log('login success: ' + accessToken);
          _this.setState({
            signedIn: true,
            accessToken: accessToken
          });
          $('#sign-in').fadeOut('fast', function () {
            $('#star-all-button').removeClass('hidden');
          });
        }.bind(_this),
        error: function (xhr, status, err) {
          console.log(url, status, err.toString());
          _this._showAlertMessage("Failed to sign in: " + err.toString());
        }.bind(_this)
      });
    }
    this._loadDataFromFirebase = this._loadDataFromFirebase.bind(this);
    this._loadUserImages = this._loadUserImages.bind(this);
    this._checkUserStarredList = this._checkUserStarredList.bind(this);
    this._transformStarredList = this._transformStarredList.bind(this);
    this._onStarAllFinished = this._onStarAllFinished.bind(this);
    this._showAlertMessage = this._showAlertMessage.bind(this);
  }

  componentDidMount() {
    this._loadDataFromFirebase();
  }

  _loadDataFromFirebase() {
    const _this = this;
    const baseRef = firebase.database().ref('repo');
    baseRef.once('value').then(function (snapshot) {
      if (snapshot) {
        const userDataMap = snapshot.val();
        _this._loadUserImages(userDataMap);
        const repoList = [];
        for (const userName in userDataMap) {
          const userRepoList = userDataMap[userName];
          for (var i = 0; i < userRepoList.length; i++) {
            repoList.push({ userName: userName, fullUrl: userName + "/" + userRepoList[i] });
          }
        }
        _this.setState({
          dataMap: userDataMap,
          dataList: repoList
        });
        $('#progress-bar').fadeOut('fast', function () {
          $('#content').fadeIn();
        });
      }
    });
  }

  _loadUserImages(userDataMap) {
    const _this = this;
    const imageMap = this.state.imageMap;
    for (const userName in userDataMap) {
      const url = "https://api.github.com/users/" + userName;
      $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        cache: true,
        success: function (data) {
          imageMap[userName] = data.avatar_url;
          _this.setState({
            imageMap: imageMap
          });
        }.bind(_this),
        error: function (xhr, status, err) {
          console.error(url, status, err.toString());
          const message = "Failed to load profile image for " + userName;
          _this._showAlertMessage(message);
        }.bind(_this)
      });
    }
  }

  _checkUserStarredList(userName) {
    if (!userName) {
      return;
    }
    const _this = this;
    const url = "https://api.github.com/users/" + userName + "/starred?per_page=999";
    $.ajax({
      url: url,
      method: 'GET',
      dataType: 'json',
      cache: true,
      success: function (data) {
        var newStarredMap = this._transformStarredList(data);
        _this.setState({
          starredMap: newStarredMap
        });
      }.bind(_this),
      error: function (xhr, status, err) {
        console.error(url, status, err.toString());
        const message = "Failed to find user: " + userName;
        _this._showAlertMessage(message);
      }.bind(_this)
    });
  }

  _transformStarredList(starredList) {
    const map = {};
    if (starredList) {
      for (var i = 0; i < starredList.length; i++) {
        map[starredList[i].full_name.toLowerCase()] = true;
      }
    }
    return map;
  }

  _onStarAllFinished(error) {
    if (!error || error.length == 0) {
      return;
    }
    this._showAlertMessage(error);
  }

  _showAlertMessage(message) {
    const prevTimeout = this.state.timeout;
    if (prevTimeout != -1) {
      clearTimeout(prevTimeout);
    }
    this.setState({
      message: message
    });
    $('#alert').show();
    const timeout = setTimeout(function () {
      $('#alert').hide();
    }, 3000);
    this.setState({
      timeout: timeout
    });
  }

  render() {
    return (
      <div className="container">
        <TitleBoxComponent signedIn={this.state.signedIn} accessToken={this.state.accessToken} error={this.state.error}
                           message={this.state.message} data={this.state.dataList} onStarAllFinishedAction={this._onStarAllFinished} />
        <ProgressBarComponent />
        <RepoListComponent data={this.state.dataList} imageMap={this.state.imageMap}
                           starredMap={this.state.starredMap} goAction={this._checkUserStarredList}
                           addAction={this._loadDataFromFirebase} errorAction={this._showAlertMessage} />
      </div>
    );
  }
}

// Render
ReactDOM.render(<ContainerBoxComponent />, document.getElementById('container'));
