#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$ROOT_DIR/build"
DERIVED_DATA_PATH="$BUILD_DIR/DerivedData"
WORKSPACE="$ROOT_DIR/ios/LxMusicMobile.xcworkspace"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
VERSION_CODE="$(node -p "require('$ROOT_DIR/package.json').versionCode")"
IPA_PATH="$BUILD_DIR/lx-music-mobile-v${VERSION}-ios-unsigned.ipa"
CMAKE_BINARY="$(command -v cmake || true)"

# 默认构建配置
DO_CLEAN=false
FORCE_POD=false

for arg in "$@"; do
  case "$arg" in
    --clean)
      DO_CLEAN=true
      ;;
    --pod)
      FORCE_POD=true
      ;;
    -h|--help)
      echo "用法: $0 [选项]"
      echo "选项:"
      echo "  --clean    执行 clean build（清空构建缓存，进行全量构建）"
      echo "  --pod      强制重新执行 pod install"
      echo "  -h, --help 显示帮助信息"
      exit 0
      ;;
    *)
      echo "未知参数: $arg (支持: --clean, --pod, -h/--help)"
      exit 1
      ;;
  esac
done

cd "$ROOT_DIR"
mkdir -p "$BUILD_DIR"

# 1. 自动缓存与使用 Hermes 官方预编译包（避免本地全核 C++ 编译）
RN_VERSION="$(node -p "require('$ROOT_DIR/node_modules/react-native/package.json').version")"
HERMES_CACHE_DIR="$HOME/Library/Caches/hermes-engine-artifacts"
HERMES_TARBALL="${HERMES_ENGINE_TARBALL_PATH:-$HERMES_CACHE_DIR/react-native-artifacts-${RN_VERSION}-hermes-ios-release.tar.gz}"

if [ ! -f "$HERMES_TARBALL" ]; then
  mkdir -p "$(dirname "$HERMES_TARBALL")"
  echo "==> 正在检测/下载 Hermes 预编译包 (版本: ${RN_VERSION}，约 13MB，仅需下载一次)..."
  MAVEN_URL="https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/${RN_VERSION}/react-native-artifacts-${RN_VERSION}-hermes-ios-release.tar.gz"
  if curl -fL --connect-timeout 15 --retry 2 "$MAVEN_URL" -o "$HERMES_TARBALL.tmp" 2>/dev/null; then
    mv "$HERMES_TARBALL.tmp" "$HERMES_TARBALL"
    echo "==> Hermes 预编译包已就绪: $HERMES_TARBALL"
  else
    rm -f "$HERMES_TARBALL.tmp"
    echo "==> [提示] Hermes 预编译包下载未完成，若本地无网络/代理，将兜底使用源码编译。"
  fi
fi

# 2. 检查是否需要执行 pod install
NEED_POD=false
if [ "$FORCE_POD" = true ] || [ ! -d "ios/Pods" ] || [ ! -f "ios/Pods/Manifest.lock" ]; then
  NEED_POD=true
elif ! cmp -s ios/Podfile.lock ios/Pods/Manifest.lock; then
  NEED_POD=true
fi

if [ "$NEED_POD" = true ]; then
  echo "==> 正在执行 pod install..."
  if [ -f "$HERMES_TARBALL" ]; then
    echo "==> 启用预编译 Hermes: $HERMES_TARBALL"
    RCT_BUILD_HERMES_FROM_SOURCE=false HERMES_ENGINE_TARBALL_PATH="$HERMES_TARBALL" NO_FLIPPER=1 pod install --project-directory=ios
  else
    echo "==> 警告: 未找到预编译包，使用源码编译 Hermes (将占用较多 CPU)..."
    RCT_BUILD_HERMES_FROM_SOURCE=true NO_FLIPPER=1 pod install --project-directory=ios
    # CMake 4 兼容补丁（仅在源码编译时需要）
    if [ -f "ios/Pods/hermes-engine/CMakeLists.txt" ]; then
      sed -i '' 's/if (POLICY CMP0026)/if (POLICY CMP0026 AND CMAKE_VERSION VERSION_LESS 4.0)/' ios/Pods/hermes-engine/CMakeLists.txt
      sed -i '' 's/if(HERMES_BUILD_APPLE_DSYM)/if(HERMES_BUILD_APPLE_DSYM AND CMAKE_VERSION VERSION_LESS 4.0)/' ios/Pods/hermes-engine/API/hermes/CMakeLists.txt
    fi
  fi
