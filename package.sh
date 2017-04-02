# create a zip in root directory, excluding git and zip
# TODO: exlude useless things in node_modules
VERSION=$(grep -e "\"version\"" manifest.json | sed -E 's_.*([0-9]+.[0-9]+.[0-9]+).*_\1_')
ZIP_NAME=ninja-account-$VERSION.zip
pushd . && cd .. && zip -r $ZIP_NAME ninja-account/ -x ninja-account/.git/\* ninja-account/.gitignore ninja-account/*.zip && mv $ZIP_NAME ninja-account/ && popd
