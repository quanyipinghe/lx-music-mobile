#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SIM_NAME="${1:-"iPhone 16 Pro"}"

echo "==> 检查 iOS 模拟器: $SIM_NAME ..."

# 查找匹配的模拟器设备信息
DEVICE_INFO=$(xcrun simctl list devices available | grep -F "$SIM_NAME" | head -n 1 || true)

if [ -z "$DEVICE_INFO" ]; then
  echo "未找到名为 '$SIM_NAME' 的模拟器，正在查找其它可用的 iPhone 模拟器..."
  DEVICE_INFO=$(xcrun simctl list devices available | grep -E "iPhone" | head -n 1 || true)
  if [ -z "$DEVICE_INFO" ]; then
    echo "错误: 没有找到任何可用的 iPhone 模拟器，请在 Xcode 中安装或创建模拟器。"
    exit 1
  fi
fi

# 提取名称与 UDID
DEVICE_NAME=$(echo "$DEVICE_INFO" | sed -E 's/^[[:space:]]*([^(]+)[[:space:]]*\(.*/\1/' | sed 's/[[:space:]]*$//')
DEVICE_UDID=$(echo "$DEVICE_INFO" | sed -E 's/.*\(([0-9A-Fa-f-]+)\).*/\1/')

echo "==> 目标设备: $DEVICE_NAME ($DEVICE_UDID)"

# 打开 Simulator 应用并开机
echo "==> 正在打开 Simulator 应用程序..."
open -a Simulator

if ! xcrun simctl list devices | grep "$DEVICE_UDID" | grep -q "Booted"; then
  echo "==> 正在启动模拟器 ($DEVICE_NAME)..."
  xcrun simctl boot "$DEVICE_UDID" 2>/dev/null || true
fi

# 聚焦模拟器窗口
osascript -e 'tell application "Simulator" to activate' 2>/dev/null || true

# 检查 8081 端口 Metro 是否已启动
if ! nc -z 127.0.0.1 8081 2>/dev/null; then
  echo "==> Metro Bundler (8081) 未运行，正在新打开的终端窗口启动 Metro..."
  osascript -e "tell application \"Terminal\" to do script \"cd \\\"$ROOT_DIR\\\" && npm start\"" 2>/dev/null || {
    echo "提示: 请在另一个终端运行 'npm start' 以提供热更新服务。"
  }
  sleep 2
else
  echo "==> Metro Bundler 已经在 8081 端口运行。"
fi

echo "==> 正在构建并运行应用到 $DEVICE_NAME ..."
npx react-native run-ios --simulator="$DEVICE_NAME"
