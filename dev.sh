#!/bin/bash
set -o errexit -o nounset # bash script safety

# For GWT download URLs see https://www.gwtproject.org/versions.html
GWT_VERSION="2.8.2"
#GWT_URL="https://github.com/gwtproject/gwt/releases/download/2.10.0/gwt-2.10.0.zip"
#GWT_URL="https://storage.googleapis.com/gwt-releases/gwt-2.9.0.zip"
GWT_URL="https://goo.gl/pZZPXS" # 2.8.2
#GWT_URL="https://goo.gl/TysXZl" # 2.8.1 (does not run)

SCRIPT_DIR="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
SDK_DIR="$SCRIPT_DIR/.."
GWT_DIR="$SDK_DIR/gwt-$GWT_VERSION"

WEB_PORT=${WEB_PORT:-8000}
WEB_BINDADDRESS=${WEB_BINDADDRESS:-127.0.0.1}
CODESERVER_BINDADDRESS=${CODESERVER_BINDADDRESS:-127.0.0.1}

compile() {
    ant build
}

package() {
    compile
    (
        cd "$SCRIPT_DIR/war"
        tar czf "$SCRIPT_DIR/circuitjs1.tar.gz" .
    )
}

setup() {
    # Install Java if no java compiler is present
    if ! which javac > /dev/null 2>&1 ||  ! which ant > /dev/null 2>&1; then
        echo "Installing packages may need your sudo password."
        set -x
        sudo apt-get update
        sudo apt-get install -y openjdk-8-jdk-headless ant
        set +x
    fi

    # Install NVM (Node Version Manager) if not present
    if ! command -v nvm > /dev/null 2>&1; then
        echo "Installing NVM. This may need your sudo password for curl or wget."
        set -x
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        set +x

        # Source NVM to make it available in the current shell
        # The install script usually adds these to .bashrc, .zshrc, or .profile
        # We need to source it manually for the current script to recognize 'nvm'
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
    fi

    # Install Node.js LTS version using NVM if no node command is found
    # We check for 'node' command directly, as 'nvm' might be present but no node version installed/used
    if ! which node > /dev/null 2>&1; then
        echo "Installing Node.js LTS version using NVM."
        set -x
        nvm install --lts
        nvm use --lts
        nvm alias default lts/* # Set LTS as the default version for new shells
        set +x
    else
        echo "Node.js is already installed. Verifying current version with NVM."
        # Optional: ensure the current node version is an LTS one, or a specific one
        # You might want to add logic here to check if the current node version
        # matches a desired version, and install/switch if it doesn't.
        # For simplicity, we'll just report the current version if it exists.
        node -v
        npm -v
    fi

    if ! [[ -d "$GWT_DIR" ]]; then
        mkdir -p "$SDK_DIR"
        (
            cd "$SDK_DIR"
            wget "$GWT_URL" -O "gwt-$GWT_VERSION.zip"
            unzip "gwt-$GWT_VERSION.zip"
            rm "gwt-$GWT_VERSION.zip"
            set +x
        )
    fi

    if [[ -e build.xml ]]; then
        mv build.xml build.xml.backup
    fi
    chmod +x "$GWT_DIR/webAppCreator"
    "$GWT_DIR/webAppCreator" -out ../tempProject com.lushprojects.circuitjs1.circuitjs1
    cp ../tempProject/build.xml ./
    sed -i 's/source="1.7"/source="1.8"/g' build.xml
    sed -i 's/target="1.7"/target="1.8"/g' build.xml
    rm -rf ../tempProject
}

codeserver() {
    mkdir -p war
    java -classpath "src:$GWT_DIR/gwt-codeserver.jar:$GWT_DIR/gwt-dev.jar:$GWT_DIR/gwt-user.jar" \
        com.google.gwt.dev.codeserver.CodeServer \
        -launcherDir war \
	-bindAddress ${CODESERVER_BINDADDRESS} \
        com.lushprojects.circuitjs1.circuitjs1
}

build_landing_page() {
    echo "Building landing page..."
    
    # Navigate to site-source directory
    cd "$SCRIPT_DIR/site-source" || {
        echo "Error: site-source directory not found"
        return 1
    }
    
    # Install dependencies
    echo "Installing npm dependencies..."
    npm install || {
        echo "Error: npm install failed"
        return 1
    }
    
    # Build the site
    echo "Building site..."
    npm run build || {
        echo "Error: npm build failed"
        return 1
    }
    
    # Create war directory if it doesn't exist
    mkdir -p "$SCRIPT_DIR/war"
    
    # Copy contents of site directory to war
    echo "Copying built files to war directory..."
    cp -r site/* "$SCRIPT_DIR/war/" || {
        echo "Error: copying files failed"
        return 1
    }
    
    echo "Landing page build complete"
}

webserver() {
    webroot="$SCRIPT_DIR/war"

    (
        cd $webroot
        python3 -m http.server --bind ${WEB_BINDADDRESS} ${WEB_PORT}
    )
}

start() {
    echo "Starting web server http://${WEB_BINDADDRESS}:${WEB_PORT}"
    trap "pkill -f \"python -m http.server\"" EXIT
        
    # Build landing page first
    build_landing_page || {
        echo "Failed to build landing page"
        return 1
    }

    webserver >"webserver.log" 2>&1 &
    sleep 0.5
    codeserver | tee "codeserver.log"
}


for func in $(compgen -A function); do
    if [[ $func == "$1" ]]; then
        shift
        $func "$@"
        exit $?
    fi
done

echo "Unknown command '$1'. Try one of the following:"
compgen -A function
exit 1
