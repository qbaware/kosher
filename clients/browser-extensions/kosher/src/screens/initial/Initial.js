/*global chrome*/
import { Box, CssBaseline, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React from 'react';
import App from '../../App';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import './Initial.css';

class Initial extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log("Initial screen loaded.")
    console.log("Checking if the user is already logged in...");
    chrome.identity.getAuthToken({ interactive: false }, token => {
      if (!token && chrome.runtime.lastError) {
        console.log("User is not logged in.");
        console.log(`Exception: ${JSON.stringify(chrome.runtime.lastError)}`);
        this.setActiveScreen(App.loginScreen);
      } else {
        console.log("User has already logged in.");
        this.setActiveScreen(App.tabsScreen);
      }
    });
  }

  render() {
    return (
      <Container>
        <CssBaseline />
        <Box maxHeight={true} sx={{
          display: "flex",
          direction: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "300px"
        }}>
          <Typography variant='h4'>Loading...</Typography>
        </Box>
      </Container>
    );
  }
}

export default Initial;
