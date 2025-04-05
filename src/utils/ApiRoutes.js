export const host = 'http://10.130.234.25:8080'

// Authentication
export const registerRoute = `${host}/api/users/register`
export const loginRoute = `${host}/api/users/login`
export const changePasswordRoute = `${host}/api/users/change-password`

// User Management
export const getAllUsersRoute = `${host}/api/users/`
export const getUserRoute = `${host}/api/users/`
export const updateUserRoleRoute = `${host}/api/users/update-role`
export const bulkUpdateRoleRoute = `${host}/api/users/bulk-update-role`
export const resetPasswordRoute = `${host}/api/users/reset-password`
export const bulkResetPasswordRoute = `${host}/api/users/bulk-reset-password`
export const createUserRoute = `${host}/api/users/create-user`
export const bulkCreateUserRoute = `${host}/api/users/bulk-create-user`
export const deleteUserRoute = `${host}/api/users/delete-user`
export const bulkDeleteUserRoute = `${host}/api/users/bulk-delete-user`

// Device Management
export const allDeviceRoute = `${host}/api/devices/`
export const addDeviceRoute = `${host}/api/devices/addDevice`
export const updateDeviceRoute = `${host}/api/devices/update`
export const toggleDeviceRoute = `${host}/api/devices`
export const deleteDeviceRoute = `${host}/api/devices`
export const getRecentActivitiesRoute = `${host}/api/devices/recent-activity`
export const bulkCreateDeviceRoute = `${host}/api/devices/bulk-add`
export const bulkDeleteDeviceRoute = `${host}/api/devices/bulk-delete`
export const getLogsRoute = `${host}/api/devices/logs`
