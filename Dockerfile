# Use official Node.js image based on Debian Bullseye
FROM node:18-bullseye

# Update and install python3 & pip needed for yt-dlp
RUN apt-get update && apt-get install -y python3 python3-pip

# Install yt-dlp globally via pip
RUN pip3 install yt-dlp

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy rest of the backend source code
COPY . .

# Expose port your app runs on
EXPOSE 3001

# Command to run your app
CMD ["npm", "start"]
