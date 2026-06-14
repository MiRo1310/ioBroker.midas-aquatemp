![Logo](admin/midas-aquatemp.png)

# ioBroker.midas-aquatemp

[![NPM version](https://img.shields.io/npm/v/iobroker.midas-aquatemp.svg)](https://www.npmjs.com/package/iobroker.midas-aquatemp)
[![Downloads](https://img.shields.io/npm/dm/iobroker.midas-aquatemp.svg)](https://www.npmjs.com/package/iobroker.midas-aquatemp)
![Number of Installations](https://iobroker.live/badges/midas-aquatemp-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/midas-aquatemp-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.midas-aquatemp.png?downloads=true)](https://nodei.co/npm/iobroker.midas-aquatemp/)

**Tests:
** ![Test and Release](https://github.com/Miro1310/ioBroker.midas-aquatemp/workflows/Test%20and%20Release/badge.svg)

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more
details and instructions on disabling error reporting, please refer to
the [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Use of Sentry reporting
starts with js-controller 3.0.

## midas-aquatemp adapter for ioBroker

## Documentation

### Configuration

| Field | Description |
|---|---|
| **Username** | Your Linked-Go cloud account e-mail address. It is strongly recommended to create a dedicated second account for the adapter, as simultaneous logins from other apps may cause conflicts. |
| **Password** | Password for the Linked-Go cloud account. |
| **Refresh interval** | How often the adapter polls the device for new data, in seconds. Minimum is 60 seconds. |
| **API Level** | The cloud API version used to communicate with the device. Start with **API 3** (default). If your device is not found or data is missing, try API 2 or API 1 instead. |
| **Device MAC** | MAC address of the device as shown in the Linked-Go app. Only required when **Use Device Mac** is enabled. |
| **Use Device Mac** | If enabled, the adapter skips the automatic device discovery and connects directly using the MAC address above. Use this if the device cannot be found via the normal device list. Note: the `flowSwitch` state may not be available in this mode on all devices. |
| **Allow insecure TLS** | Disables TLS certificate verification. **For troubleshooting only — not recommended for normal use.** |

### TLS notes

TLS certificate validation is enabled by default.

For troubleshooting only, insecure TLS mode can also be enabled via environment variable:

- `MIDAS_AQUATEMP_INSECURE_TLS=true`

Optional host allowlist to restrict insecure mode to specific hosts:

- `MIDAS_AQUATEMP_INSECURE_TLS_HOSTS=host1,host2`

When insecure mode is active, the adapter logs a warning on startup.

### Supported devices

The following devices are confirmed to work with this adapter.
Other [Midas](https://www.midas-gmbh.de/) / Poolsana devices that use the Linked-Go cloud API may also be compatible, but this cannot be guaranteed.

If your device is not listed and you have successfully used it with this adapter, feel free to open an issue or pull request to add it.

**Confirmed working:**

- Poolsana InverterPro Series (17, 21) with Wifi-Adapter for Midas Inverter-heater
- Poolsana Prime 8
- XPS-50, 5kW, COP5,1, until to 16m³

If you have problems, contact us.

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**

- FIX: Compatibility with the updated Linked-Go cloud API (API level 3 with new endpoint paths and camelCase parameters)
- FIX: Device discovery now tries both `deviceList` payload formats (default and legacy) to ensure devices are found regardless of API behaviour
- FIX: Numerous control and polling issues (mode, silent mode, set temperature, fault detection)
- FIX: Product-specific protocol codes for Poolsana vs. other devices
- FIX: TLS certificate validation enabled by default; optional insecure mode via adapter config or environment variable
- FIX: Invalid or missing sensor values are no longer written as `NaN`
- FEAT: Add `online` state — boolean datapoint that indicates whether the device is currently reachable via the cloud API
- CHORE: Update dependencies

### 1.2.5 (2025-08-02)

- Add size attributes to jsonConfig
- Minimal admin version: 7.4.10
- Breaking change: minimal supported node.js version is 20.x

### 1.2.4 (2025-06-01)

- Fix: Error in updateDeviceID: No device code found

### 1.2.3 (2025-06-01)

- FEAT: Add types, fix some errors

### 1.2.2 (2025-05-31)

- FIX: Reported errors by sentry

### 1.2.1 (2025-05-24)

- FIX: #50 Cannot read properties of undefined

### 1.2.0 (2025-05-21)

- FEAT: Add sentry to the adapter
- FIX: #24 Silent mode cannot be disabled
- FIX: #44 Cannot read properties of undefined (reading 'description')
- FEAT: Update dependencies and migrate to eslint 9

### 1.1.1 (2024-08-11)

- FIX: #17 state change mode

### 1.1.0 (2024-08-06)

- FEAT: Remove isPoolsana check
- FEAT: #16 Add flowSwitch

### 1.0.0 (2024-07-24)

- FEAT: Add writeable states
- FEAT: Data is also updated when the heating is off
- FIX: Get token
- FIX: #7 Error with useStore()

### 0.0.1 (11.07.2024)

- (Miro1310) initial release

## License

MIT License

Copyright (c) 2024-2026 Miro1310 <michael.roling@gmx.de>

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
