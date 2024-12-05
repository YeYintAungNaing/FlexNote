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
import InfoIcon from "@mui/icons-material/Info";
import BuildIcon from "@mui/icons-material/Build";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {  Routes, Route, Link } from 'react-router-dom';
import Notes from "./components/Notes";
import Setting from "./components/Setting";
import NoteEditor from "./components/NoteEditor";



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
    { text: "Home", icon: <HomeIcon />,path: "/" },
    { text: "About", icon: <InfoIcon />, path: "/setting" },
    { text: "Create", icon: <BuildIcon />, path: "/createNote" },
    { text: "Contact", icon: <ContactMailIcon/>, path: "/setting" },
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
        </Routes>
    
        </div>
      </main>
    </>
  );
};

export default App;
