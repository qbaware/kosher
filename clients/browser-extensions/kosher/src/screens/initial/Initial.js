/*global chrome*/
import { Box, CssBaseline, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React from 'react';
import App from '../../App';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import { checkIfUserIsLoggedIn } from '../../utils/Utils';
import './Initial.css';

class Initial extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log("Initial screen loaded.")

    console.log("Checking if the user is already logged in...");
    checkIfUserIsLoggedIn()
      .then((token) => {
        if (token) {
          console.log("User is already logged in.");
          this.setActiveScreen(App.tabsScreen);
        } else {
          console.log("User is not logged in.");
          this.setActiveScreen(App.loginScreen);
        }
      }).catch((error) => {
        console.log("Error: " + error);
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
