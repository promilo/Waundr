import React, { Component } from 'react';
import { Modal, Button, Row, Input, Icon} from 'react-materialize';
import ReactDOM from 'react-dom';
import GoogleLogin from 'react-google-login';

const responseGoogle = (response) => {
  console.log(response);
}

const success = (response) => {
  console.log(response);
};

const error = (response) => {
  console.error(response);
};

const loading = () => {
  console.log('loading');
};


class UserModal extends Component{

  render(){
      return(  <Modal
      	header='LOGIN'
    	trigger={
    		<Button waves='light'>Login</Button>
    	}>
      <Row>
        <Input ref='email_id' s={6} label="Email ID"/>
        <Input ref='password' label="Password"/>
      </Row>
      <Row>
        <a href='http://localhost:3001/users/auth/google'><Button waves ='light'> Login with google </Button></a>
      </Row>
      <Row>
        <a href='http://localhost:3001/users/auth/facebook'><Button waves ='light'> Login with facebook </Button></a>
      </Row>
        <Button className="modal-action modal-close btn waves-effect waves-light" type="submit" onClick={this._onLogin.bind(this)}>Login
          <Icon className="material-icons right">send</Icon>
        </Button>
        <GoogleLogin
            clientId='658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'
            scope='https://www.googleapis.com/auth/analytics'
            onSuccess={success}
            onFailure={error}
            onRequest={loading}
            offline={false}
            approvalPrompt="force"
            responseType="id_token"
            isSignedIn={true}
            // disabled
            // prompt="consent"
            // className='button'
            // style={{ color: 'red' }}
        >
          <span>Analytics</span>
        </GoogleLogin>

        <GoogleLogin
            clientId='658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com'
            scope='https://www.googleapis.com/auth/adwords'
            onSuccess={success}
            onFailure={error}
            onRequest={loading}
            offline={true}
            approvalPrompt="force"
            // uxMode="redirect"
            // redirectUri="http://google.com"
            // disabled
            // prompt="consent"
            // className='button'
            // style={{ color: 'red' }}
        >
          <span>Adwords</span>
        </GoogleLogin>
      </Modal>
      )
    }
    _onLogin = (e) => {
      console.log(this.refs)
      let email = this.refs.email_id.state.value
      let pass = this.refs.password.state.value
      console.log("Login", email, pass)
  }

}

        export default UserModal
