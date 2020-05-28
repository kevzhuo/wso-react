// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import EphmatchHome from "./EphmatchHome";
import EphmatchLayout from "./EphmatchLayout";
import EphmatchMatch from "./EphmatchMatch";
import EphmatchProfile from "./EphmatchProfile";
import EphmatchOptOut from "./EphmatchOptOut";
import EphmatchOptIn from "./EphmatchOptIn";

// Redux/Routing imports
import { connect } from "react-redux";
import { createRouteNodeSelector, actions } from "redux-router5";
import { getToken } from "../../../selectors/auth";

import { format } from "timeago.js";

// Additional Imports
import {
  scopes,
  containsScopes,
  checkAndHandleError,
} from "../../../lib/general";
import {
  getEphmatchMatches,
  getEphmatchAvailability,
  getEphmatchMatchesCount,
} from "../../../api/ephmatch";

const EphmatchMain = ({ route, token, navigateTo }) => {
  const [availability, updateAvailability] = useState(null);
  const [matches, updateMatches] = useState([]);
  const [matchesTotalCount, updateMatchesTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      const availabilityResp = await getEphmatchAvailability(token);
      if (checkAndHandleError(availabilityResp) && isMounted) {
        updateAvailability(availabilityResp.data.data);
      }
    };

    const loadMatches = async () => {
      const ephmatchersResponse = await getEphmatchMatches(token);
      if (checkAndHandleError(ephmatchersResponse)) {
        updateMatches(ephmatchersResponse.data.data);
      }
    };

    const loadMatchesCount = async () => {
      const ephmatchersCountResponse = await getEphmatchMatchesCount(token);
      if (checkAndHandleError(ephmatchersCountResponse)) {
        updateMatchesTotalCount(ephmatchersCountResponse.data.data.total);
      }
    };

    loadAvailability();

    loadMatchesCount();

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, [token, route]);

  const EphmatchBody = () => {
    // If token doesnt have access to matches or profiles, must mean they need to create a new account
    if (
      !containsScopes(token, [
        scopes.ScopeEphmatchMatches,
        scopes.ScopeEphmatchProfiles,
      ])
    ) {
      navigateTo("ephmatch", null, { replace: true });
      return <EphmatchOptIn />;
    }

    const splitRoute = route.name.split(".");
    if (splitRoute.length === 1) {
      // If token doesnt have access to profiles, must mean that ephmatch is closed for the year
      //  || new Date() < ephmatchEndDate
      if (
        containsScopes(token, [scopes.ScopeEphmatchProfiles]) &&
        availability?.available
      ) {
        return <EphmatchHome />;
      }

      return (
        <h1 className="no-matches-found">
          {availability &&
            (availability.nextOpenTime ? (
              <>
                Ephmatch has officially closed.
                <br />
                Will open again {format(availability.nextOpenTime)}.
              </>
            ) : (
              <>Ephmatch has officially closed for this year.</>
            ))}
        </h1>
      );
    }

    switch (splitRoute[1]) {
      case "profile":
        return <EphmatchProfile />;
      case "matches":
        return <EphmatchMatch matches={matches} />;
      case "optOut":
        return <EphmatchOptOut />;
      default:
        navigateTo("ephmatch");
        return null;
    }
  };

  if (containsScopes(token, [scopes.ScopeEphmatch])) {
    return (
      <EphmatchLayout
        token={token}
        matchesTotalCount={matchesTotalCount}
        available={availability?.available}
        closingTime={availability?.closingTime}
      >
        {EphmatchBody()}
      </EphmatchLayout>
    );
  }

  navigateTo("login");
  return null;
};

EphmatchMain.propTypes = {
  route: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

// EphmatchMain.defaultProps = { profile: null };

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("ephmatch");

  return (state) => ({
    token: getToken(state),
    ...routeNodeSelector(state),
  });
};

const mapDispatchToProps = (dispatch) => ({
  navigateTo: (location, params, opts) =>
    dispatch(actions.navigateTo(location, params, opts)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EphmatchMain);
