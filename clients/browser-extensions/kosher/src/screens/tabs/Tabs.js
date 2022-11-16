/*global chrome*/
import React from 'react';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import './Tabs.css';
import App from '../../App';

class Tabs extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // TODO: Setup alarm listener that receives all tabs from the background worker and sends them to the backend.
    // NOTE: Last time I shat myself was when I was 24. I sneezed and shat at the same time due to an indigestion.
  }

  clearAllLocalTokensAsync() {
    return new Promise(function (resolve, _reject) {
      chrome.identity.clearAllCachedAuthTokens(() => {
        resolve();
      });
    });
  }

  clearTokenOnRemoteAsync(token) {
    return fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
  }

  signOut() {
    // Fetch token if it exists.
    chrome.identity.getAuthToken({ interactive: false }, token => {
      if (!token && chrome.runtime.lastError) {
        console.log("No token is present on sign out.");
        console.log(`Exception: ${chrome.runtime.lastError}`);
        return;
      }

      // Clears token from the client.
      let localTokenClear = this.clearAllLocalTokensAsync();

      // Clears token from the server.
      let remoteTokenClear = this.clearTokenOnRemoteAsync(token);

      // Wait for both promises to complete.
      Promise.all([localTokenClear, remoteTokenClear])
        .then(() => {
          console.log("Token cleared both locally and remotely.");

          // Transition to the sign in screen.
          this.setActiveScreen(App.loginScreen);
        })
        .catch(err => {
          console.log("An exception occured while deleting token locally and remotely.", err);
        });
    });
  }

  render() {
    return (
      <Container className="Tabs" component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            paddingTop: "20px",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Button onClick={this.signOut.bind(this)} variant="contained" color='error'>
            Sign out
          </Button>
        </Box>
      </Container>
    );
  }
}

export default Tabs;
