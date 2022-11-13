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

  signOut() {
    chrome.identity.clearAllCachedAuthTokens(() => {
      console.log("Purged all cached tokens.")
      this.setActiveScreen(App.loginScreen);
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
