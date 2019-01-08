// -*- mode: js-jsx -*-
/* Chrysalis -- Kaleidoscope Command Center
 * Copyright (C) 2018, 2019  Keyboardio, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import Electron from "electron";
import { spawn } from "child_process";

import Focus from "@chrysalis-api/focus";
import "@chrysalis-api/keymap";
import "@chrysalis-api/colormap";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import ChatIcon from "@material-ui/icons/Chat";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import FeedbackIcon from "@material-ui/icons/Feedback";
import HighlightIcon from "@material-ui/icons/Highlight";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuIcon from "@material-ui/icons/Menu";
import SettingsIcon from "@material-ui/icons/Settings";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import usb from "usb";
import { withSnackbar } from "notistack";

import KeyboardSelect from "./screens/KeyboardSelect";
import ColormapEditor from "./screens/ColormapEditor";
import FirmwareUpdate from "./screens/FirmwareUpdate";
import LayoutEditor from "./screens/LayoutEditor";
import Settings from "./screens/Settings";
import Welcome from "./screens/Welcome";
import logo from "./logo-small.png";
import i18n from "./i18n";

let focus = new Focus();

const styles = theme => ({
  root: {
    display: "flex",
    flexDirection: "column"
  },
  content: {
    flexGrow: 1,
    overflow: "auto"
  },
  pageMenu: {
    marginLeft: theme.spacing.unit * 2
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  grow: {
    flexGrow: 1
  },
  drawer: {
    width: 350
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      boardAnchor: null,
      pageMenu: false,
      connected: false,
      device: null,
      pages: {},
      Page: KeyboardSelect
    };
  }
  flashing = false;

  componentDidMount() {
    usb.on("detach", device => {
      if (!focus.device) return;
      if (this.flashing) return;

      if (
        focus.device.usb.vendorId != device.deviceDescriptor.idVendor ||
        focus.device.usb.productId != device.deviceDescriptor.idProduct
      ) {
        return;
      }

      if (!focus._port.isOpen) {
        this.props.enqueueSnackbar(i18n.errors.deviceDisconnected, {
          variant: "warning"
        });
        focus.close();
        this.setState({
          connected: false,
          device: null,
          pages: {},
          Page: KeyboardSelect
        });
      }
    });
  }

  toggleFlashing = () => {
    this.flashing = !this.flashing;
    if (!this.flashing) {
      this.setState({
        connected: false,
        device: null,
        pages: {},
        Page: KeyboardSelect
      });
    }
  };

  onKeyboardConnect = async port => {
    focus.close();

    if (!port.comName) {
      this.setState({
        connected: true,
        pages: {},
        Page: Welcome,
        device: port.device
      });
      return;
    }

    console.log("Connecting to", port.comName);
    await focus.open(port.comName, port.device);
    if (process.platform == "darwin") {
      await spawn("stty", ["-f", port.comName, "clocal"]);
    }
    console.log("Probing for Focus support...");
    let commands = await focus.probe;
    try {
      commands = await focus.probe();
    } catch (e) {
      commands = [];
    }

    focus.setLayerSize(focus.device);

    this.setState({
      connected: true,
      device: null,
      pages: {
        keymap: commands.includes("keymap.map") > 0,
        colormap:
          commands.includes("colormap.map") > 0 &&
          commands.includes("palette") > 0
      },
      Page: commands.includes("keymap.map") > 0 ? LayoutEditor : Welcome
    });
  };

  onKeyboardDisconnect = () => {
    focus.close();
    this.setState({
      connected: false,
      device: null,
      pages: {},
      Page: KeyboardSelect
    });
  };

  boardMenu = event => {
    this.setState({ boardAnchor: event.currentTarget });
  };
  boardClose = () => {
    this.setState({ boardAnchor: null });
  };

  pageMenu = () => {
    this.setState({ pageMenu: true });
  };
  closePageMenu = () => {
    this.setState({ pageMenu: false });
  };

  openURL = url => {
    const shell = Electron.remote && Electron.remote.shell;

    if (!shell) return;

    return () => {
      shell.openExternal(url);
      this.boardClose();
    };
  };

  openPage = page => {
    this.setState({ Page: page });
  };

  render() {
    const { classes } = this.props;
    const { connected, pages, Page } = this.state;

    let focus = new Focus(),
      device =
        (focus.device && focus.device.info) ||
        (this.state.device && this.state.device.info);

    const { boardAnchor } = this.state;
    const boardOpen = Boolean(boardAnchor);
    const boardMenuItems =
      device &&
      device.urls &&
      device.urls.map(({ name, url }) => {
        return (
          <MenuItem key={name} onClick={this.openURL(url)}>
            {i18n.app.deviceMenu[name] || name}
          </MenuItem>
        );
      });
    const boardMenu = boardMenuItems && (
      <Menu anchorEl={boardAnchor} open={boardOpen} onClose={this.boardClose}>
        <MenuItem disabled>{device.displayName}</MenuItem>
        <Divider variant="middle" />
        {boardMenuItems}
      </Menu>
    );

    const deviceMenu = device && (
      <Button
        onClick={this.boardMenu}
        disabled={!boardMenu}
        color="inherit"
        className={classes.button}
      >
        {i18n.app.device}: {device.displayName}
      </Button>
    );

    const welcomeMenu = connected && !pages.keymap && !pages.colormap && (
      <ListItem
        button
        selected={this.state.Page == Welcome}
        onClick={() => {
          this.setState({ Page: Welcome });
        }}
      >
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.welcome} />
      </ListItem>
    );

    const keymapMenuItem = pages.keymap && (
      <ListItem
        button
        selected={this.state.Page == LayoutEditor}
        onClick={() => {
          this.setState({ Page: LayoutEditor });
        }}
      >
        <ListItemIcon>
          <KeyboardIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.layoutEditor} />
      </ListItem>
    );

    const colormapMenuItem = pages.colormap && (
      <ListItem
        button
        selected={this.state.Page == ColormapEditor}
        onClick={() => {
          this.setState({ Page: ColormapEditor });
        }}
      >
        <ListItemIcon>
          <HighlightIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.colormapEditor} />
      </ListItem>
    );

    const flashMenuItem = connected && (
      <ListItem
        button
        selected={this.state.Page == FirmwareUpdate}
        onClick={() => {
          this.setState({ Page: FirmwareUpdate });
        }}
      >
        <ListItemIcon>
          <CloudUploadIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.firmwareUpdate} />
      </ListItem>
    );

    const chatMenuItem = (
      <ListItem button onClick={this.openURL("https://discord.gg/GP473Fv")}>
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.chat} />
      </ListItem>
    );

    const feedbackMenuItem = (
      <ListItem
        button
        onClick={this.openURL("https://github.com/keyboardio/Chrysalis/issues")}
      >
        <ListItemIcon>
          <FeedbackIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.feedback} />
      </ListItem>
    );

    const settingsMenuItem = (
      <ListItem
        button
        selected={this.state.Page == Settings}
        onClick={() => {
          this.setState({ Page: Settings });
        }}
      >
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.settings} />
      </ListItem>
    );

    const keyboardSelectText = connected
      ? i18n.app.menu.selectAnotherKeyboard
      : i18n.app.menu.selectAKeyboard;
    const keyboardSelectMenuItem = (
      <ListItem
        button
        selected={this.state.Page == KeyboardSelect}
        onClick={() => {
          this.setState({ Page: KeyboardSelect });
        }}
      >
        <ListItemIcon>
          <KeyboardIcon />
        </ListItemIcon>
        <ListItemText primary={keyboardSelectText} />
      </ListItem>
    );

    const exitMenuItem = (
      <ListItem button onClick={() => Electron.remote.app.exit(0)}>
        <ListItemIcon>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.app.menu.exit} />
      </ListItem>
    );

    const homePage = connected
      ? this.state.pages.keymap
        ? LayoutEditor
        : Welcome
      : KeyboardSelect;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="static" color="inherit" id="appbar">
          <Toolbar variant="dense">
            <Button
              className={classes.menuButton}
              color="inherit"
              onClick={this.pageMenu}
            >
              <MenuIcon />
              <Typography
                variant="h6"
                color="inherit"
                className={classes.pageMenu}
                id="page-title"
              />
            </Button>
            <div className={classes.grow} />
            {deviceMenu}
            {boardMenu}
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <Page
            device={this.state.device}
            appBarElement={() => document.querySelector("#appbar")}
            titleElement={() => document.querySelector("#page-title")}
            onConnect={this.onKeyboardConnect}
            onDisconnect={this.onKeyboardDisconnect}
            openPage={this.openPage}
            toggleFlashing={this.toggleFlashing}
          />
        </main>
        <Drawer open={this.state.pageMenu} onClose={this.closePageMenu}>
          <div
            onClick={this.closePageMenu}
            role="button"
            onKeyDown={this.closePageMenu}
          >
            <div className={classes.toolbarIcon}>
              <IconButton
                onClick={() => {
                  this.openPage(homePage);
                }}
              >
                <img src={logo} />
              </IconButton>
            </div>
            <List className={classes.drawer}>
              {welcomeMenu}
              {keymapMenuItem}
              {colormapMenuItem}
              {flashMenuItem}
            </List>
            <Divider />
            <List className={classes.drawer}>
              {settingsMenuItem}
              {keyboardSelectMenuItem}
            </List>
            <Divider />
            <List className={classes.drawer}>
              {chatMenuItem}
              {feedbackMenuItem}
              {exitMenuItem}
            </List>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default withSnackbar(withStyles(styles)(App));
