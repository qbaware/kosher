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
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import DevicesIcon from '@mui/icons-material/Devices';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TabIcon from '@mui/icons-material/Tab';
import Typography from '@mui/material/Typography';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './Tabs.css';
import App from '../../App';

class Tabs extends NamedNavigationalComponent {
  constructor(props) {
    super(props);

    this.state = {
      profileName: "",
      profilePicUrl: "",

      profileMenuAnchor: null,
      profileMenuOpen: false,

      devicesWithTabs: [],
      devicesItemListCollapsed: {},

      snackbarShow: false,
      snackbarMessage: "",
      snackbarType: "",
      snackbarAutohideDuration: 2500
    };
  }

  componentDidMount() {
    this.checkIfUserIsSignedIn(
      (token) => {
        this.loadProfile(token);
        this.loadUserTabs(token);
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

  loadUserTabs(token) {
    // Define mock data.
    const mockDeviceWithTabs1 = {
      id: "1",
      name: "Chrome (MacOS - C02GN16Z1PG2)",
      tabs: [
        { id: "1", name: "reactjs - How to make dynamic state for multiple Collapse items", url: "https://google.com" },
        { id: "2", name: "React grid component - Material UI", url: "https://mui.com/material-ui/react-grid/" },
        { id: "3", name: "FYRE - Момче От Народа (prod. by VITEZZ)(Official 4K Video)", url: "https://www.youtube.com/watch?v=wD_uSekJwVA&ab_channel=FyreHateCity" },
        { id: "4", name: "qbaware/kosher: Tab synchronization software", url: "https://github.com/qbaware/kosher" }
      ]
    };

    const mockDeviceWithTabs2 = {
      id: "2",
      name: "Firefox (MacOS - Dancho's Macbook)",
      tabs: [
        { id: "1", name: "Launching an Infrastructure SaaS Product, An Example Walkthrough", url: "https://www.thenile.dev/blog/launch-infra-saas" },
        { id: "2", name: "Future - MASSAGING ME (Official Music Video)", url: "https://www.youtube.com/watch?v=TrR1wVxj1_Y&ab_channel=FutureVEVO" }
      ]
    };
    // End of mocks.

    // TODO: Implement real call to backend to retrieve devices with their corresponding tabs.

    const devices = [
      mockDeviceWithTabs1,
      mockDeviceWithTabs2
    ]

    const deviceListItemsCollapsed = this.state.devicesItemListCollapsed;

    devices.map(device => {
      deviceListItemsCollapsed[device.name] = deviceListItemsCollapsed[device.name] || false;
    });

    this.setState({
      devicesWithTabs: devices,
      devicesItemListCollapsed: deviceListItemsCollapsed
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
          this.showErrorSnackbar("Failed to sign out");
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

  showSuccessSnackbar(message) {
    this.closeSnackbar();

    setTimeout(() => {
      this.setState({
        snackbarShow: true,
        snackbarMessage: message,
        snackbarType: "success",
      });
    }, 10);
  }

  showErrorSnackbar(message) {
    this.closeSnackbar();

    setTimeout(() => {
      this.setState({
        snackbarShow: true,
        snackbarMessage: message,
        snackbarType: "error",
      });
    }, 10);
  }

  showInfoSnackbar(message) {
    this.closeSnackbar();

    setTimeout(() => {
      this.setState({
        snackbarShow: true,
        snackbarMessage: message,
        snackbarType: "info",
      });
    }, 10);
  }

  closeSnackbar() {
    this.setState({ snackbarShow: false });
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
            <Button onClick={() => { this.showSuccessSnackbar("Successfully synced tabs"); }} sx={{ borderRadius: 0 }}>Sync</Button>
            <Fragment>
              <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', padding: "6px", paddingRight: "10px", backgroundColor: "#000000" }}>
                <Tooltip title="Profile">
                  <IconButton
                    onClick={this.profileMenuOpen.bind(this)}
                    size="small"
                    aria-controls={this.state.profileMenuOpen ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={this.state.profileMenuOpen ? 'true' : undefined}
                  >
                    <Avatar variant="circle" src={this.state.profilePicUrl} sx={{ width: 32, height: 32 }}></Avatar>
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
                <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                  <Typography sx={{ padding: "10px" }}>{`Hi, ${this.state.profileName}`}</Typography>
                </Box>
                <Divider />
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
                <MenuItem onClick={(() => {
                  this.setState({
                    profileMenuOpen: false
                  });
                  this.signOut();
                })}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </Fragment>
          </ButtonGroup>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Container sx={{
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <List
              sx={{ width: '100%', bgcolor: 'background.paper' }}
              component="nav"
              aria-labelledby="nested-list-subheader"
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  Devices
                </ListSubheader>
              }
            >
              {this.state.devicesWithTabs.map(device => {
                return (
                  <div>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <ListItemButton
                        onClick={() => {
                          const devicesItemListCollapsed = this.state.devicesItemListCollapsed;
                          devicesItemListCollapsed[device.name] = !devicesItemListCollapsed[device.name];
                          this.setState({ devicesItemListCollapsed: devicesItemListCollapsed });
                        }}
                      >
                        <ListItemIcon>
                          <DevicesIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={device.name} />
                        {this.state.devicesItemListCollapsed[device.name] ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                      <Tooltip placement="left" title="Open missing tabs">
                        <IconButton color="primary" aria-label="openinbrowser"
                          onClick={() => {
                            console.log(`Should open all tabs: ${JSON.stringify(device.tabs)}`);
                            chrome.tabs.query({}, (tabs) => {
                              let currentTabUrls = tabs.map(tab => tab.url);
                              let tabsToOpen = device.tabs.filter(tab => {
                                return !currentTabUrls.includes(tab.url);
                              });
                              let tabCreationPromises = tabsToOpen.map(tab => {
                                return chrome.tabs.create({ url: tab.url, active: false });
                              });

                              Promise.all(tabCreationPromises)
                                .then(() => { this.showSuccessSnackbar("Opened all tabs"); })
                                .catch(err => { this.showErrorSnackbar("Error: " + err); });
                            });
                          }}>
                          <OpenInBrowserIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Collapse in={this.state.devicesItemListCollapsed[device.name]} timeout="auto" unmountOnExit>
                      {device.tabs.map(tab => {
                        return (
                          <List component="div" disablePadding>
                            <ListItemButton
                              sx={{ pl: 4 }}
                              onClick={() => {
                                chrome.tabs.create({ url: tab.url, active: false })
                                  .then(() => { this.showSuccessSnackbar("Opened tab"); },
                                    (rejectedReason) => { this.showErrorSnackbar("Error: " + rejectedReason); });
                              }}
                            >
                              <ListItemIcon>
                                <TabIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={tab.name} />
                            </ListItemButton>
                          </List>
                        )
                      })}
                    </Collapse>
                  </div>
                )
              })}
            </List>
          </Container>
        </Box>
        <Snackbar open={this.state.snackbarShow} autoHideDuration={this.state.snackbarAutohideDuration} onClose={this.closeSnackbar.bind(this)}>
          <Alert onClose={this.closeSnackbar.bind(this)} severity={this.state.snackbarType} sx={{ width: "100%" }}>
            {this.state.snackbarMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider >
    );
  }
}

export default Tabs;
