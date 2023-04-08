/*global chrome*/

import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './Login.css';
import App from '../../App';
import { checkUserLogin, loginUser } from '../../utils/Utils';

class Login extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log("Login component loaded");
    checkUserLogin()
      .then((token) => {
        if (token) {
          console.log("User is already logged in, redirecting to tabs screen...")
          this.setActiveScreen(App.tabsScreen);
        }
      });
  }

  async handleGoogleLogin() {
    console.log("Signing in to Google...");
    try {
      let token = await loginUser(true);
      if (token) {
        console.log("User signed in successfully");
        this.setActiveScreen(App.tabsScreen);
      } else {
        console.log("User didn't complete signing in with Google");
      }
    } catch (error) {
      console.log("Error while signing in to Google: " + error);
    }
  };

  render() {
    // Custom theme used to provide custom color to
    // the Google sign in button.
    const theme = createTheme({
      palette: {
        primary: {
          main: '#ffc038'
        }
      }
    });

    return (
      <Container className='Login' component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            paddingTop: "20px",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#ffc038' }}>
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <div style={{
            padding: "30px"
          }}>
            <ThemeProvider theme={theme}>
              <Button onClick={this.handleGoogleLogin.bind(this)} variant="contained" color='primary' startIcon={<GoogleIcon />}>
                Continue with Google
              </Button>
            </ThemeProvider>
          </div>
        </Box>
      </Container>
    );
  }
}

export default Login;
