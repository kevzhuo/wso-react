import {
  UPDATE_API_TOKEN,
  UPDATE_IDEN_TOKEN,
  UPDATE_USER,
  REMOVE_CREDS,
  UPDATE_REMEMBER,
  UPDATE_API,
} from "../constants/actionTypes";
import { WSO, API, NoAuthentication } from "wso-api-client";

import jwtDecode from "jwt-decode";

const API_CLIENT = new WSO(
  new API("http://localhost:8080", new NoAuthentication())
);

const INITIAL_STATE = {
  scope: [],
  identityToken: "",
  apiToken: "",
  expiry: 0,
  currUser: null, // Stores the user object.
  remember: false,
  tokenLevel: 0,
  api: API_CLIENT,
};

// Method to get scopes.
const parseToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    return null;
  }
};

// Updates the identity token
// TODO is it the identity token or api token that has scopes?
const updateIdenToken = (state, action) => {
  const token = action.token;

  return {
    ...state,
    identityToken: token,
  };
};

// Updates the token in the store. Checking of a error-free response should be done before this
// function call.
const updateAPIToken = (state, action) => {
  const token = action.token;
  const decoded = parseToken(token);

  return {
    ...state,
    scope: decoded.scope,
    apiToken: token,
    expiry: decoded.exp * 1000,
    tokenLevel: decoded.tokenLevel,
  };
};

// Updates the user
const updateUser = (state, action) => {
  const newUser = action.newUser;

  // Extract only certain fields
  const currUser = {
    id: newUser.id,
    admin: newUser.admin,
    unixID: newUser.unixID,
    dormRoomID: newUser.dormRoomID,
    hasAcceptedDormtrakPolicy: newUser.hasAcceptedDormtrakPolicy,
    type: newUser.type,
    dormRoom: newUser.dormRoom,
    dorm: newUser.dorm,
    pronoun: newUser.pronoun,
    visible: newUser.visible,
    homeVisible: newUser.homeVisible,
    dormVisible: newUser.dormVisible,
    offCycle: newUser.offCycle,
    factrakAdmin: newUser.factrakAdmin,
    hasAcceptedFactrakPolicy: newUser.hasAcceptedFactrakPolicy,
    factrakSurveyDeficit: newUser.factrakSurveyDeficit,
  };

  return { ...state, currUser };
};

// Updates the boolean indicating if user info should be stored
const updateRemember = (state, action) => {
  return { ...state, remember: action.remember };
};

// Updates the API object used for API calls
const updateAPI = (state, action) => {
  return { ...state, api: action.api };
};

// Remove authentication credentials from storage
const removeCreds = () => {
  return INITIAL_STATE;
};

function authReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_IDEN_TOKEN:
      return updateIdenToken(state, action);
    case UPDATE_API_TOKEN:
      return updateAPIToken(state, action);
    case UPDATE_USER:
      return updateUser(state, action);
    case REMOVE_CREDS:
      return removeCreds();
    case UPDATE_REMEMBER:
      return updateRemember(state, action);
    case UPDATE_API:
      return updateAPI(state, action);
    default:
      return state;
  }
}

export default authReducer;
