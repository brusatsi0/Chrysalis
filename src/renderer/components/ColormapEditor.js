// -*- mode: js-jsx -*-
/* chrysalis-bundle-keyboardio -- Chrysalis Bundle for Keyboard.io
 * Copyright (C) 2018  Keyboardio, Inc.
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
import PropTypes from "prop-types";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import { withSnackbar } from "notistack";

import Focus from "chrysalis-focus";

import Palette from "./ColormapEditor/Palette";
import Layer, { led_map } from "./ColormapEditor/Layer";

const styles = theme => ({
  tabs: {
    flexGrow: 1
  },
  editor: {
    margin: theme.spacing.unit * 3,
    display: "flex"
  },
  palette: {
    marginTop: theme.spacing.unit * 3,
    display: "inline",
    marginRight: theme.spacing.unit * 4,
    marginLeft: theme.spacing.unit * 8
  },
  layerRoot: {
    width: "100%"
  }
});

class ColormapEditor extends React.Component {
  state = {
    currentLayer: 0,
    currentKeyIndex: -1,
    modified: false,
    saving: false,
    selectedPaletteColor: -1,
    palette: [],
    colorMap: []
  };

  scanKeyboard = async () => {
    let focus = new Focus();

    try {
      console.log("Pulling the colormap...");
      let colormap = await focus.command("colormap");

      this.setState({
        palette: colormap.palette,
        colorMap: colormap.colorMap
      });
      console.log("done!");
    } catch (error) {
      this.props.enqueueSnackbar(error, { variant: "error" });
      this.props.onDisconnect();
    }
  };

  selectLayer = (event, value) => {
    this.setState({
      currentLayer: value,
      currentKeyIndex: -1
    });
  };

  onColorSelect = colorIndex => {
    this.setState({ selectedPaletteColor: colorIndex });
  };

  onColorPick = (colorIndex, r, g, b) => {
    let newPalette = this.state.palette.slice();
    newPalette[colorIndex] = {
      r: r,
      g: g,
      b: b,
      rgb: `rgb(${r}, ${g}, ${b})`
    };
    this.setState({
      palette: newPalette,
      modified: true
    });
  };

  onKeySelect = event => {
    event.preventDefault();
    let layer = parseInt(event.currentTarget.getAttribute("data-layer")),
      row = parseInt(event.currentTarget.getAttribute("data-key-row")),
      col = parseInt(event.currentTarget.getAttribute("data-key-col")),
      keyIndex = row * 16 + col,
      ledIndex = led_map[row][col];

    if (keyIndex == this.state.currentKeyIndex) {
      this.setState({ currentKeyIndex: -1 });
      return;
    }

    this.setState({
      currentLayer: layer,
      currentKeyIndex: keyIndex
    });
    if (this.state.selectedPaletteColor != -1) {
      this.setState(state => {
        let colormap = state.colorMap.slice();
        colormap[layer][ledIndex] = this.state.selectedPaletteColor;
        return colormap;
      });
      this.setState({ modified: true });
    }
  };

  onApply = async event => {
    event.preventDefault();
    this.setState({ saving: true });
    let focus = new Focus();
    await focus.command("colormap", this.state.palette, this.state.colorMap);
    this.setState({
      modified: false,
      saving: false
    });
    console.log("colormap updated");
  };

  render() {
    if (this.state.colorMap.length == 0) {
      this.scanKeyboard();
      return (
        <main>
          <LinearProgress variant="query" />
        </main>
      );
    }

    const { classes } = this.props;
    let saveButtonContent = "Save changes";
    if (this.state.saving) {
      saveButtonContent = (
        <div>
          <CircularProgress color="inherit" size={16} />
          &nbsp; Saving...
        </div>
      );
    }

    let tabs = this.state.colorMap.map((_, index) => {
      let label = "Layer #" + index.toString(),
        tabKey = "tab-layer-" + index.toString();
      return <Tab label={label} key={tabKey} />;
    });

    let colormap = (
      <Typography component="div" className={classes.layerRoot}>
        <Layer
          index={this.state.currentLayer}
          palette={this.state.palette}
          colormap={this.state.colorMap[this.state.currentLayer]}
          onKeySelect={this.onKeySelect}
          selectedKey={this.state.currentKeyIndex}
        />
      </Typography>
    );

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Tabs
              className={classes.tabs}
              value={this.state.currentLayer}
              scrollable
              scrollButtons="auto"
              onChange={this.selectLayer}
            >
              {tabs}
            </Tabs>
          </Toolbar>
        </AppBar>
        <div className={classes.editor}>
          {colormap}
          <Palette
            palette={this.state.palette}
            className={classes.palette}
            onColorSelect={this.onColorSelect}
            onColorPick={this.onColorPick}
          />
        </div>
        <Button
          className={classes.editor}
          onClick={this.onApply}
          variant="contained"
          color="secondary"
          disabled={!this.state.modified}
        >
          {saveButtonContent}
        </Button>
      </div>
    );
  }
}

ColormapEditor.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withSnackbar(withStyles(styles)(ColormapEditor));
