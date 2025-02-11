import { useContext, useEffect, useState } from "react";
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HistoryIcon from '@mui/icons-material/History';
import {  Routes, Route, Link } from 'react-router-dom';
import Notes from "./components/Notes";
import Setting from "./components/Setting";
import NoteEditor from "./components/NoteEditor";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import EditNote from "./components/EditNote";
import EditProfile from "./components/EditProfile";
import { GlobalContext } from "./context/GlobalState";
import EditProfileImg from "./components/EditProfileImg";
import Logs from "./components/Logs";
//import AlertContext from "./context/AlertContext";

const drawerWidth = 170;

const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {currentUser} = useContext(GlobalContext);
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };


  const drawerStyle = {
    width: isDrawerOpen ? drawerWidth : 60, // Adjust width for mini variant
    transition: "width 0.3s",
    overflowX: "hidden",
    background: 'aliceblue'
  };

  const drawerContent = [
    { text: currentUser?.dName || 'Profile', icon: <AccountCircleIcon/>,path: "/" }, 
    { text: "Notes", icon: <StickyNote2Icon/>, path: "/notes" },
    { text: "Create", icon: <NoteAddIcon />, path: "/createNote" },
    { text: "Logs", icon: <HistoryIcon/>, path: "/logs" },
    { text: "testing", icon: <SettingsIcon/>, path: "/setting" },
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
            <Route path="/notes" element={<Notes />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/createNote" element={<NoteEditor />} />
            <Route path="/editNote/:id" element={<EditNote />} />
            <Route path="/register" element={<Register/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/" element={<Profile/>}></Route>
            <Route path="/editProfile" element={<EditProfile/>}></Route>
            <Route path="/editProfileImg" element={<EditProfileImg/>}></Route>
            <Route path="/logs" element={<Logs/>}></Route>
          </Routes>
           
        </div>
      </main>
    </>
  );
};

export default App;
