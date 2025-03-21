# ControlZ - IoT-based Hostel Automation System

ControlZ is an advanced IoT-based hostel automation system that enables remote control of electrical appliances such as fans and lights. This system integrates a **React** frontend, a **Spring Boot** backend, and an **MQTT**-based communication layer to interact with an **Arduino** microcontroller. ControlZ offers user authentication, real-time device monitoring, and statistical tracking of power usage.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Hardware Setup](#hardware-setup)
- [MQTT Communication](#mqtt-communication)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)

---

## Features
✅ **User Authentication** - Secure login and role-based access using JWT authentication.
✅ **Device Control** - Turn devices ON/OFF remotely via a user-friendly interface.
✅ **Real-time Status Updates** - Fetch and display the current state of appliances.
✅ **MQTT Integration** - Seamless communication between backend and Arduino for IoT control.
✅ **Data Analytics** - Track device usage statistics (ON/OFF duration, total time used).
✅ **Responsive UI** - Built with Material UI for an optimized experience on all devices.
✅ **Secure API Endpoints** - Spring Boot backend ensures secure data handling.

---

## Technology Stack
### Frontend (React + MUI)
- **React.js** - Component-based UI
- **Material UI (MUI)** - Styled UI components
- **React Router DOM** - Client-side routing
- **Axios** - API communication

### Backend (Spring Boot + MQTT)
- **Java 21** - Modern Java development
- **Spring Boot** - REST API backend
- **MongoDB** - NoSQL database for device tracking
- **JWT Authentication** - Secure login mechanism
- **Mosquitto MQTT Broker** - Communication with Arduino

### Hardware & IoT
- **Arduino Uno** - Microcontroller for appliance control
- **WeMos Board** - Wi-Fi module for MQTT messaging
- **Relay Module** - Switching circuit for high-power devices
- **Breadboard & Wires** - Circuit prototyping
- **7-Segment LED Display** - Visual representation of device status

---

## Architecture
```
Frontend (React) <--> Backend (Spring Boot) <--> MQTT Broker <--> Arduino (Hardware)
```

1. User interacts with the **React UI** to control devices.
2. **Spring Boot Backend** processes requests and updates the database.
3. **MQTT Broker (Mosquitto)** relays messages to Arduino.
4. **Arduino executes commands** to turn appliances ON/OFF.

---

## Installation & Setup
### Prerequisites
- Node.js & npm (for frontend)
- Java 21 & Maven (for backend)
- MongoDB (local or cloud instance)
- Mosquitto MQTT Broker
- Arduino IDE (for hardware programming)

### Steps
#### 1️⃣ Clone the Repository
```sh
git clone https://github.com/karthikeya-bhamidipati/controlz.git
cd controlz
```
#### 2️⃣ Backend Setup (Spring Boot)
```sh
cd backend
mvn clean install
mvn spring-boot:run
```
#### 3️⃣ Frontend Setup (React)
```sh
cd frontend
npm install
npm start
```
#### 4️⃣ Configure MQTT Broker (Mosquitto)
- Install Mosquitto and start the broker.
- Ensure Arduino is connected to the MQTT broker.

---

## Hardware Setup
### 1️⃣ Arduino & Relay Wiring
The relay module is used to control high-power appliances like bulbs or fans. The wiring is as follows:
- **Control Side:**
  - **S (Signal)** → Connected to an Arduino digital pin
  - **+ (5V)** → Connected to Arduino 5V
  - **- (GND)** → Connected to Arduino Ground
- **Load Side:**
  - **COM (Common)** → Connected to power source
  - **NO (Normally Open)** → Connected to one side of the bulb
  - **Other side of the bulb** → Connected to power source
- When the relay is **HIGH**, the circuit is complete, and the bulb turns ON.
- When the relay is **LOW**, the circuit breaks, turning the bulb OFF.

### 2️⃣ 7-Segment LED Display Setup
- Each segment of the LED display is connected to a specific Arduino pin.
- The common cathode is connected to **GND**.
- The Arduino sends signals to illuminate the required segments based on user input.

---

## MQTT Communication
ControlZ uses **Mosquitto MQTT Broker** for message passing between the backend and Arduino.

### Topics Used
- **controlz/devices/on** → Turns a device ON
- **controlz/devices/off** → Turns a device OFF
- **controlz/status** → Fetches current status of devices

### Sample MQTT Message
```json
{
  "deviceId": "fan_1",
  "status": "ON"
}
```

### How It Works
1. The **React UI** sends an ON/OFF command to the **Spring Boot backend**.
2. The backend publishes a message to the MQTT broker.
3. **Arduino subscribes** to the MQTT topics and processes the received command.
4. The status is updated in **MongoDB**, and the UI reflects the changes in real-time.

---

## Troubleshooting
### 🛑 Device Not Responding
- Ensure that **Arduino is connected** to the Wi-Fi.
- Check if the **MQTT Broker is running**.
- Verify **Mosquitto configuration** (port, username, password).

### 🛑 API Not Working
- Ensure the **backend is running** (`mvn spring-boot:run`).
- Check if **MongoDB is accessible** (`mongod --dbpath /path/to/data`).
- Inspect API logs for errors.

### 🛑 Frontend Not Loading
- Run `npm start` in the frontend directory.
- Verify `package.json` dependencies.
- Check for browser console errors (`F12 > Console`).

---

## Contributors
👤 **Karthikeya Bhamidipati** - Lead Developer  
👤 **Padmanabha Sayee** - Backend Developer  
👤 **Divya Garg** - UI/UX & Frontend Developer  

---

ControlZ is an open-source project designed to optimize hostel automation and energy efficiency. 🚀
