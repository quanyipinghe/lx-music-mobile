import { strict as assert } from 'node:assert'
import { mergeUserApiBackup, type UserApiBackupItem } from '../src/utils/userApiBackup'

const item = (id: string, script = id): UserApiBackupItem => ({ id, script, allowShowUpdateAlert: true })
const current = [item('user_api_a', 'old'), item('user_api_keep')]
const merged = mergeUserApiBackup(current, [
  { ...item('user_api_a', 'new'), allowShowUpdateAlert: false },
  item('user_api_new'),
])

assert.deepEqual(merged, [
  { ...item('user_api_a', 'new'), allowShowUpdateAlert: false },
  item('user_api_keep'),
  item('user_api_new'),
])
assert.throws(() => mergeUserApiBackup(Array.from({ length: 20 }, (_, i) => item(`user_api_${i}`)), [item('user_api_20')]), /USER_API_LIMIT/)

console.log('user API backup merge check passed')
