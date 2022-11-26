/*global chrome*/
import React, { Fragment } from 'react';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import './Tabs.css';
import App from '../../App';
import { Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

class Tabs extends NamedNavigationalComponent {
  constructor(props) {
    super(props);

    this.state = {
      profileName: "",
      profilePicUrl: "",

      profileMenuAnchor: null,
      profileMenuOpen: false
    };
  }

  componentDidMount() {
    this.checkIfUserIsSignedIn(
      (token) => {
        this.loadProfile(token);

        // TODO: Setup alarm listener that receives all tabs from the background worker and sends them to the backend.
      },
      () => {
        console.log("User is not logged in.");
        console.log("Redirecting to Login scene...");
        this.setActiveScreen(App.loginScreen);
      });
  }

  checkIfUserIsSignedIn(signedInCallback, signedOutCallback) {
    chrome.identity.getAuthToken({ interactive: false }, userToken => {
      if (!userToken && chrome.runtime.lastError) {
        console.log(`Exception: ${JSON.stringify(chrome.runtime.lastError)}`);
        signedOutCallback();
      } else {
        signedInCallback(userToken);
      }
    });
  }

  loadProfile(token) {
    fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`)
      .then(response => {
        return response.json();
      })
      .then(info => {
        const hardcodedGoogleApiSize = "s96";
        const targetProfilePicSize = 128;

        this.setState({
          profileName: info.given_name,
          profilePicUrl: info.picture.replace(hardcodedGoogleApiSize, `s${targetProfilePicSize}`)
        });
      })
      .catch(err => {
        console.log("Failed retrieving user info from Google APIs", err);
      });
  }

  signOut() {
    // Fetch token if it exists.
    chrome.identity.getAuthToken({ interactive: false }, token => {
      if (!token && chrome.runtime.lastError) {
        console.log("No token is present on sign out.");
        console.log(`Exception: ${JSON.stringify(chrome.runtime.lastError)}`);
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

  profileMenuOpen(event) {
    this.setState({
      profileMenuAnchor: event.currentTarget,
      profileMenuOpen: true
    });
  }

  profileMenuClose() {
    this.setState({
      profileMenuOpen: false,
      profileMenuAnchor: null
    });
  }

  render() {
    const theme = createTheme({
      palette: {
        primary: {
          main: "#000000",
        },
      },
    });

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <ButtonGroup variant="contained" aria-label="outlined primary button group" fullWidth="true">
            <Button sx={{ borderRadius: 0 }}>Tabs</Button>
            <Button sx={{ borderRadius: 0 }}>Groups</Button>
            <Button sx={{ borderRadius: 0 }}>Sync</Button>
            <Fragment>
              <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', padding: "8px", backgroundColor: "#000000" }}>
                <Tooltip title="Profile">
                  <IconButton
                    onClick={this.profileMenuOpen.bind(this)}
                    size="small"
                    aria-controls={this.state.profileMenuOpen ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={this.state.profileMenuOpen ? 'true' : undefined}
                  >
                    <Avatar variant="circle" src={"https://lh3.googleusercontent.com/a/ALm5wu0wpDkpjwOjSlJd8Z30QKDdNhIKOj7p3dblxLzcoQ=s500-c"} sx={{ width: 32, height: 32 }}></Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
              <Menu
                anchorEl={this.state.profileMenuAnchor}
                id="account-menu"
                open={this.state.profileMenuOpen}
                onClose={this.profileMenuClose.bind(this)}
                onClick={() => { }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <MenuItem onClick={this.signOut.bind(this)}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </Fragment>
          </ButtonGroup>
          <h4>{`Hi, ${this.state.profileName}`}</h4>
          <Container sx={{
            paddingTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Put items here */}
          </Container>
        </Box>
      </ThemeProvider>
    );
  }
}

export default Tabs;
