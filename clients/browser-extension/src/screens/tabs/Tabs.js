/*global chrome*/

import React, { Fragment } from 'react';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TabIcon from '@mui/icons-material/Tab';
import Typography from '@mui/material/Typography';
import Sync from '@mui/icons-material/Sync';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import SwitchComponents from '../../utils/navigation/ComponentSwitcher';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import App from '../../App';
import './Tabs.css';
import { ListItem } from '@mui/material';
import { logoutUser, openLink, checkUserLogin, getTokenUserInfo } from '../../scripts/utils';

const DEFAULT_DEVICE_NAME = "Unnamed";
const INITIAL_SCREEN = "tabs";
const CLOUD_SYNC_INTERVAL_IN_MINS = "5";
const SNACK_AUTOHIDE_DURATION = 2500;
const FREE_PLAN = "free";
const PREMIUM_PLAN = "premium";
const BACKUP_TABS_ON_REMOTE_ACTION_FROM_UI = "tabsBackupRemoteFromUi"; // TODO: Move this to shared file

const SYNC_ENABLED_KEY = "syncEnabled";
const DEVICE_NAME_KEY = "deviceName";

const STRIPE_DONATIONS_URL = "https://donate.stripe.com/bIY9CbfGte6Cgus002";
const STRIPE_SUBSCRIBE_PREMIUM_URL = "https://buy.stripe.com/cN215F65Td2ydigeUX";
const STRIPE_MANAGE_SUBSCRIPTIONS_URL = "https://billing.stripe.com/p/login/7sIdTOdFg4hP67m288";

class Tabs extends NamedNavigationalComponent {
  constructor(props) {
    super(props);

    this.state = {
      profileName: "",
      profilePicUrl: "",
      profileSubscriptionPlan: FREE_PLAN,

      profileMenuAnchor: null,
      profileMenuOpen: false,

      devicesWithTabs: [],
      devicesItemListCollapsed: {},

      snackbarShow: false,
      snackbarMessage: "",
      snackbarButtonText: "",
      snackbarButtonOnClick: () => { },
      snackbarType: "",
      snackbarAutohideDuration: SNACK_AUTOHIDE_DURATION,

      selectedTab: INITIAL_SCREEN,

      syncEnabled: false,
      cloudSyncIntervalMin: CLOUD_SYNC_INTERVAL_IN_MINS,

      deviceName: DEFAULT_DEVICE_NAME
    };
  }

  componentDidMount() {
    checkUserLogin()
      .then((token) => {
        if (token) {
          this.loadProfile(token);
          this.loadUserTabs(token);
          this.loadLocalStorageSettings();
          // TODO: Setup alarm listener that receives all tabs from the background worker and sends them to the backend.
        } else {
          console.log("User is not logged in.");
          console.log("Redirecting to Login scene...");
          this.setActiveScreen(App.loginScreen);
        }
      }).catch((error) => {
        console.log("An error occured while checking if user is logged in in the tabs screen, redirecting to login screen: " + error);
        this.setActiveScreen(App.loginScreen);
      });
  }

  loadLocalStorageSettings() {
    this.loadLocalStorageVariable(SYNC_ENABLED_KEY, this.state.syncEnabled);
    this.loadLocalStorageVariable(DEVICE_NAME_KEY, this.state.deviceName);
  }

  setVariableToStorageAndState(variableName, value) {
    let state = {};
    state[variableName] = value;
    this.setState(state);
    chrome.storage.local.set(state);
  }

  async loadLocalStorageVariable(variableName, defaultValue) {
    const storageResult = await chrome.storage.local.get([variableName]);
    const value = storageResult[variableName] !== undefined ? storageResult[variableName] : defaultValue;

    this.setVariableToStorageAndState(variableName, value);
  }

  async clearLocalStorage() {
    chrome.storage.local.remove([
      SYNC_ENABLED_KEY
    ]);
  }

