# Start from the base Gradle image with JDK 8
FROM docker.io/library/gradle:jdk8-ubi

# Update microdnf and install necessary packages:
RUN microdnf update && \
    microdnf install -y python3 curl git && \
    microdnf clean all

# Define environment variables for NVM.
ENV NVM_DIR="/usr/local/nvm"
ENV NODE_VERSION="lts/*"

# Install nvm and the specified Node.js version.
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install ${NODE_VERSION} && \
    nvm use ${NODE_VERSION} && \
    nvm alias default ${NODE_VERSION}

# Copy your entire project source into the container.
# This includes your Gradle files and your 'site-source' directory.
COPY . /src

# Set the working directory to /src for subsequent commands.
WORKDIR /src

# --- Gradle Project Build Step ---
RUN echo "Running Gradle builds" && \
    gradle compileGwt --console verbose --info && \
    gradle makeSite --console verbose --info


# --- Node.js Project Build Step ---
RUN echo "Building Node.js project in /src/site-source" && \
    . "$NVM_DIR/nvm.sh" && \
    cd /src/site-source && \
    npm install && \
    npm run build

# Expose port 8000, as your Python HTTP server will listen on this port.
EXPOSE 8000

# The command to run when the container starts.
# This will start a simple HTTP server using Python to serve the built site.
CMD cd /src/site && python3 -m http.server