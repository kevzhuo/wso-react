// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Redux/routing imports
import { connect } from "react-redux";
import { getAPI } from "../../../selectors/auth";

// Additional imports
import Ephmatcher from "./Ephmatcher";

const EphmatchMatch = ({ api }) => {
  const [matches, updateMatches] = useState([]);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const ephmatchersResponse = await api.ephmatchService.listMatches();
        updateMatches(ephmatchersResponse.data);
      } catch {
        // eslint-disable-next-line no-empty
      }
    };

    loadMatches();
  }, [api]);

  const renderMatches = () => {
    if (matches.length === 0)
      return <h1 className="no-matches-found">No matches.</h1>;

    return (
      <section>
        <h3>Matches</h3>
        <p>These Ephs have matched with you! Start the conversation!</p>
        <br />
        <div className="ephmatch-results">
          {matches.map((match) => (
            <Ephmatcher
              api={getAPI}
              ephmatcher={match.other}
              ephmatcherProfile={match.other.ephmatchProfile}
              key={match.id}
            />
          ))}
        </div>
      </section>
    );
  };

  return <article className="facebook-results">{renderMatches()}</article>;
};

EphmatchMatch.propTypes = { api: PropTypes.object.isRequired };

EphmatchMatch.defaultProps = {};

const mapStateToProps = (state) => ({
  api: getAPI(state),
});

export default connect(mapStateToProps)(EphmatchMatch);
