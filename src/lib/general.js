import jwtDecode from "jwt-decode";

// The current scopes
export const scopes = {
  // Global scopes:
  ScopeAdminAll: "admin:all",
  // Allows client to do write-level requests as long as it is scoped to models involving self, not all models
  ScopeWriteSelf: "write:self",

  // Service scopes. Permits clients to access services read only. If it is included with the global write-self scope,
  // allows write access to service, iff it is scoped to models owned and allowed to be edited by self.

  // Service: Factrak
  // Limited access to factrak for people with outstanding survey deficit
  ScopeFactrakLimited: "service:factrak:limited",
  // Full access to factrak for people with no survey deficit. Includes everything from ScopeFactrakLimited.
  ScopeFactrakFull: "service:factrak:full",
  // Allows admin access to factrak. This includes everything from ScopeFactrakFull, while also opening up
  // admin endpoints and allowing certain admin-level write actions (need write-self for normal actions, though).
  ScopeFactrakAdmin: "service:factrak:admin",

  // Service: Dormtrak
  // Access to dormtrak reviews, etc.
  ScopeDormtrak: "service:dormtrak",
  // Ability to create reviews, etc. (must be upperclass)
  ScopeDormtrakWrite: "service:dormtrak:write",

  ScopeEphcatch: "service:ephcatch",
  ScopeBulletin: "service:bulletin",
  // This is for facebook & users
  ScopeUsers: "service:users",
  // Allows you to access other services not mentioned above
  ScopeAllOther: "service:other",

  // Service: Ephmatch
  // Allows access to read/write self profile on Ephmatch. For when a user is eligible but not signed up
  ScopeEphmatch: "service:ephmatch",
  // Allows access to matches. For when a user is signed up but Ephmatch is closed
  ScopeEphmatchMatches: "service:ephmatch:matches",
  // Allows access to read profiles, write like/unlike. For when a user is signed up and Ephmatch is open
  ScopeEphmatchProfiles: "service:ephmatch:profiles",

  // Service: Goodrich
  // Allows access to read/write self goodrich orders and read goodrich menu
  ScopeGoodrich: "service:goodrich",
  // Allows access to read/write all goodrich orders and read/write goodrich menu
  ScopeGoodrichManager: "service:goodrich:manager",
};

/**
 * Checks if token contains any of the given scopes.
 *
 * @param {String} token - API token string.
 * @param {String[]} scopesToCheck - scopes to be checked against.
 */
export const containsOneOfScopes = (token, scopesToCheck) => {
  try {
    const decoded = jwtDecode(token);
    if (decoded.scope) {
      for (let i = 0; i < scopesToCheck.length; i += 1) {
        if (decoded.scope.indexOf(scopesToCheck[i]) !== -1) return true;
      }
    }
  } catch (err) {
    return false;
  }

  return false;
};

/**
 * Checks if token contains any of the given scopes.
 *
 * @param {String[]} tokenScopes - API token string.
 * @param {String[]} scopesToCheck - scopes to be checked against.
 */
export const scopesContainsOneOfScopes = (tokenScopes, scopesToCheck) => {
  try {
    if (tokenScopes) {
      for (let i = 0; i < scopesToCheck.length; i += 1) {
        if (tokenScopes.indexOf(scopesToCheck[i]) !== -1) return true;
      }
    }
  } catch (err) {
    return false;
  }

  return false;
};

/**
 * Checks if token contains all of the given scopes.
 *
 * @param {String} token - API token string.
 * @param {String[]} scopesToCheck - scopes to be checked against.
 */
export const containsAllOfScopes = (token, scopesToCheck) => {
  try {
    const decoded = jwtDecode(token);
    if (decoded.scope) {
      for (let i = 0; i < scopesToCheck.length; i += 1) {
        if (decoded.scope.indexOf(scopesToCheck[i]) === -1) return false;
      }
    }
  } catch (err) {
    return false;
  }

  return true;
};

/**
 * Retrieves the token level of a given token.
 *
 * 0 - Unauthenticated User out of Williams IP address
 * 1 - Unauthenticated User in Williams IP address
 * 3 - Authenticated User
 *
 * @param {String} token - API token string.
 */
export const getTokenLevel = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (decoded.tokenLevel) {
      return decoded.tokenLevel;
    }
  } catch (err) {
    return -1;
  }

  return -1;
};

/**
 * Capitalizes the first letter of the string.
 *
 * @param {String} string - String to be capitalized.
 */
export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