  loadProfile(token) {
    getTokenUserInfo(token)
      .then(response => {
        return response.json();
      }).then(info => {
        const hardcodedGoogleApiSize = "s96";
        const targetProfilePicSize = 128;

        this.setState({
          profileName: info.given_name,
          profilePicUrl: info.picture.replace(hardcodedGoogleApiSize, `s${targetProfilePicSize}`)
        });
      }).catch(error => {
        console.log("Failed retrieving user info from Google APIs", error);
        chrome.storage.local.remove("token")
          .then(() => {
            console.log("Removed expired token from local storage and redirecting to initial screen...");
            this.setActiveScreen(App.initialScreen);
          }).catch((error) => {
            console.log("Failed removing token from local storage: " + error);
            console.log("Logging out to user...")
            this.signOut();
          });
      });
  }

  async loadUserTabs(token) {
    // Define mock data.
    const mockDeviceWithTabs1 = {
      id: "1",
      name: "C02GN16Z1PG2",
      browser: "Chrome",
      os: "MacOS",
      tabs: [
        { id: "1", name: "reactjs - How to make dynamic state for multiple Collapse items", url: "https://google.com" },
        { id: "2", name: "React grid component - Material UI", url: "https://mui.com/material-ui/react-grid/" },
        { id: "3", name: "FYRE - Момче От Народа (prod. by VITEZZ)(Official 4K Video)", url: "https://www.youtube.com/watch?v=wD_uSekJwVA&ab_channel=FyreHateCity" },
        { id: "4", name: "qbaware/kosher: Tab synchronization software", url: "https://github.com/qbaware/kosher" }
      ]
    };

    const mockDeviceWithTabs2 = {
      id: "2",
      name: "Dancho's Macbook",
      browser: "Firefox",
      os: "MacOS",
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

  async signOut() {
    try {
      await logoutUser();
      await this.clearLocalStorage();
      this.setActiveScreen(App.loginScreen);
    } catch (error) {
      this.showErrorSnackbar("Failed to sign out");
      console.log("An error occured while logging out the user: " + error);
    }
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
        snackbarButtonText: "",
        snackbarButtonOnClick: () => { }
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
        snackbarButtonText: "",
        snackbarButtonOnClick: () => { }
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
        snackbarButtonText: "",
        snackbarButtonOnClick: () => { }
      });
    }, 10);
  }

  showWarnSnackbarWithButton(message, buttonMessage, buttonAction) {
    this.closeSnackbar();

    setTimeout(() => {
      this.setState({
        snackbarShow: true,
        snackbarMessage: message,
        snackbarType: "warning",
        snackbarButtonText: buttonMessage,
        snackbarButtonOnClick: buttonAction
      });
    }, 10);
  }

  closeSnackbar() {
    this.setState({ snackbarShow: false });
  }

  setActiveTab(tab) {
    this.setState({
      selectedTab: tab
    });
  }

  render() {
    const theme = createTheme({
      palette: {
        primary: {
          main: "#000000",
        },
        warning: {
          main: "#ffc038"
        }
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
            <Button onClick={() => { this.setActiveTab("tabs"); }} sx={{ borderRadius: 0 }}>Tabs</Button>
            <Button onClick={() => { this.setActiveTab("settings"); }} sx={{ borderRadius: 0 }}>Settings</Button>
            <Button onClick={() => { this.setActiveTab("plans"); }} sx={{ borderRadius: 0 }}>Plans</Button>
            <Button onClick={() => {
              openLink(STRIPE_DONATIONS_URL);
            }} sx={{ borderRadius: 0 }} color="warning" endIcon={<FavoriteIcon fontSize="large" />}>Donate</Button>
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
                <MenuItem onClick={() => {
                  chrome.runtime.sendMessage({ action: BACKUP_TABS_ON_REMOTE_ACTION_FROM_UI });
                  this.showSuccessSnackbar("Successfully synced tabs");
                  this.setState({
                    profileMenuOpen: false
                  });
                }}>
                  <ListItemIcon>
                    <Sync fontSize="small" />
                  </ListItemIcon>
                  Sync
                </MenuItem>
                <MenuItem onClick={async () => {
                  this.setState({
                    profileMenuOpen: false
                  });
                  await this.signOut();
                }}>
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
          height: "100%",
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
            <SwitchComponents active={this.state.selectedTab}>
              <List
                name="tabs"
                sx={{ width: '100%', paddingTop: "20px", bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
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
                            <LaptopMacIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={device.name} />
                          <ListItemText secondary={device.browser + " on " + device.os} style={{ textAlign: "right", paddingRight: "10px" }} />
                          {this.state.devicesItemListCollapsed[device.name] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Tooltip placement="top" title="Open missing tabs">
                          <IconButton color="primary" aria-label="openinbrowser"
                            onClick={() => {
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
                        <Tooltip placement="top" title="Delete browser">
                          <IconButton color="error" aria-label="deletebrowser"
                            onClick={() => {
                              this.showWarnSnackbarWithButton(
                                `Delete browser '${device.name}'?`,
                                "Delete",
                                (() => {
                                  // TODO: Request to delete browser from backend and remove from React state as well.

                                  this.showSuccessSnackbar(`Successfully deleted browser ${device.name}`);
                                }).bind(this)
                              );
                            }}>
                            <DeleteIcon color="error" />
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
              <List name="settings" sx={{ width: "100%", paddingTop: "20px" }}>
                <ListItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    paddingTop: '10px',
                    paddingBottom: '10px'
                  }}
                  secondaryAction={
                    <Container sx={{ marginBottom: "0px", marginLeft: "30px" }}>
                      <Switch
                        checked={this.state.syncEnabled}
                        onChange={(event) => {
                          this.setVariableToStorageAndState(SYNC_ENABLED_KEY, event.target.checked);
                        }}
                        disableRipple
                        defaultChecked
                        sx={{
                          width: 48,
                          height: 30,
                          padding: 0,
                          '& .MuiSwitch-switchBase': {
                            transitionDuration: '300ms',
                            padding: 0,
                            margin: "3px",
                            '&.Mui-checked': {
                              transform: 'translateX(18px)',
                              color: '#fff',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#ffc038',
                                opacity: 1,
                                border: 0,
                              },
                              '&.Mui-disabled + .MuiSwitch-track': {
                                opacity: 0.5,
                              },
                            },
                            '&.Mui-disabled .MuiSwitch-thumb': {
                              color: "black",
                            },
                            '&.Mui-disabled + .MuiSwitch-track': {
                              opacity: 0.3,
                            },
                          },
                          '& .MuiSwitch-thumb': {
                            boxSizing: 'border-box',
                            width: 24,
                            height: 24,
                            border: '2px solid currentColor'
                          },
                          '& .MuiSwitch-track': {
                            borderRadius: 30 / 2,
                            backgroundColor: "#bdbdbd",
                            opacity: 1,
                            transition: theme.transitions.create(['background-color'], {
                              duration: 500,
                            }),
                          },
                        }}
                      >
                      </Switch>
                    </Container>
                  }>
                  <Stack direction="row" spacing={2}>
                    <CloudSyncIcon fontSize="medium" />
                    <Typography>Sync on</Typography>
                  </Stack>
                </ListItem>
                <ListItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    paddingTop: '10px',
                    paddingBottom: '10px'
                  }}
                  secondaryAction={
                    // TODO: Do some name validation of the input.
                    <TextField id="outlined-basic"
                      variant="outlined"
                      value={this.state.deviceName}
                      onChange={(event) => {
                        this.setVariableToStorageAndState(DEVICE_NAME_KEY, event.target.value);
                      }}
                      color="warning"
                      size="small"
                      inputProps={{ maxLength: 20 }} />
                  }>
                  <Stack direction="row" spacing={2}>
                    <LaptopMacIcon fontSize="medium" />
                    <Typography>Device name</Typography>
                  </Stack>
                </ListItem>
              </List>
              <Container name="plans">
                <Stack spacing={2} direction="row" sx={{ width: "100%", height: "100%", paddingTop: "20px" }}>
                  <Card sx={{ width: "50%", height: "100%" }}>
                    <CardContent>
                      <Typography textAlign="center" gutterBottom variant="h5" component="div">
                        Free
                      </Typography>
                      <Stack justifyContent="center" alignItems="flex-end" direction="row" height="100%">
                        <Typography textAlign="center" gutterBottom variant="h4" component="div">
                          $0.00
                        </Typography>
                        <Typography textAlign="center" gutterBottom variant="h6" component="div">
                          / mo
                        </Typography>
                      </Stack>
                      <Typography padding="3px" textAlign="center" variant="body2" color="text.secondary">
                        2 Browsers
                      </Typography>
                      <Typography padding="3px" textAlign="center" variant="body2" color="text.secondary">
                        Basic Support
                      </Typography>
                      <Typography padding="3px" textAlign="center" variant="body2" color="text.secondary">
                        All Core Features
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "center" }}>
                      <Button disabled={this.state.profileSubscriptionPlan === FREE_PLAN} width="100%" fullWidth variant="contained" color='warning' size="large"
                        onClick={() => {
                          openLink(STRIPE_MANAGE_SUBSCRIPTIONS_URL);
                        }}>
                        {this.state.profileSubscriptionPlan === FREE_PLAN ? ("Subscribed") : ("Subscribe")}
                      </Button>
                    </CardActions>
                  </Card>
                  <Card sx={{ width: "50%", height: "100%" }}>
                    <CardContent sx={{ justifyContent: "center", backgroundColor: "#ffffff" }}>
                      <Typography textAlign="center" gutterBottom variant="h5" component="div">
                        Premium
                      </Typography>
                      <Stack justifyContent="center" alignItems="flex-end" direction="row" height="100%">
                        <Typography textAlign="center" gutterBottom variant="h4" component="div">
                          $1.00
                        </Typography>
                        <Typography textAlign="center" gutterBottom variant="h6" component="div">
                          / mo
                        </Typography>
                      </Stack>
                      <Typography padding="3px" textAlign="center" variant="body2" color="text.secondary">
                        Unlimited Browsers
                      </Typography>
                      <Typography padding="3px" textAlign="center" variant="body2" color="text.secondary">
                        Premium Support
                      </Typography>
                      <Typography padding="3px" textAlign="center" variant="body2" color="text.secondary">
                        All Core Features
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ width: "100%", justifyContent: "center" }}>
                      <Button disabled={this.state.profileSubscriptionPlan === PREMIUM_PLAN} width="100%" fullWidth variant="contained" color='warning' size="large"
                        onClick={() => {
                          openLink(STRIPE_SUBSCRIBE_PREMIUM_URL);
                        }}>
                        {this.state.profileSubscriptionPlan === PREMIUM_PLAN ? ("Subscribed") : ("Subscribe")}
                      </Button>
                    </CardActions>
                  </Card>
                </Stack>
                <Stack sx={{ paddingTop: "10px", paddingBottom: "10px" }}>
                  <Button variant="contained" color='primary' size="large" onClick={() => {
                    openLink(STRIPE_MANAGE_SUBSCRIPTIONS_URL);
                  }}>Manage subscriptions</Button>
                </Stack>
              </Container>
            </SwitchComponents>
          </Container>
        </Box>
        <Snackbar open={this.state.snackbarShow} autoHideDuration={this.state.snackbarAutohideDuration} onClose={this.closeSnackbar.bind(this)}>
          <Alert
            onClose={this.closeSnackbar.bind(this)}
            severity={this.state.snackbarType}
            sx={{ width: "100%" }}
            action={
              this.state.snackbarButtonText
                ? (<Button color="inherit" size="small" onClick={this.state.snackbarButtonOnClick.bind(this)}>{this.state.snackbarButtonText}</Button>)
                : null
            }>
            {this.state.snackbarMessage}
          </Alert>
        </Snackbar >
      </ThemeProvider >
    );
  }
}

export default Tabs;
