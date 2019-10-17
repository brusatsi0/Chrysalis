/* chrysalis-hardware-keyboardio-atreus2 -- Chrysalis Atreus2 support
 * Copyright (C) 2019  Keyboardio, Inc.
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

import Keymap from "./components/Keymap"
import { Avr109, Avr109Bootloader } from "@chrysalis-api/flash"

const Atreus2 = {
    info: {
        vendor: "Keyboard.io",
        product: "Atreus2",
        displayName: "Atreus2",
        urls: [
            {
                name: "Homepage",
                url: "https://atreus.technomancy.us/"
            }
        ]
    },
    usb: {
        vendorId: 0x1209,
        productId: 0x2303
    },
    keyboard: {
        rows: 4,
        columns: 12
    },
    components: {
        keymap: Keymap
    },

    flash: async (_, filename) => {
      const board = {
        name: "Keyboardio Atreus2",
        baud: 9600,
        productId: ["0x2302", "0x2303"],
        protocol: "avr109",
        signature: new Buffer.from([0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e])
      }
      return Avr109(board, port, filename)
    }
}

export { Atreus2 }
