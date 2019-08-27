Chrysalis
=========

![Chrysalis screenshot](data/screenshot.png)

## Downloads

You can download pre-built binaries for the three major operating systems below:

[![Latest Linux build][badge:appimage]][build:appimage]
[![Latest OSX build][badge:dmg]][build:dmg]
[![Latest Windows build][badge:exe]][build:exe]

[![](https://img.shields.io/github/release-pre/keyboardio/Chrysalis.svg?style=for-the-badge)](https://github.com/keyboardio/Chrysalis/releases)

 [badge:appimage]: https://img.shields.io/badge/AppImage-latest-blue.svg?logo=linux&style=for-the-badge&logoColor=ffffff
 [badge:dmg]: https://img.shields.io/badge/dmg-latest-blue.svg?logo=apple&style=for-the-badge&logoColor=ffffff
 [badge:exe]: https://img.shields.io/badge/exe-latest-blue.svg?logo=windows&style=for-the-badge&logoColor=ffffff
 [build:appimage]: http://kaleidoscope-builds.s3-website-us-west-2.amazonaws.com/Chrysalis/latest/Chrysalis.AppImage
 [build:dmg]: http://kaleidoscope-builds.s3-website-us-west-2.amazonaws.com/Chrysalis/latest/Chrysalis.dmg
 [build:exe]: http://kaleidoscope-builds.s3-website-us-west-2.amazonaws.com/Chrysalis/latest/Chrysalis.exe

## About

Chrysalis is a graphical configurator for [Kaleidoscope][kaleidoscope]-powered
keyboards. While still heavily under development, it's at a stage where it is
already usable for a number of tasks. To try it, you don't even need to flash
`Kaleidoscope` beforehand, Chrysalis can do that for you, as it ships with
reasonable default firmware for each supported board.

 [kaleidoscope]: https://github.com/keyboardio/Kaleidoscope

The primary purpose of the application is to allow one to configure their
keyboard without having to compile or flash firmware, by storing the
configuration on the keyboard itself, in EEPROM. There are no external tools
required, just Chrysalis itself.

## Features

* **Layout editor** to edit the keymap on-the-fly, with the ability to copy one
  layer to another, and to set a default one.
* **Colormap editor** to edit the per-key LED colormap on boards that support it.
* **Firmware upgrade** to upload either the default, Chrysalis-enabled firmware that ships with the application, or a custom one.

## Supported Hardware

Chrysalis supports the [Keyboardio Model01][hw:model01], the [ErgoDox
EZ][hw:ergodox-ez] (and any other keyboard wired like the original ErgoDox), the
[Atreus][hw:atreus], and has preliminary support for [Dygma's Raise][hw:raise].
Support for more keyboards are under development.

 [hw:model01]: https://shop.keyboard.io/
 [hw:ergodox-ez]: https://ergodox-ez.com/
 [hw:atreus]: https://atreus.technomancy.us/
 [hw:raise]: https://www.dygma.com/raise/

## Supported operating systems

Chrysalis is primarily developed under Linux, but we target all three major
operating systems, and test our releases on Windows and OSX too. That said, our
testing is done on **Ubuntu** 18.04 LTS, **Windows** 10, and **OSX** Mojave.

The protocol Chrysalis uses to communicate with the keyboard requires USB serial
support, which is known to be problematic on Windows prior to Windows 10.

## Installation

### From installer packages

Click on the badge for your operating system's packaging system above


### macOS Homebrew

brew update && brew upgrade
brew cask install chrysalis


## Reporting issues

Chrysalis is alpha quality software. There will be bugs, missing features and
non-obvious things. Reporting any and all of these help us make the software
better, please feel free to [open issues][issues] liberally!

 [issues]: https://github.com/keyboardio/Chrysalis/issues

## Development

To launch the development environment, simply type `yarn && yarn start`. To do a
production build, use `yarn run build:all`, or limit it to a particular OS:
`yarn run build:linux`, `yarn run build:mac` or `yarn run build:win`. See the
`scripts` section of `package.json` for more scripts.
