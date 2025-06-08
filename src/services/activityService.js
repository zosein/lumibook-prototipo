// src/services/activityService.js
import api from "./api";

export const getUserActivities = async (userId, token, limit = 10) => {
	const res = await api.get(`/users/${userId}/activities?limit=${limit}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const getSystemActivities = async (token, limit = 10) => {
	const res = await api.get(`/auditoria/logs?limit=${limit}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};
