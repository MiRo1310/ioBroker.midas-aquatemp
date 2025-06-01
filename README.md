![Logo](admin/midas-aquatemp.png)

# ioBroker.midas-aquatemp

[![NPM version](https://img.shields.io/npm/v/iobroker.midas-aquatemp.svg)](https://www.npmjs.com/package/iobroker.midas-aquatemp)
[![Downloads](https://img.shields.io/npm/dm/iobroker.midas-aquatemp.svg)](https://www.npmjs.com/package/iobroker.midas-aquatemp)
![Number of Installations](https://iobroker.live/badges/midas-aquatemp-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/midas-aquatemp-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.midas-aquatemp.png?downloads=true)](https://nodei.co/npm/iobroker.midas-aquatemp/)

**Tests:** ![Test and Release](https://github.com/Miro1310/ioBroker.midas-aquatemp/workflows/Test%20and%20Release/badge.svg)

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and instructions on disabling error reporting, please refer to the [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Use of Sentry reporting starts with js-controller 3.0.

## midas-aquatemp adapter for ioBroker

## Documentation

-   Please create a second account only to use this with this adapter.
-   Than add username and password in the adapter ui.
-   Choose your api-level

If this don´t work you can add the device mac, which you can find in the app and check use device mac. This skips a part of the code, but should still work, maybe with a few limitations.

-   flowSwitch does not work for all devices

### Supported devices

-   Poolsana InverterPro Series (17, 21) with Wifi-Adapter for Mida Inverter-heater

If you have problems, contact us.

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
**WORK IN PROGRESS**

-   FEAT: Add types, fix some errors

### 1.2.2 (2025-05-31)

-   FIX: Reported errors by sentry

### 1.2.1 (2025-05-24)

-   FIX: #50 Cannot read properties of undefined

### 1.2.0 (2025-05-21)

-   FEAT: Add sentry to the adapter
-   FIX: #24 Silent mode cannot be disabled
-   FIX: #44 Cannot read properties of undefined (reading 'description')
-   FEAT: Update dependencies and migrate to eslint 9

### 1.1.1 (2024-08-11)

-   FIX: #17 state change mode

### 1.1.0 (2024-08-06)

-   FEAT: Remove isPoolsana check
-   FEAT: #16 Add flowSwitch

### 1.0.0 (2024-07-24)

-   FEAT: Add writeable states
-   FEAT: Data is also updated when the heating is off
-   FIX: Get token
-   FIX: #7 Error with useStore()

### 0.0.1 (11.07.2024)

-   (Miro1310) initial release

## License

MIT License

Copyright (c) 2024-2025 Miro1310 <michael.roling@gmx.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
