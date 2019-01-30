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
import Button from "@material-ui/core/Button";
import i18n from "../i18n";

export default function DeviceMenu({ openBoardMenu, device }) {
  return (
    <Button
      onClick={openBoardMenu}
      disabled={!device.urls}
      color="inherit"
      className="button"
    >
      {i18n.app.device}: {device.displayName}
    </Button>
  );
}
