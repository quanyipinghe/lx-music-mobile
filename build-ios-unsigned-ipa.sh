#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$ROOT_DIR/build"
DERIVED_DATA_PATH="$BUILD_DIR/DerivedData"
WORKSPACE="$ROOT_DIR/ios/LxMusicMobile.xcworkspace"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
VERSION_CODE="$(node -p "require('$ROOT_DIR/package.json').versionCode")"
IPA_PATH="$BUILD_DIR/lx-music-mobile-v${VERSION}-ios-unsigned.ipa"
CMAKE_BINARY="$(command -v cmake)"

cd "$ROOT_DIR"
mkdir -p "$BUILD_DIR"

RCT_BUILD_HERMES_FROM_SOURCE=true NO_FLIPPER=1 pod install --project-directory=ios

# CMake 4 removed CMP0026 OLD; an unsigned IPA does not need Hermes dSYM files.
sed -i '' 's/if (POLICY CMP0026)/if (POLICY CMP0026 AND CMAKE_VERSION VERSION_LESS 4.0)/' ios/Pods/hermes-engine/CMakeLists.txt
sed -i '' 's/if(HERMES_BUILD_APPLE_DSYM)/if(HERMES_BUILD_APPLE_DSYM AND CMAKE_VERSION VERSION_LESS 4.0)/' ios/Pods/hermes-engine/API/hermes/CMakeLists.txt

TOOLCHAINS=com.apple.dt.toolchain.XcodeDefault xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme LxMusicMobile \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DERIVED_DATA_PATH" \
  PRODUCT_BUNDLE_IDENTIFIER=cn.toside.music.mobile \
  MARKETING_VERSION="$VERSION" \
  CURRENT_PROJECT_VERSION="$VERSION_CODE" \
  CMAKE_BINARY="$CMAKE_BINARY" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  clean build 2>&1 | tee "$BUILD_DIR/xcodebuild.log"

APP_PATH="$(find "$DERIVED_DATA_PATH/Build/Products/Release-iphoneos" -maxdepth 1 -name '*.app' -print -quit)"
test -n "$APP_PATH"

rm -rf "$BUILD_DIR/Payload"
mkdir -p "$BUILD_DIR/Payload"
cp -R "$APP_PATH" "$BUILD_DIR/Payload/"
rm -f "$IPA_PATH"
(
  cd "$BUILD_DIR"
  zip -qry "$IPA_PATH" Payload
)

echo "Unsigned IPA: $IPA_PATH"
