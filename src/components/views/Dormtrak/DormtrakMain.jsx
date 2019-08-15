// React imports
import React from "react";
import PropTypes from "prop-types";
import DormtrakHome from "./DormtrakHome";
import DormtrakLayout from "./DormtrakLayout";
import DormtrakPolicy from "./DormtrakPolicy";
import DormtrakShow from "./DormtrakShow";
import DormtrakSearch from "./DormtrakSearch";
import DormtrakNeighborhood from "./DormtrakNeighborhood";

// Redux imports
import { connect } from "react-redux";

// External Imports
import { createRouteNodeSelector } from "redux-router5";
import DormtrakReviewForm from "./DormtrakReviewForm";

const DormtrakMain = ({ route }) => {
  const dormtrakBody = () => {
    const splitRoute = route.name.split(".");
    if (splitRoute.length === 1) return <DormtrakHome />;

    switch (splitRoute[1]) {
      case "policy":
        return <DormtrakPolicy />;
      case "neighborhoods":
        return <DormtrakNeighborhood />;
      case "dorms":
        return <DormtrakShow />;
      case "newReview":
        return <DormtrakReviewForm edit={false} />;
      case "editReview":
        return <DormtrakReviewForm edit />;
      case "search":
        return <DormtrakSearch />;
      default:
        return <DormtrakHome />;
    }
  };

  return <DormtrakLayout>{dormtrakBody()}</DormtrakLayout>;
};

DormtrakMain.propTypes = {
  route: PropTypes.object.isRequired,
};

DormtrakMain.defaultProps = {};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("dormtrak");

  return (state) => ({
    ...routeNodeSelector(state),
  });
};

export default connect(mapStateToProps)(DormtrakMain);
