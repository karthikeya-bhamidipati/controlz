import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
  FormHelperText,
  Link,
  Divider,
  Fade,
} from "@mui/material";
import {
  DarkMode,
  LightMode,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useDarkMode } from "../context/DarkModeContext";
import { loginRoute, registerRoute } from "../utils/ApiRoutes";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const LoginRegister = () => {
  // Configure axios interceptor for authentication
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Cleanup interceptor on component unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const [activeForm, setActiveForm] = useState("login");
  const { darkMode, setDarkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({
    login: { username: "", password: "" },
    signup: { username: "", email: "", password: "" },
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: darkMode ? "dark" : "light",
  };

  // Check for saved credentials on initial load
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setLoginData((prev) => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e, form) => {
    const { name, value } = e.target;

    if (form === "login") {
      setLoginData({ ...loginData, [name]: value });
      // Clear errors when user types
      setFormErrors((prev) => ({
        ...prev,
        login: { ...prev.login, [name]: "" },
      }));
    } else {
      setSignupData({ ...signupData, [name]: value });
      setFormErrors((prev) => ({
        ...prev,
        signup: { ...prev.signup, [name]: "" },
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateLoginForm = () => {
    const errors = { username: "", password: "" };
    let isValid = true;

    if (!loginData.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    }

    if (!loginData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, login: errors }));
    return isValid;
  };

  const validateSignupForm = () => {
    const errors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!signupData.username.trim() || signupData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    if (!signupData.email || !validateEmail(signupData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!signupData.password || !validatePassword(signupData.password)) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, signup: errors }));
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(loginRoute, loginData);
      const { token } = response.data;

      if (token) {
        // Store auth token and user info
        localStorage.setItem("token", token);

        // Set auth header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        toast.success("Login successful! Redirecting...", toastOptions);

        // Delayed navigation for better UX
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid login credentials";
      toast.error(errorMessage, toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateSignupForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...signupPayload } = signupData;
      const response = await axios.post(registerRoute, signupPayload);

      toast.success(
        "Account created successfully! Please log in.",
        toastOptions
      );

      // Clear form and switch to login
      setTimeout(() => {
        setActiveForm("login");
        setLoginData({
          username: signupData.username,
          password: "",
        });
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create account. Please try again.";
      toast.error(errorMessage, toastOptions);
    } finally {
      setLoading(false);
    }
  };

  // Handle form switch with animation
  const switchForm = (form) => {
    if (form !== activeForm) {
      setFormSubmitted(false);
      setActiveForm(form);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        padding: { xs: 2, sm: 4 },
        position: "relative",
        transition: "background 0.5s ease",
        backgroundImage: darkMode
          ? "radial-gradient(circle at 10% 20%, rgba(21, 21, 21, 0.8) 0%, rgba(10, 10, 10, 0.4) 90%)"
          : "radial-gradient(circle at 10% 20%, rgba(230, 230, 250, 0.8) 0%, rgba(240, 240, 255, 0.4) 90%)",
        overflow: "hidden",
      }}
    >
      {/* Theme Toggle */}
      <Tooltip
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            color: darkMode ? "#fff" : "#000",
            bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            padding: "12px",
            "&:hover": {
              bgcolor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
            },
            zIndex: 9999,
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
          }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>

      {/* Decorative background elements */}
      <Box
        component={motion.div}
        animate={{
          y: [0, 10, 0],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "70vh",
          height: "70vh",
          borderRadius: "50%",
          background: darkMode
            ? "radial-gradient(circle, rgba(75,0,130,0.2) 0%, rgba(75,0,130,0) 70%)"
            : "radial-gradient(circle, rgba(255,165,0,0.1) 0%, rgba(255,165,0,0) 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          width: "90%",
          maxWidth: "1100px",
          gap: { xs: 2, md: 6 },
          zIndex: 1,
        }}
      >
        {/* Branding Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          sx={{
            flex: 1,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: { xs: 2, md: 0 },
          }}
        >
          <Box
            component={motion.div}
            whileHover={{
              rotate: 10,
              scale: 1.05,
              filter: "drop-shadow(0 0 10px rgba(255,165,0,0.5))",
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <ControlCameraIcon
              sx={{
                fontSize: { xs: "5rem", md: "8rem" },
                color: "orange",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
              }}
            />
          </Box>

          <Typography
            variant="h2"
            fontWeight="bold"
            component={motion.h2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            sx={{
              color: "text.primary",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              letterSpacing: "0.1em",
              mb: 2,
              textShadow: darkMode
                ? "0 2px 10px rgba(255,165,0,0.3)"
                : "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            CONTRLZ
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            sx={{
              display: { xs: "none", md: "block" },
              maxWidth: "80%",
              mx: "auto",
            }}
          >
            Smarter Automation, Limitless Control
          </Typography>
        </Box>

        {/* Form Section */}
        <Box
          sx={{
            flex: { xs: 1, md: 1.2 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "450px",
            position: "relative",
          }}
        >
          {/* Form Type Toggle */}
          <Paper
            elevation={3}
            sx={{
              display: "flex",
              borderRadius: "30px",
              mb: 3,
              overflow: "hidden",
              p: 0.5,
              bgcolor: darkMode
                ? "rgba(30,30,30,0.7)"
                : "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Button
              variant="contained"
              disableElevation
              color={activeForm === "login" ? "primary" : "inherit"}
              sx={{
                px: 4,
                py: 1.2,
                fontSize: "0.95rem",
                borderRadius: "25px",
                minWidth: "120px",
                bgcolor:
                  activeForm === "login" ? "primary.main" : "transparent",
                color:
                  activeForm === "login"
                    ? "#fff"
                    : darkMode
                    ? "text.primary"
                    : "text.secondary",
                "&:hover": {
                  bgcolor:
                    activeForm === "login"
                      ? "primary.dark"
                      : darkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => switchForm("login")}
              aria-pressed={activeForm === "login"}
            >
              Login
            </Button>
            <Button
              variant="contained"
              disableElevation
              color={activeForm === "signup" ? "secondary" : "inherit"}
              sx={{
                px: 4,
                py: 1.2,
                fontSize: "0.95rem",
                borderRadius: "25px",
                minWidth: "120px",
                bgcolor:
                  activeForm === "signup" ? "secondary.main" : "transparent",
                color:
                  activeForm === "signup"
                    ? "#fff"
                    : darkMode
                    ? "text.primary"
                    : "text.secondary",
                "&:hover": {
                  bgcolor:
                    activeForm === "signup"
                      ? "secondary.dark"
                      : darkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => switchForm("signup")}
              aria-pressed={activeForm === "signup"}
            >
              Sign Up
            </Button>
          </Paper>

          {/* Form Container */}
          <Box
            component={motion.div}
            key={activeForm}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            sx={{ width: "100%" }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 4,
                borderRadius: "16px",
                bgcolor: darkMode
                  ? "rgba(30,30,40,0.85)"
                  : "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                boxShadow: darkMode
                  ? "0 15px 25px rgba(0,0,0,0.3)"
                  : "0 15px 25px rgba(0,0,0,0.1)",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h5"
                mb={3}
                fontWeight="bold"
                color="text.primary"
              >
                {activeForm === "login" ? "Welcome Back!" : "Create an Account"}
              </Typography>

              {activeForm === "login" ? (
                <form onSubmit={handleLogin} noValidate>
                  <TextField
                    fullWidth
                    id="login-username"
                    label="Username"
                    type="text"
                    margin="normal"
                    name="username"
                    value={loginData.username}
                    onChange={(e) => handleChange(e, "login")}
                    error={formSubmitted && !!formErrors.login.username}
                    helperText={formSubmitted && formErrors.login.username}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                    autoComplete="username"
                    autoFocus
                    required
                  />

                  <TextField
                    fullWidth
                    id="login-password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    margin="normal"
                    name="password"
                    value={loginData.password}
                    onChange={(e) => handleChange(e, "login")}
                    error={formSubmitted && !!formErrors.login.password}
                    helperText={formSubmitted && formErrors.login.password}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="current-password"
                    required
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: 1,
                      py: 1.5,
                      fontSize: "1rem",
                      borderRadius: "10px",
                      position: "relative",
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "all 0.3s ease",
                      },
                      "&:hover::after": {
                        left: "100%",
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} noValidate>
                  <TextField
                    fullWidth
                    id="signup-username"
                    label="Username"
                    type="text"
                    margin="normal"
                    name="username"
                    value={signupData.username}
                    onChange={(e) => handleChange(e, "signup")}
                    error={formSubmitted && !!formErrors.signup.username}
                    helperText={formSubmitted && formErrors.signup.username}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                    required
                    autoFocus
                  />

                  <TextField
                    fullWidth
                    id="signup-email"
                    label="Email"
                    type="email"
                    margin="normal"
                    name="email"
                    value={signupData.email}
                    onChange={(e) => handleChange(e, "signup")}
                    error={formSubmitted && !!formErrors.signup.email}
                    helperText={formSubmitted && formErrors.signup.email}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                    required
                  />

                  <TextField
                    fullWidth
                    id="signup-password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    margin="normal"
                    name="password"
                    value={signupData.password}
                    onChange={(e) => handleChange(e, "signup")}
                    error={formSubmitted && !!formErrors.signup.password}
                    helperText={formSubmitted && formErrors.signup.password}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    required
                  />

                  <TextField
                    fullWidth
                    id="signup-confirm-password"
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    margin="normal"
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={(e) => handleChange(e, "signup")}
                    error={formSubmitted && !!formErrors.signup.confirmPassword}
                    helperText={
                      formSubmitted && formErrors.signup.confirmPassword
                    }
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                    required
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="secondary"
                    sx={{
                      mt: 1,
                      py: 1.5,
                      fontSize: "1rem",
                      borderRadius: "10px",
                      position: "relative",
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "all 0.3s ease",
                      },
                      "&:hover::after": {
                        left: "100%",
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Toast container for notifications */}
      <ToastContainer />
    </Box>
  );
};

export default LoginRegister;
