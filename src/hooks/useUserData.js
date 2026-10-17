// Thin wrapper — all state and persistence logic lives in UserDataContext
// so a single instance owns reads/writes regardless of how many components call this hook.
import { useUserDataContext } from '../context/UserDataContext'

export default function useUserData() {
  return useUserDataContext()
}
