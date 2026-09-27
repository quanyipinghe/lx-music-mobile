#!/usr/bin/env bash

set -u

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "用法: $0 <重签后的 IPA>" >&2
  exit 2
fi

IPA_PATH="$1"
TMP_DIR="$(mktemp -d /tmp/lx-ipa-signing.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

unzip -q "$IPA_PATH" -d "$TMP_DIR" || exit 1
shopt -s nullglob
APP_PATHS=("$TMP_DIR"/Payload/*.app)
if [ "${#APP_PATHS[@]}" -ne 1 ]; then
  echo "[失败] Payload 中应有且仅有一个 .app" >&2
  exit 1
fi
APP_PATH="${APP_PATHS[0]}"
INFO_PLIST="$APP_PATH/Info.plist"
PROFILE="$APP_PATH/embedded.mobileprovision"
ENTITLEMENTS_PLIST="$TMP_DIR/entitlements.plist"
PROFILE_PLIST="$TMP_DIR/profile.plist"
FAILED=0

pass() { echo "[通过] $1"; }
fail() { echo "[失败] $1" >&2; FAILED=1; }
plist_value() { /usr/libexec/PlistBuddy -c "Print :$2" "$1" 2>/dev/null; }

BUNDLE_ID="$(plist_value "$INFO_PLIST" CFBundleIdentifier)"
if [ -n "$BUNDLE_ID" ]; then
  pass "CFBundleIdentifier = $BUNDLE_ID"
else
  fail "无法读取 CFBundleIdentifier"
fi

if plist_value "$INFO_PLIST" UIBackgroundModes | grep -qx '[[:space:]]*audio'; then
  pass "UIBackgroundModes 包含 audio"
else
  fail "UIBackgroundModes 不包含 audio"
fi

if codesign -d --entitlements :- "$APP_PATH" >"$ENTITLEMENTS_PLIST" 2>"$TMP_DIR/codesign.log" \
    && [ -s "$ENTITLEMENTS_PLIST" ] \
    && ! grep -q 'invalid entitlements blob' "$TMP_DIR/codesign.log"; then
  SIGNED_APP_ID="$(plist_value "$ENTITLEMENTS_PLIST" application-identifier)"
  if [ -n "$SIGNED_APP_ID" ]; then
    pass "签名 entitlements 可解析：$SIGNED_APP_ID"
  else
    fail "签名 entitlements 缺少 application-identifier"
  fi
else
  SIGNED_APP_ID=""
  fail "主程序签名 entitlements 无效"
fi

if [ ! -f "$PROFILE" ]; then
  fail "缺少 embedded.mobileprovision"
elif security cms -D -i "$PROFILE" -o "$PROFILE_PLIST" 2>"$TMP_DIR/profile.log" \
    || openssl smime -inform der -verify -noverify -in "$PROFILE" -out "$PROFILE_PLIST" 2>>"$TMP_DIR/profile.log"; then
  PROFILE_APP_ID="$(plist_value "$PROFILE_PLIST" Entitlements:application-identifier)"
  if [ -n "$PROFILE_APP_ID" ]; then
    pass "描述文件 application-identifier = $PROFILE_APP_ID"
  else
    fail "描述文件缺少 application-identifier"
  fi
else
  PROFILE_APP_ID=""
  fail "embedded.mobileprovision 无法解析"
fi

if [ -n "${PROFILE_APP_ID:-}" ] && [ -n "$BUNDLE_ID" ]; then
  TEAM_ID="${PROFILE_APP_ID%%.*}"
  EXPECTED_APP_ID="$TEAM_ID.$BUNDLE_ID"
  if [ "$PROFILE_APP_ID" = "$EXPECTED_APP_ID" ]; then
    pass "描述文件 App ID 与 bundle ID 匹配"
  else
    fail "描述文件 App ID 不匹配，应为 $EXPECTED_APP_ID"
  fi

  if [ -n "$SIGNED_APP_ID" ] && [ "$SIGNED_APP_ID" = "$EXPECTED_APP_ID" ]; then
    pass "签名 App ID 与 bundle ID 匹配"
  elif [ -n "$SIGNED_APP_ID" ]; then
    fail "签名 App ID 不匹配，应为 $EXPECTED_APP_ID"
  fi
fi

if [ "$FAILED" -ne 0 ]; then
  echo "校验失败：请用匹配 bundle ID 的描述文件重新签名。" >&2
  exit 1
fi

echo "校验通过：IPA 的签名身份与后台音频声明一致。"
echo "提醒：更换签名证书或描述文件后必须重新签名并再次校验；仅当新描述文件的 application-identifier 去掉 Team ID 前缀后与当前 Bundle ID 不同时，才需要修改 Bundle ID。"
