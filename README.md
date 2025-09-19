Open-Source Free Scheduler
A simple yet powerful, self-hosted, real-time meeting room booking system built with Node.js and WebSockets. This application is designed to run on tablets mounted at meeting room doors, displaying the current status and schedule.

The primary goal of this project is to provide a free and open-source alternative to expensive subscription-based services for small to medium-sized offices.

🚀 Core Features
Real-Time Updates: Any booking or cancellation made on one device is instantly reflected on all other connected clients.

Multi-Language Support: Supports Azerbaijani, English, and Russian out of the box.

Admin & User Roles: Admins can cancel any booking, while regular users can only manage their own bookings using a PIN.

Extend Meetings: Ongoing meetings can be extended by 15 or 30 minutes with a single click if the room is available.

Fully Self-Hosted: The application runs entirely on your local network without needing any external internet connection.

🔧 Setup Guide
Follow these steps to set up the system on your own local server (e.g., Ubuntu Server).

1. Prerequisites
Ensure you have Node.js and npm installed on your server. If not, you can install them with:

sudo apt update
sudo apt install nodejs npm -y

2. Get the Project Files
Clone this repository to your server:

git clone [https://github.com/DualStackAdmin/Open-Source-Free-Scheduler.git](https://github.com/DualStackAdmin/Open-Source-Free-Scheduler.git)
cd Open-Source-Free-Scheduler

3. Install Dependencies
Once inside the project directory, install the required packages using npm:

npm install

(This command will read package.json and install express and ws)

4. Configure File Permissions
This is a critical step to ensure the server can save booking data permanently. Run the following command to give the correct permissions to your user (e.g., ubuntu):

# Replace 'ubuntu' with your actual username if it's different
sudo chown -R ubuntu:ubuntu .

5. Launch the Application
Start the server with the following command to test if it's working:

node server.js

You should see the message Server is running at http://localhost:3000. Press Ctrl+C to stop it before the next step.

6. Set Up Auto-Start (Recommended)
To ensure the application runs automatically after a server reboot, it's best to run it as a systemd service.

a. Create the service file:

sudo nano /etc/systemd/system/meeting-room.service

b. Paste the following content into the file. Important: Replace /path/to/your/project with the actual path to your Open-Source-Free-Scheduler directory (e.g., /home/ubuntu/Open-Source-Free-Scheduler). Also, change ubuntu if your username is different.

[Unit]
Description=Meeting Room Display Service
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/path/to/your/project
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target

c. Enable and start the service:

sudo systemctl daemon-reload
sudo systemctl start meeting-room
sudo systemctl enable meeting-room

d. Check the status: You can check if the service is running correctly with:

sudo systemctl status meeting-room
