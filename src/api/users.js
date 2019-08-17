import axios from "axios";

// Returns all the users
const getAllUsers = async (token, params) => {
  const response = await axios({
    url: "/api/v1/users",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  }).catch((error) => {
    return error.response;
  });

  return response;
};

// Returns a user
const getUser = async (token, userID = "me") => {
  const response = await axios({
    url: `/api/v1/users/${userID}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch((error) => {
    return error.response;
  });

  return response;
};

// Update current user
const patchCurrUser = async (token, updateParams) => {
  const response = await axios({
    url: `/api/v1/users/me`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: updateParams,
    method: "patch",
  }).catch((error) => {
    return error.response;
  });

  return response;
};

// Replaces current user's tags
const putCurrUserTags = async (token, updateParams) => {
  const response = await axios({
    url: `/api/v1/users/me/tags`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: updateParams,
    method: "put",
  }).catch((error) => {
    return error.response;
  });

  return response;
};

export { getAllUsers, getUser, patchCurrUser, putCurrUserTags };
