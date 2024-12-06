import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {  Routes, Route, Link } from 'react-router-dom';
import Notes from "./components/Notes";
import Setting from "./components/Setting";
import NoteEditor from "./components/NoteEditor";
import Register from "./components/Register";
import Login from "./components/Login";



const drawerWidth = 240;

const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawerStyle = {
    width: isDrawerOpen ? drawerWidth : 60, // Adjust width for mini variant
    transition: "width 0.3s",
    overflowX: "hidden",
  };

  const drawerContent = [
    { text: "Profile", icon: <AccountCircleIcon/>,path: "/register" }, 
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Create", icon: <NoteAddIcon />, path: "/createNote" },
    { text: "Setting", icon: <SettingsIcon/>, path: "/setting" },
    { text: "Login", icon: <SettingsIcon/>, path: "/login" }
  ];

  
  console.log('rendered')

  return (
    <>
      <CssBaseline />
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <h3>
            FlexNote
          </h3>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        PaperProps={{
          style: {
            ...drawerStyle,
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {drawerContent.map((item, index) => (
            <ListItem 
              button="true" 
              key={index} 
              component={Link}
              to={item.path}
              sx={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {isDrawerOpen && <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main className="mainscreen"
        style={{
          marginLeft: isDrawerOpen ? drawerWidth : 60,
          padding: "16px",
          transition: "margin-left 0.3s",
        }}
      >
        <Toolbar />
        <div className="currentPage">
        
        <Routes>
          <Route path="/" element={<Notes />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/createNote" element={<NoteEditor />} />
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
        </Routes>
    
        </div>
      </main>
    </>
  );
};

export default App;
