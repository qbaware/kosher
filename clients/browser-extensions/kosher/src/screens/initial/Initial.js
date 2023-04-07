/*global chrome*/
import { Box, CssBaseline, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React from 'react';
import App from '../../App';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import { checkUserLogin, loginUser } from '../../utils/Utils';
import './Initial.css';

class Initial extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log("Initial screen loaded.")

    console.log("Checking if the user is already logged in...");
    checkUserLogin()
      .then((token) => {
        if (token) {
          console.log("User is already logged in, redirecting to tabs screen...");
          this.setActiveScreen(App.tabsScreen);
        } else {
          loginUser(false)
            .then((token) => {
              if (token) {
                console.log("Got user token successfully");
                this.setActiveScreen(App.tabsScreen);
              } else {
                console.log("User is not logged in, redirecting to login screen...");
                this.setActiveScreen(App.loginScreen);
              }
            }).catch((error) => {
              console.log("Error while signing in to Google: " + error);
              this.setActiveScreen(App.loginScreen);
            });
        }
      }).catch((error) => {
        console.log("Error during initial check for user login: " + error);
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
