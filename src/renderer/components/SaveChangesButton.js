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
import PropTypes from "prop-types";
import classNames from "classnames";

import CircularProgress from "@material-ui/core/CircularProgress";
import green from "@material-ui/core/colors/green";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import CheckIcon from "@material-ui/icons/Check";
import SaveIcon from "@material-ui/icons/SaveAlt";
import { withStyles } from "@material-ui/core/styles";

import i18n from "../i18n";

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: "relative"
  },
  buttonSuccess: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700]
    }
  },
  fabProgress: {
    color: green[500],
    position: "absolute",
    top: -6,
    left: -6,
    zIndex: 1
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  icon: {
    marginRight: -16,
    zIndex: 1
  },
  disabled: {
    backgroundColor: "#ddd !important"
  },
  fab: {
    position: "fixed",
    justifyContent: "flex-end",
    bottom: 0,
    right: theme.spacing.unit * 4
  }
});

class SaveChangesButton extends React.Component {
  state = {
    inProgress: false,
    success: false
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleButtonClick = async event => {
    this.setState(
      {
        inProgress: true
      },
      async () => {
        await this.props.onClick(event);
        this.setState({
          success: true,
          inProgress: false
        });
        this.timer = setTimeout(() => {
          this.setState({ success: false });
        }, 2000);
      }
    );
  };

  render() {
    const { inProgress, success } = this.state;
    const { classes, successMessage } = this.props;
    const buttonClassname = classNames({
      [classes.buttonSuccess]: success
    });

    const textPart = !this.props.floating && (
      <div className={classes.wrapper}>
        <Button
          variant="contained"
          color="secondary"
          className={buttonClassname}
          disabled={inProgress || (this.props.disabled && !success)}
          onClick={this.handleButtonClick}
        >
          {success
            ? successMessage || i18n.components.save.success
            : this.props.children}
        </Button>
      </div>
    );

    return (
      <div
        className={classNames(
          classes.root,
          this.props.className,
          this.props.floating && classes.fab
        )}
      >
        <div className={classNames(classes.wrapper, classes.icon)}>
          <Fab
            disabled={inProgress || (this.props.disabled && !success)}
            color="secondary"
            className={buttonClassname}
            classes={{ disabled: classes.disabled }}
            onClick={this.handleButtonClick}
          >
            {success ? <CheckIcon /> : <SaveIcon />}
          </Fab>
          {inProgress && (
            <CircularProgress size={68} className={classes.fabProgress} />
          )}
        </div>
        {textPart}
      </div>
    );
  }
}

SaveChangesButton.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SaveChangesButton);