else
  echo "==> Pod 依赖未变动，跳过 pod install。"
fi

# 3. 校验并确保 Hermes 二进制库匹配 iOS 真机架构 (避免之前运行模拟器导致残留 simulator 架构报错)
HERMES_IOS_FRAMEWORK="ios/Pods/hermes-engine/destroot/Library/Frameworks/ios/hermes.framework"
if [ -f "$HERMES_TARBALL" ]; then
  IS_DEVICE_FRAMEWORK=false
  if [ -f "$HERMES_IOS_FRAMEWORK/hermes" ]; then
    if vtool -show "$HERMES_IOS_FRAMEWORK/hermes" 2>/dev/null | grep -q "platform IOS$"; then
      IS_DEVICE_FRAMEWORK=true
    fi
  fi
  if [ "$IS_DEVICE_FRAMEWORK" = false ]; then
    echo "==> 正在同步 Hermes 真机 (arm64) 二进制库..."
    TMP_EXTRACT="$(mktemp -d)"
    tar -xf "$HERMES_TARBALL" -C "$TMP_EXTRACT"
    mkdir -p "$(dirname "$HERMES_IOS_FRAMEWORK")"
    rm -rf "$HERMES_IOS_FRAMEWORK"
    cp -R "$TMP_EXTRACT/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64/hermes.framework" "$HERMES_IOS_FRAMEWORK"
    if [ ! -d "ios/Pods/hermes-engine/destroot/include" ] && [ -d "$TMP_EXTRACT/destroot/include" ]; then
      cp -R "$TMP_EXTRACT/destroot/include" "ios/Pods/hermes-engine/destroot/"
    fi
    rm -rf "$TMP_EXTRACT"
    echo "==> Hermes 真机库同步完成。"
  fi
elif [ -f "$HERMES_IOS_FRAMEWORK/hermes" ]; then
  if ! vtool -show "$HERMES_IOS_FRAMEWORK/hermes" 2>/dev/null | grep -q "platform IOS$"; then
    echo "==> 检测到当前 Hermes 为模拟器版本，清理以触发真机重编..."
    rm -rf "$HERMES_IOS_FRAMEWORK"
    rm -rf "ios/Pods/hermes-engine/build/iphonesimulator"
  fi
fi

# 4. 构建动作：支持增量构建与干净构建
BUILD_ACTION="build"
if [ "$DO_CLEAN" = true ]; then
  echo "==> 执行 clean build（全量重建）..."
  BUILD_ACTION="clean build"
else
  echo "==> 执行增量构建 (加速打包)..."
fi

echo "==> 正在执行 Xcode 构建 ($BUILD_ACTION)..."
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
  ${CMAKE_BINARY:+CMAKE_BINARY="$CMAKE_BINARY"} \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  $BUILD_ACTION 2>&1 | tee "$BUILD_DIR/xcodebuild.log"

APP_PATH="$(find "$DERIVED_DATA_PATH/Build/Products/Release-iphoneos" -maxdepth 1 -name '*.app' -print -quit)"
test -n "$APP_PATH"

echo "==> 正在封装 Payload 并压缩 IPA: $APP_PATH"
rm -rf "$BUILD_DIR/Payload"
mkdir -p "$BUILD_DIR/Payload"
cp -R "$APP_PATH" "$BUILD_DIR/Payload/"
rm -f "$IPA_PATH"
(
  cd "$BUILD_DIR"
  zip -qry "$IPA_PATH" Payload
)

echo "==> 打包完成！无签名 IPA 地址: $IPA_PATH"
