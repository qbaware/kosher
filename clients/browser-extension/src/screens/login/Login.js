/*global chrome*/

import NamedNavigationalComponent from "../../utils/navigation/NamedNavigationalComponent";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./Login.css";
import App from "../../App";
import { checkUserLogin } from "../../scripts/utils";
import { userLoginInteractive } from "../../scripts/background";

class Login extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    console.log("Login component loaded");
    try {
      let token = await checkUserLogin();
      if (token) {
        console.log("User is already logged in, redirecting to tabs screen...");
        this.setActiveScreen(App.tabsScreen);
      }
    } catch (error) {
      console.error("Error checking user login: ", error);
    }
  }

  async handleGoogleLogin() {
    console.log("Signing in to Google...");
    chrome.runtime.sendMessage({ action: userLoginInteractive });
  }

  render() {
    // Custom theme used to provide custom color to
    // the Google sign in button.
    const theme = createTheme({
      palette: {
        primary: {
          main: "#ffc038",
        },
      },
    });

    return (
      <Container className="Login" component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            paddingTop: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "#ffc038" }}></Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <div
            style={{
              padding: "30px",
            }}
          >
            <ThemeProvider theme={theme}>
              <Button
                onClick={() => {
                  this.handleGoogleLogin();
                }}
                variant="contained"
                color="primary"
                startIcon={<GoogleIcon />}
              >
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
