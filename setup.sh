#!/bin/bash

# Install Python and pip
sudo apt update
sudo apt install -y python3 python3-pip

# Install project dependencies
pip3 install -r requirements.txt

# Make sure we have ngrok installed
chmod +x ngrok
